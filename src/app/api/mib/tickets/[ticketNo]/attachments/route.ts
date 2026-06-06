import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'

// Create attachment rows after a successful upload (expects JSON with file meta)
export async function POST(req: Request, context: { params: Promise<{ ticketNo: string }> }) {
  const session = await getCurrentSession()
  if (!session) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    const { ticketNo } = await context.params
    const body = await req.json()
    const { fileName, mimeType, sizeBytes, storageUrl } = body || {}
    if (!fileName || !mimeType || !sizeBytes || !storageUrl) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    const ticket = await prisma.mibTicket.findUnique({ where: { ticketNo } })
    if (!ticket) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    const att = await prisma.mibTicketAttachment.create({ data: { ticketId: ticket.id, fileName, mimeType, sizeBytes: Number(sizeBytes), storageUrl } })
    await prisma.mibTicketEvent.create({ data: { ticketId: ticket.id, eventType: 'ATTACHMENT', note: `Attachment added: ${fileName}` } })
    return NextResponse.json({ success: true, data: att })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to add attachment' }, { status: 500 })
  }
}


