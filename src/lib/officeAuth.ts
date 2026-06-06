import { prisma } from '@/lib/prisma'
import { createSecureSession, getSecureSession, clearSecureSession, setSecureSessionCookie } from '@/lib/security/session'

const OFFICE_COOKIE = 'office-session'

export async function createOfficeSession(userId: string) {
  const user = await prisma.mibUser.findUnique({ where: { id: userId } })
  const role = user?.role || 'OFFICE_VIEWER'
  const token = await createSecureSession(userId, role, 0)
  await setSecureSessionCookie(token, OFFICE_COOKIE)
}

export async function clearOfficeSession() {
  await clearSecureSession(OFFICE_COOKIE)
}

export async function getOfficeSessionUser() {
  const session = await getSecureSession(OFFICE_COOKIE)
  if (!session) return null
  const user = await prisma.mibUser.findUnique({ where: { id: session.userId } })
  if (!user) return null
  if (!user.active) return null
  if (!['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'].includes(user.role)) return null
  return user
}
