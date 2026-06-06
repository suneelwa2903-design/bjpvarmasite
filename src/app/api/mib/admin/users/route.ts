import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'

export async function GET() {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.mibUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      active: true,
      createdAt: true,
      emailVerifiedAt: true,
    },
  })

  return NextResponse.json({ success: true, data: users })
}

export async function PATCH(req: Request) {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { id, name, mobile, role, active } = await req.json() as any
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    await prisma.mibUser.update({
      where: { id },
      data: {
        name,
        mobile,
        role,
        active,
      },
    })
    return NextResponse.json({ success: true })
  } catch (e:any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id') || ''
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    const user = await prisma.mibUser.findUnique({ where: { id } })
    if (!user) return NextResponse.json({ success: true })
    const ticketCount = await prisma.mibTicket.count({ where: { createdById: id } })
    if (ticketCount > 0) {
      return NextResponse.json({ success: false, error: `Cannot delete user with ${ticketCount} ticket(s). Please reassign or archive tickets first.` }, { status: 409 })
    }
    if (['mvsuneelkumar2903@gmail.com', 'bhupathirajusrinivasvarma@gmail.com'].includes(user.email || '')) {
      return NextResponse.json({ success: false, error: 'Super admin accounts cannot be deleted.' }, { status: 409 })
    }
    // Delete dependent records
    await prisma.mibTicketComment.deleteMany({ where: { authorUserId: id } })
    await prisma.mibTicketEvent.deleteMany({ where: { actorUserId: id } })
    await prisma.mibOtp.deleteMany({ where: { userId: id } })
    await prisma.mibUser.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e:any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to delete' }, { status: 500 })
  }
}

