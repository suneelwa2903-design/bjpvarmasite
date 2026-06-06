import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getMibCitizenSession } from '@/lib/mibCitizenSession'
import { sanitizeHtml } from '@/lib/security/sanitize'

// Citizens reply to NEED_INFO with a comment. Identity comes from the
// `mib-session` cookie; legacy `email`/`mobile` body fields are silently
// dropped (stale clients still work — they just hit the 401 from the missing
// session and the client-side handler redirects to login).
export async function POST(req: Request, context: { params: Promise<{ ticketNo: string }> }) {
  try {
    const user = await getMibCitizenSession()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const { ticketNo } = await context.params
    const body = await req.json()
    const { text, attachments } = body as { text: string; attachments?: Array<{ fileName: string; mimeType: string; sizeBytes: number; storageUrl: string }> }
    if (!text?.trim()) return NextResponse.json({ success: false, error: 'Missing text' }, { status: 400 })

    const ticket = await prisma.mibTicket.findUnique({ where: { ticketNo } })
    if (!ticket) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Ownership check: only the citizen who created the ticket can comment on it.
    if (ticket.createdById !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Sanitize once on write. Render paths still call sanitizeHtml() too — this
    // is defense-in-depth so the stored value is safe even if a future render
    // path forgets, and so the email-notification interpolation below is XSS-free.
    const safeBodyHtml = sanitizeHtml(text.trim())

    const comment = await prisma.mibTicketComment.create({
      data: {
        ticketId: ticket.id,
        authorUserId: null,
        isInternal: false,
        bodyHtml: safeBodyHtml,
      }
    })

    // Persist any provided attachments metadata
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      for (const a of attachments) {
        if (a?.fileName && a?.mimeType && a?.sizeBytes && a?.storageUrl) {
          await prisma.mibTicketAttachment.create({ data: { ticketId: ticket.id, fileName: a.fileName, mimeType: a.mimeType, sizeBytes: Number(a.sizeBytes), storageUrl: a.storageUrl } })
          await prisma.mibTicketEvent.create({ data: { ticketId: ticket.id, eventType: 'ATTACHMENT', note: `Attachment added: ${a.fileName}` } })
        }
      }
    }

    // Move NEED_INFO -> OPEN on citizen response
    let newStatus = ticket.status
    if (ticket.status === 'NEED_INFO') {
      const updated = await prisma.mibTicket.update({ where: { id: ticket.id }, data: { status: 'OPEN' } })
      newStatus = updated.status
      await prisma.mibTicketEvent.create({
        data: { ticketId: ticket.id, eventType: 'STATUS_CHANGED', fromValue: 'NEED_INFO', toValue: 'OPEN', note: 'Citizen provided more information' }
      })
    }

    await prisma.mibTicketEvent.create({
      data: { ticketId: ticket.id, eventType: 'COMMENT', note: `EXTERNAL: ${text.substring(0, 140)}` }
    })

    if (ticket.email) {
      const html = `<p>We received your update for ticket <b>${ticket.ticketNo}</b>.</p><p>${safeBodyHtml}</p>`
      try { await sendEmail(ticket.email, `Ticket ${ticket.ticketNo}: Update received`, html) } catch {}
    }

    return NextResponse.json({ success: true, data: { status: newStatus, commentId: comment.id } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to submit comment' }, { status: 500 })
  }
}


