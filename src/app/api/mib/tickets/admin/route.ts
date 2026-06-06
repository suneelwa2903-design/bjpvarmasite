import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { signAttachments } from '@/lib/storage'

export async function GET(req: Request) {
  try {
    const user = await getOfficeSessionUser()
    if (!user) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const take = Math.min(parseInt(searchParams.get('take') || '200', 10), 500)
    const status = searchParams.get('status') || undefined
    const source = searchParams.get('source') || undefined

    const where: any = {}
    if (status) where.status = status
    if (source) where.source = source

    // All office users (ADMIN, AGENT, VIEWER) can view all tickets
    // No filtering by assignedToId - all office portal users see everything

    // Auto-close RESOLVED tickets older than 24h
    const now = Date.now()
    const resolvedOld = await prisma.mibTicket.findMany({ where: { status: 'RESOLVED' } })
    await Promise.all(resolvedOld.map(async (t) => {
      const ageMs = now - new Date(t.updatedAt).getTime()
      if (ageMs > 24 * 60 * 60 * 1000) {
        await prisma.mibTicket.update({ where: { id: t.id }, data: { status: 'CLOSED', closedAt: new Date() } })
        await prisma.mibTicketEvent.create({ data: { ticketId: t.id, eventType: 'STATUS_CHANGED', fromValue: 'RESOLVED', toValue: 'CLOSED', note: 'Auto-closed after 24h' } })
      }
    }))

    const tickets = await prisma.mibTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        attachments: true,
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        },
      },
    })

    // Sign private-bucket attachment keys before returning to office UI.
    // Permission already gated by getOfficeSessionUser() above.
    const signed = await Promise.all(
      tickets.map(async (t) => ({ ...t, attachments: await signAttachments(t.attachments) }))
    )

    return NextResponse.json({ success: true, data: signed })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to load' }, { status: 500 })
  }
}


