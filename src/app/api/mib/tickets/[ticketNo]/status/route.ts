import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getCurrentSession } from '@/lib/auth'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { canChangeStatus } from '@/lib/permissions'

const STATUSES = ['CREATED','OPEN','IN_PROGRESS','NEED_INFO','RESOLVED','CLOSED'] as const
const ALLOWED: Record<string, string[]> = {
  CREATED: ['OPEN'],
  OPEN: ['IN_PROGRESS', 'NEED_INFO', 'RESOLVED'],
  IN_PROGRESS: ['NEED_INFO', 'RESOLVED'],
  NEED_INFO: ['OPEN'], // admin can put back to OPEN, but usually citizen reply does it (see citizen-comment route)
  RESOLVED: ['CLOSED'],
  CLOSED: [],
}

export async function PATCH(request: Request, context: { params: Promise<{ ticketNo: string }> }) {
  const session = await getCurrentSession()
  const office = await getOfficeSessionUser()
  if (!session && !office) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    const { ticketNo } = await context.params
    const body = await request.json()
    const { action, note, assignedToId } = body as { action: string; note?: string; assignedToId?: string | null }
    if (!note || !note.trim()) return NextResponse.json({ success: false, error: 'Comment is required' }, { status: 400 })
    if (!STATUSES.includes(action as any)) return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })

    const ticket = await prisma.mibTicket.findUnique({ where: { ticketNo } })
    if (!ticket) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Check permissions: Only ADMIN and AGENT (on assigned tickets) can change status
    // VIEWER cannot change status
    if (office) {
      if (!canChangeStatus(office.role as any, ticket.assignedToId, office.id)) {
        return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to change ticket status' }, { status: 403 })
      }
    }

    const fromOriginal = ticket.status
    const from = fromOriginal === 'NEW' ? 'CREATED' : fromOriginal
    if (from === action) return NextResponse.json({ success: true, data: { status: from } })
    if (!ALLOWED[from]?.includes(action)) {
      return NextResponse.json({ success: false, error: `Transition ${from} -> ${action} not allowed` }, { status: 400 })
    }

    // Verify assigned user if provided
    // Only admins can assign tickets (change assignedToId)
    if (assignedToId !== undefined && assignedToId !== ticket.assignedToId) {
      if (office && office.role !== 'OFFICE_ADMIN') {
        return NextResponse.json({ success: false, error: 'Forbidden: Only admins can assign tickets' }, { status: 403 })
      }
      if (assignedToId) {
        const assignedUser = await prisma.mibUser.findUnique({
          where: { id: assignedToId },
          select: { id: true, role: true, active: true }
        })
        if (!assignedUser || !assignedUser.active) {
          return NextResponse.json({ success: false, error: 'Invalid user' }, { status: 400 })
        }
        if (!['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'].includes(assignedUser.role)) {
          return NextResponse.json({ success: false, error: 'User must be an office user' }, { status: 400 })
        }
      }
    }

    let nextStatus = action
    let closedAt: Date | null = null
    if (action === 'CLOSED') closedAt = new Date()

    const updateData: any = { status: nextStatus, closedAt }
    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId || null
    }

    const updated = await prisma.mibTicket.update({
      where: { id: ticket.id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    const actorId = office?.id || (session as any).userId || null
    
    // Create status change event
    await prisma.mibTicketEvent.create({
      data: { ticketId: ticket.id, actorUserId: actorId, eventType: 'STATUS_CHANGED', fromValue: fromOriginal, toValue: nextStatus, note }
    })

    // Create assignment event if owner changed
    if (assignedToId !== undefined && ticket.assignedToId !== assignedToId) {
      let assignedUserName = null
      if (assignedToId) {
        assignedUserName = updated.assignedTo?.name || null
        // If not in the updated result, fetch it
        if (!assignedUserName) {
          const assignedUser = await prisma.mibUser.findUnique({
            where: { id: assignedToId },
            select: { name: true }
          })
          assignedUserName = assignedUser?.name || null
        }
      }
      
      // Create event note with user name for display in timeline
      const assignNote = assignedToId && assignedUserName
        ? `Ticket assigned to ${assignedUserName} during status change`
        : assignedToId
        ? 'Ticket assigned during status change'
        : 'Ticket unassigned during status change'
      await prisma.mibTicketEvent.create({
        data: {
          ticketId: ticket.id,
          actorUserId: actorId,
          eventType: 'ASSIGNED',
          fromValue: ticket.assignedToId || null,
          toValue: assignedToId || null, // Store ID for reference
          note: assignNote // Store name in note for display
        }
      })
    }

    if (ticket.email) {
      const html = `<p>Your ticket <b>${ticket.ticketNo}</b> status changed: ${fromOriginal} → ${nextStatus}.</p>${note ? `<p>Note: ${note}</p>` : ''}`
      await sendEmail(ticket.email, `Ticket ${ticket.ticketNo}: ${nextStatus}`, html)
    }

    return NextResponse.json({ success: true, data: { status: nextStatus, assignedTo: updated.assignedTo, assignedToId: updated.assignedToId } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to update status' }, { status: 500 })
  }
}
