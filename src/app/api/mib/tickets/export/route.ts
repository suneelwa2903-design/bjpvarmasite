import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'

function toCsvRow(values: (string | number | null | undefined)[]) {
  return values.map(v => {
    const s = v === null || v === undefined ? '' : String(v)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }).join(',')
}

export async function GET() {
  const session = await getCurrentSession()
  if (!session) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  const tickets = await prisma.mibTicket.findMany({ orderBy: { createdAt: 'desc' } })
  const header = ['ticketNo','applicantName','mobile','email','category','categoryType','state','district','mandal','ward','pincode','status','priority','createdAt']
  const rows = tickets.map(t => toCsvRow([
    t.ticketNo, t.applicantName, t.mobile, t.email, t.category, t.categoryType, t.state, t.district, t.mandal, t.ward, t.pincode, t.status, t.priority, t.createdAt.toISOString()
  ]))
  const csv = [header.join(','), ...rows].join('\n')
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="tickets.csv"' } })
}
