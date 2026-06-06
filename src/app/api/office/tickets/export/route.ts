import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOfficeSessionUser } from '@/lib/officeAuth'

export async function GET(req: Request) {
  const user = await getOfficeSessionUser()
  if (!user) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const source = searchParams.get('source') || undefined

    const where: any = {}
    if (status) where.status = status
    if (source) where.source = source

    // Office users (non-admin) only see tickets assigned to them
    // Admin users see all tickets
    if (user.role !== 'OFFICE_ADMIN') {
      where.assignedToId = user.id
    }

    const tickets = await prisma.mibTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true, role: true } }
      }
    })

    // Generate XLSX-like CSV (can be enhanced with actual XLSX library later)
    const header = ['Ticket No', 'Source', 'Applicant', 'Mobile', 'Email', 'Category', 'Type', 'District', 'Owner', 'Status', 'Priority', 'Created', 'Aging (days)']
    const rows = tickets.map(t => {
      const now = Date.now()
      const days = Math.max(0, Math.floor((now - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
      return [
        t.ticketNo,
        t.source || 'PUBLIC',
        t.applicantName,
        t.mobile,
        t.email || '',
        t.category,
        t.categoryType,
        t.district,
        t.assignedTo ? `${t.assignedTo.name} (${t.assignedTo.role.replace('OFFICE_', '')})` : 'Unassigned',
        t.status,
        t.priority,
        t.createdAt.toISOString(),
        days.toString()
      ]
    })

    const csv = [header.join(','), ...rows.map(r => r.map(v => {
      const s = v === null || v === undefined ? '' : String(v)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }).join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="office-tickets.csv"'
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 500 })
  }
}

