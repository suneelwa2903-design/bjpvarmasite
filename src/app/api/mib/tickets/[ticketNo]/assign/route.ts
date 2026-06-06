import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { canAssignTickets } from '@/lib/permissions'

export async function PATCH(request: Request, context: { params: Promise<{ ticketNo: string }> }) {
  const user = await getOfficeSessionUser()
  if (!user) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { ticketNo } = await context.params
    const body = await request.json()
    const { assignedToId, comment } = body as { assignedToId: string | null; comment?: string }

    // Only admins can assign tickets
    if (!canAssignTickets(user.role as any)) {
      return NextResponse.json({ success: false, error: 'Forbidden: Only admins can assign tickets' }, { status: 403 })
    }

    const ticket = await prisma.mibTicket.findUnique({ where: { ticketNo } })
    if (!ticket) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Verify the assigned user exists and is an office user
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

    const previousAssigneeId = ticket.assignedToId
    
    // Get the new assigned user's name for the event note
    let assignedUserName = null
    if (assignedToId) {
      const assignedUser = await prisma.mibUser.findUnique({
        where: { id: assignedToId },
        select: { name: true }
      })
      assignedUserName = assignedUser?.name || null
    }
    
    const updated = await prisma.mibTicket.update({
      where: { id: ticket.id },
      data: { assignedToId: assignedToId || null },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    // Use assigned user name from updated result if we don't have it yet
    if (assignedToId && !assignedUserName && updated.assignedTo) {
      assignedUserName = updated.assignedTo.name
    }

    // Create event for assignment - always include user name in note for display
    const eventNote = comment && comment.trim() 
      ? comment.trim()
      : assignedToId && assignedUserName
        ? `Ticket assigned to ${assignedUserName}`
        : assignedToId
        ? 'Ticket assigned'
        : 'Ticket unassigned'

    // Create event for assignment
    // Store user ID in toValue for reference, but display name comes from note
    await prisma.mibTicketEvent.create({
      data: {
        ticketId: ticket.id,
        actorUserId: user.id,
        eventType: 'ASSIGNED',
        fromValue: previousAssigneeId || null,
        toValue: assignedToId || null, // Store ID for reference
        note: eventNote // Store name in note for display
      }
    })

    return NextResponse.json({ success: true, data: { assignedTo: updated.assignedTo, assignedToId: updated.assignedToId } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to assign ticket' }, { status: 500 })
  }
}

