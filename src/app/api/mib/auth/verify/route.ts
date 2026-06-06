import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { invalidateOtp, verifyOtp } from '@/lib/mibOtp'
import { setMibCitizenSession } from '@/lib/mibCitizenSession'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, code } = body as { email?: string; code?: string }

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and code are required' }, { status: 400 })
    }

    const user = await prisma.mibUser.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ success: true, data: { emailVerified: true } })
    }

    const otp = await verifyOtp(user.id, 'MIB_EMAIL_VERIFY', code)
    if (!otp) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 })
    }

    await prisma.mibUser.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), active: true },
    })

    await invalidateOtp(user.id, 'MIB_EMAIL_VERIFY')

    // Auto-login post-verification: password was already validated at register;
    // OTP just confirmed email ownership. Setting the session here skips a
    // redundant login screen.
    await setMibCitizenSession(user.id)

    return NextResponse.json({ success: true, data: { emailVerified: true } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Verification failed' }, { status: 500 })
  }
}

