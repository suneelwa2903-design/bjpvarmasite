import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { getCurrentSession } from '@/lib/auth'
import { canSetETA } from '@/lib/permissions'

export async function PATCH(request: Request, context: { params: Promise<{ ticketNo: string }> }) {
  const user = await getOfficeSessionUser()
  const session = await getCurrentSession()
  if (!user && !session) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { ticketNo } = await context.params
    const body = await request.json()
    const { eta } = body as { eta?: string | null }

    const ticket = await prisma.mibTicket.findUnique({ where: { ticketNo } })
    if (!ticket) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Check permissions: Only ADMIN and AGENT (on assigned tickets) can set ETA
    // VIEWER cannot set ETA
    if (user) {
      if (!canSetETA(user.role as any, ticket.assignedToId, user.id)) {
        return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to set ETA' }, { status: 403 })
      }
    }

    const updated = await prisma.mibTicket.update({
      where: { id: ticket.id },
      data: { eta: eta ? new Date(eta) : null },
    })

    const actorId = user?.id || (session as any)?.userId || null

    // Create event for ETA change
    await prisma.mibTicketEvent.create({
      data: {
        ticketId: ticket.id,
        actorUserId: actorId,
        eventType: 'COMMENT',
        note: eta 
          ? `ETA set to ${new Date(eta).toLocaleString()}`
          : 'ETA cleared'
      }
    })

    return NextResponse.json({ success: true, data: { eta: updated.eta } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to update ETA' }, { status: 500 })
  }
}

