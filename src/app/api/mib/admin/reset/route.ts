import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  // Hard-disabled in production. This endpoint nukes every MibUser, MibTicket,
  // and downstream row. Even with a static env token, it should never be
  // reachable in prod. Return 404 so the route is invisible to scanners.
  // Long-term replacement: scripts/reset-mib.js CLI script.
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    const token = req.headers.get('x-admin-reset-token') || new URL(req.url).searchParams.get('token')
    const expected = process.env.ADMIN_RESET_TOKEN
    if (!expected || token !== expected) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Delete in safe order
    await prisma.mibTicketComment.deleteMany({})
    await prisma.mibTicketEvent.deleteMany({})
    await prisma.mibTicketAttachment.deleteMany({})
    await prisma.mibTicket.deleteMany({})
    await prisma.mibOtp.deleteMany({})
    await prisma.mibUser.deleteMany({})

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Reset failed' }, { status: 500 })
  }
}

