import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOtp } from '@/lib/mibOtp'
import { sendPasswordResetEmail } from '@/lib/mibEmail'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body as { email?: string }

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.mibUser.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with this email. Please create an account first.' }, { status: 404 })
    }

    // Check if user is an office user
    if (!['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'This email is not associated with an office account.' }, { status: 403 })
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json({ success: false, error: 'Email not verified. Please verify your email first or contact an administrator.' }, { status: 403 })
    }

    try {
      const { code } = await createOtp(user.id, 'MIB_PASSWORD_RESET')
      await sendPasswordResetEmail(email, code)
    } catch (otpError: any) {
      if (otpError?.message === 'OTP_RATE_LIMIT') {
        return NextResponse.json({ success: true, data: { throttled: true } })
      }
      throw otpError
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unable to process request' }, { status: 500 })
  }
}

