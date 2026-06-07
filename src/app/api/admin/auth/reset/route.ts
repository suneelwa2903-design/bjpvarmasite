import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { invalidateOtp, verifyOtp } from '@/lib/mibOtp'

/**
 * Admin password reset — verifies the OTP issued by /api/admin/auth/forgot
 * against the corresponding MibUser, then updates the AdminUser.passwordHash.
 * Both records are keyed by the same email/username for our two seeded admins.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, code, password } = body as { username?: string; code?: string; password?: string }

    if (!username || !code || !password) {
      return NextResponse.json(
        { success: false, error: 'Username, code, and new password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const email = username.trim().toLowerCase()

    const admin = await prisma.adminUser.findUnique({ where: { username: email } })
    const mibUser = await prisma.mibUser.findUnique({ where: { email } })

    if (!admin || !mibUser) {
      return NextResponse.json({ success: false, error: 'Invalid reset request' }, { status: 400 })
    }

    const otp = await verifyOtp(mibUser.id, 'ADMIN_PASSWORD_RESET', code)
    if (!otp) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash },
    })

    await invalidateOtp(mibUser.id, 'ADMIN_PASSWORD_RESET')

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'Unable to reset password' },
      { status: 500 }
    )
  }
}
