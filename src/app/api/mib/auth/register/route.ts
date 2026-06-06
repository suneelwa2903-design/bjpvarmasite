import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createOtp } from '@/lib/mibOtp'
import { sendVerificationCodeEmail } from '@/lib/mibEmail'
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(`register:${clientId}`, {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const {
      name,
      email,
      mobile,
      password,
      marketingOptIn,
    } = body as { name?: string; email?: string; mobile?: string; password?: string; marketingOptIn?: boolean }

    if (!name || !email || !mobile || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, mobile and password are required' }, { status: 400 })
    }

    const existingEmail = await prisma.mibUser.findUnique({ where: { email } })
    if (existingEmail) return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 })
    const existingMobile = await prisma.mibUser.findUnique({ where: { mobile } })
    if (existingMobile) return NextResponse.json({ success: false, error: 'Mobile already registered' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.mibUser.create({
      data: {
        name,
        email,
        mobile,
        role: 'CITIZEN',
        language: 'en',
        passwordHash,
        marketingOptIn: Boolean(marketingOptIn),
      },
    })

    try {
      const { code, expiresAt } = await createOtp(user.id, 'MIB_EMAIL_VERIFY')
      await sendVerificationCodeEmail(email, code)

      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          emailVerified: Boolean(user.emailVerifiedAt),
          otpExpiresAt: expiresAt,
        },
      }, { status: 201 })
    } catch (otpError: unknown) {
      if (otpError instanceof Error && otpError.message === 'OTP_RATE_LIMIT') {
        return NextResponse.json({ success: false, error: 'Please wait a moment before requesting another code.' }, { status: 429 })
      }
      throw otpError
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Registration failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
