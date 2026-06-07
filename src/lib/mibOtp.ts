import { prisma } from '@/lib/prisma'
import { randomInt } from 'crypto'

const OTP_EXPIRY_MINUTES = 15
const OTP_RESEND_WINDOW_MS = 60 * 1000

export type MibOtpPurpose = 'MIB_EMAIL_VERIFY' | 'MIB_PASSWORD_RESET' | 'ADMIN_PASSWORD_RESET'

export function generateOtpCode(length = 6) {
  const digits = '0123456789'
  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += digits[randomInt(digits.length)]
  }
  return result
}

export async function createOtp(userId: string, purpose: MibOtpPurpose) {
  const now = new Date()
  const recentOtp = await prisma.mibOtp.findFirst({
    where: { userId, purpose },
    orderBy: { createdAt: 'desc' },
  })

  if (recentOtp && now.getTime() - recentOtp.createdAt.getTime() < OTP_RESEND_WINDOW_MS) {
    const error = new Error('OTP_RATE_LIMIT')
    ;(error as any).retryAfter = Math.ceil((OTP_RESEND_WINDOW_MS - (now.getTime() - recentOtp.createdAt.getTime())) / 1000)
    throw error
  }

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
  const code = generateOtpCode()

  await prisma.mibOtp.deleteMany({
    where: {
      userId,
      purpose,
    },
  })

  await prisma.mibOtp.create({
    data: {
      userId,
      purpose,
      code,
      expiresAt,
    },
  })

  return { code, expiresAt }
}

export async function verifyOtp(userId: string, purpose: MibOtpPurpose, code: string) {
  const otp = await prisma.mibOtp.findFirst({
    where: {
      userId,
      purpose,
      code,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  return otp
}

export async function invalidateOtp(userId: string, purpose: MibOtpPurpose) {
  await prisma.mibOtp.deleteMany({
    where: { userId, purpose },
  })
}

