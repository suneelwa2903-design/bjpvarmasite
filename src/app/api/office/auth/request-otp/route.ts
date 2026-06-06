import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { randomInt } from 'crypto'
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'

function generateCode() {
  return randomInt(100000, 999999).toString()
}

export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(`otp-request:${clientId}`, {
      maxAttempts: 3,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many OTP requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { email } = await req.json() as { email?: string }
    if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })

    const user = await prisma.mibUser.findUnique({ where: { email } })
    if (!user || !['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'].includes(user.role) || !user.active) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ success: false, error: 'Email already verified' }, { status: 400 })
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await prisma.mibOtp.deleteMany({ where: { userId: user.id, purpose: 'OFFICE_LOGIN' } })
    await prisma.mibOtp.create({ data: { userId: user.id, code, purpose: 'OFFICE_LOGIN', expiresAt } })

    const html = `<p>Your Office Portal OTP is <b>${code}</b>. It expires in 10 minutes.</p>`
    await sendEmail(email, 'Your Office OTP', html)

    return NextResponse.json({ success: true, otpExpiresAt: expiresAt.toISOString() })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to send OTP'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
