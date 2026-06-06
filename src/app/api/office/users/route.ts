import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOfficeSessionUser } from '@/lib/officeAuth'

export async function GET() {
  const user = await getOfficeSessionUser()
  if (!user) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  // VIEWER and AGENT see only what the assignment dropdown needs (id, name, role).
  // ADMIN gets the full directory including email/mobile for org management.
  const isAdmin = user.role === 'OFFICE_ADMIN'

  try {
    const users = await prisma.mibUser.findMany({
      where: {
        role: { in: ['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'] },
        active: true
      },
      orderBy: { name: 'asc' },
      select: isAdmin
        ? { id: true, name: true, email: true, mobile: true, role: true, createdAt: true }
        : { id: true, name: true, role: true }
    })
    return NextResponse.json({ success: true, data: users })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to load users' }, { status: 500 })
  }
}

