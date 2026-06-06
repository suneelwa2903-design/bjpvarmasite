import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { sanitizeHtml } from '@/lib/security/sanitize'

export async function POST(req: Request, context: { params: Promise<{ ticketNo: string }> }) {
  const session = await getCurrentSession()
  if (!session) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { ticketNo } = await context.params
    const body = await req.json()
    const { text, visibility } = body as { text: string; visibility: 'INTERNAL' | 'EXTERNAL' }
    if (!text || !visibility) return NextResponse.json({ success: false, error: 'Missing text/visibility' }, { status: 400 })

    const ticket = await prisma.mibTicket.findUnique({ where: { ticketNo } })
    if (!ticket) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Sanitize on write. Defense-in-depth alongside the render-time
    // sanitizeHtml() in the office/admin ticket-detail pages, and also makes
    // the email-notification interpolation below safe.
    const safeBodyHtml = sanitizeHtml(text)

    const comment = await prisma.mibTicketComment.create({
      data: {
        ticketId: ticket.id,
        authorUserId: null, // Admin session is just username string, not a user ID
        isInternal: visibility === 'INTERNAL',
        bodyHtml: safeBodyHtml,
      }
    })

    await prisma.mibTicketEvent.create({
      data: {
        ticketId: ticket.id,
        eventType: 'COMMENT',
        note: `${visibility}: ${text.substring(0, 140)}`,
      }
    })

    // Notify applicant for EXTERNAL comments
    if (visibility === 'EXTERNAL' && ticket.email) {
      const html = `<p>Your ticket <b>${ticket.ticketNo}</b> has a new update:</p><p>${safeBodyHtml}</p>`
      try { await sendEmail(ticket.email, `Ticket ${ticket.ticketNo}: New update`, html) } catch {}
    }

    return NextResponse.json({ success: true, data: comment })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to add comment' }, { status: 500 })
  }
}


