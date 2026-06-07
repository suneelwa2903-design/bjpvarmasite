import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOtp } from '@/lib/mibOtp'
import { sendPasswordResetEmail } from '@/lib/mibEmail'
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'

/**
 * Admin (CMS) forgot-password — sends an OTP to the email matching the
 * admin's username. Our admins use their Gmail addresses as usernames and
 * also exist as OFFICE_ADMIN MibUser rows with the same email, so we reuse
 * the existing OTP + email-sending infrastructure keyed off the MibUser id.
 * The actual password write happens in /api/admin/auth/reset against the
 * AdminUser row.
 */
export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(`admin-forgot:${clientId}`, {
      maxAttempts: 3,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many reset attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { username } = body as { username?: string }

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username (email) is required' }, { status: 400 })
    }

    const email = username.trim().toLowerCase()

    // Always return success to prevent username enumeration. Only send the OTP
    // if the username matches an existing AdminUser AND a corresponding MibUser
    // exists to anchor the OTP / email.
    const admin = await prisma.adminUser.findUnique({ where: { username: email } })
    const mibUser = await prisma.mibUser.findUnique({ where: { email } })

    if (admin && mibUser) {
      try {
        const { code } = await createOtp(mibUser.id, 'ADMIN_PASSWORD_RESET')
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
