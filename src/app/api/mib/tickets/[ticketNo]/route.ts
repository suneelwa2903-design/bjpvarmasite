import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'

export async function GET(_: Request, context: { params: Promise<{ ticketNo: string }> }) {
  const session = await getCurrentSession()
  if (!session) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  const { ticketNo } = await context.params
  if (!ticketNo) return NextResponse.json({ success: false, error: 'Missing ticketNo' }, { status: 400 })

  const ticket = await prisma.mibTicket.findUnique({ where: { ticketNo } })
  if (!ticket) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true, data: ticket })
}
