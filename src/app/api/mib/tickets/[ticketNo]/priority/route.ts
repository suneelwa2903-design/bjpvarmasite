import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { sendEmail } from '@/lib/email'
import { canChangePriority } from '@/lib/permissions'

const ALLOWED = ['P1','P2','P3','P4']

export async function PATCH(req: Request, context: { params: Promise<{ ticketNo: string }> }) {
  const session = await getCurrentSession()
  const office = await getOfficeSessionUser()
  if (!session && !office) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { ticketNo } = await context.params
    const body = await req.json()
    const { priority, note, notify } = body as { priority: string; note?: string; notify?: boolean }
    if (!ALLOWED.includes(priority)) return NextResponse.json({ success: false, error: 'Invalid priority' }, { status: 400 })

    const ticket = await prisma.mibTicket.findUnique({ where: { ticketNo } })
    if (!ticket) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Check permissions: Only ADMIN and AGENT (on assigned tickets) can change priority
    // VIEWER cannot change priority
    if (office) {
      if (!canChangePriority(office.role as any, ticket.assignedToId, office.id)) {
        return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to change ticket priority' }, { status: 403 })
      }
    }

    const from = ticket.priority
    if (from === priority) return NextResponse.json({ success: true, data: { priority } })

    const updated = await prisma.mibTicket.update({ where: { id: ticket.id }, data: { priority } })

    await prisma.mibTicketEvent.create({
      data: {
        ticketId: ticket.id,
        actorUserId: office?.id || (session as any).userId || null,
        eventType: 'PRIORITY',
        fromValue: from,
        toValue: priority,
        note,
      }
    })

    if (notify && ticket.email) {
      const html = `<p>Your ticket <b>${ticket.ticketNo}</b> priority changed: ${from} → ${priority}.</p>${note ? `<p>Note: ${note}</p>` : ''}`
      try { await sendEmail(ticket.email, `Ticket ${ticket.ticketNo}: Priority ${priority}`, html) } catch {}
    }

    return NextResponse.json({ success: true, data: { priority: updated.priority } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to update priority' }, { status: 500 })
  }
}


