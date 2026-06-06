import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOfficeSession } from '@/lib/officeAuth'
import bcrypt from 'bcryptjs'
import { sendEmail } from '@/lib/email'
import { randomInt } from 'crypto'
import { checkRateLimit, getClientIdentifier, resetRateLimit } from '@/lib/security/rateLimit'

const OTP_EXPIRY_MINUTES = 10

function generateOtpCode(length = 6) {
  const digits = '0123456789'
  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += digits[randomInt(digits.length)]
  }
  return result
}

export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(`office-login:${clientId}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      lockoutMs: 30 * 60 * 1000,
      progressiveBackoff: true,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { email, password } = await req.json() as { email?: string; password?: string }
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 })
    }

    const user = await prisma.mibUser.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    if (!['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.active) {
      return NextResponse.json({ success: false, error: 'Account is inactive' }, { status: 403 })
    }

    if (!user.passwordHash) {
      return NextResponse.json({ success: false, error: 'Password not set. Please contact an administrator.' }, { status: 400 })
    }

    const expect = await bcrypt.compare(password, user.passwordHash)
    if (!expect) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    resetRateLimit(`office-login:${clientId}`)

    // OTP is NOT required for office/admin users — only for guest/citizen flows
    // All office users (ADMIN, AGENT, VIEWER) login with email+password only

    if (!user.emailVerifiedAt) {
      await prisma.mibUser.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      })
    }

    await createOfficeSession(user.id)
    return NextResponse.json({ success: true, data: { id: user.id, name: user.name, email: user.email } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Login failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
