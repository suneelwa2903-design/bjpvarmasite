import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOtp } from '@/lib/mibOtp'
import { sendPasswordResetEmail } from '@/lib/mibEmail'
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(`forgot:${clientId}`, {
      maxAttempts: 3,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many password reset attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { email } = body as { email?: string }

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    // Always return success to prevent user enumeration
    const user = await prisma.mibUser.findUnique({ where: { email } })

    if (user && user.emailVerifiedAt) {
      try {
        const { code } = await createOtp(user.id, 'MIB_PASSWORD_RESET')
        await sendPasswordResetEmail(email, code)
      } catch (otpError: unknown) {
        if (otpError instanceof Error && otpError.message === 'OTP_RATE_LIMIT') {
          return NextResponse.json({ success: true, data: { throttled: true } })
        }
        throw otpError
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unable to process request'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
