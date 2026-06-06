import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOtp } from '@/lib/mibOtp'
import { sendVerificationCodeEmail } from '@/lib/mibEmail'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body as { email?: string }

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.mibUser.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ success: true, data: { emailVerified: true } })
    }

    try {
      const { code, expiresAt } = await createOtp(user.id, 'MIB_EMAIL_VERIFY')
      await sendVerificationCodeEmail(email, code)

      return NextResponse.json({ success: true, data: { otpExpiresAt: expiresAt } })
    } catch (otpError: any) {
      if (otpError?.message === 'OTP_RATE_LIMIT') {
        return NextResponse.json({ success: false, error: 'Please wait before requesting another verification code.' }, { status: 429 })
      }
      throw otpError
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unable to resend code' }, { status: 500 })
  }
}

