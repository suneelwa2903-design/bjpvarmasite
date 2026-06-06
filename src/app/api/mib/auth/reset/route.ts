import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { invalidateOtp, verifyOtp } from '@/lib/mibOtp'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, code, password } = body as { email?: string; code?: string; password?: string }

    if (!email || !code || !password) {
      return NextResponse.json({ success: false, error: 'Email, code and password are required' }, { status: 400 })
    }

    const user = await prisma.mibUser.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid reset link or code' }, { status: 400 })
    }

    const otp = await verifyOtp(user.id, 'MIB_PASSWORD_RESET', code)
    if (!otp) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.mibUser.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    await invalidateOtp(user.id, 'MIB_PASSWORD_RESET')

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unable to reset password' }, { status: 500 })
  }
}

