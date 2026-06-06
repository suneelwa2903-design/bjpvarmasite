import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOfficeSession } from '@/lib/officeAuth'
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(`otp-verify:${clientId}`, {
      maxAttempts: 5,
      windowMs: 10 * 60 * 1000, // 10 minutes
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please request a new code.' },
        { status: 429 }
      )
    }

    const { email, code } = await req.json() as { email?: string; code?: string }
    if (!email || !code) return NextResponse.json({ success: false, error: 'Email and code required' }, { status: 400 })

    const user = await prisma.mibUser.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ success: false, error: 'Invalid verification' }, { status: 400 })

    const otp = await prisma.mibOtp.findFirst({ where: { userId: user.id, purpose: 'OFFICE_LOGIN' }, orderBy: { createdAt: 'desc' } })
    if (!otp) return NextResponse.json({ success: false, error: 'Code expired' }, { status: 400 })

    if (otp.code !== code) {
      // After 5 failed attempts, invalidate the OTP entirely
      if (!rateLimit.allowed || rateLimit.remaining <= 0) {
        await prisma.mibOtp.deleteMany({ where: { userId: user.id, purpose: 'OFFICE_LOGIN' } })
      }
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 400 })
    }

    if (new Date(otp.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: 'Code expired' }, { status: 400 })
    }

    await prisma.mibOtp.deleteMany({ where: { userId: user.id, purpose: 'OFFICE_LOGIN' } })

    if (!user.emailVerifiedAt) {
      await prisma.mibUser.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      })
    }

    await createOfficeSession(user.id)
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
