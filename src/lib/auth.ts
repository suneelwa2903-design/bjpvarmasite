import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSecureSession, getSecureSession, clearSecureSession, setSecureSessionCookie } from '@/lib/security/session'

const ADMIN_COOKIE = 'admin-session'

export interface AdminUser {
  id: string
  username: string
  passwordHash: string
}

export async function authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
  if (!username || !password) return null

  const admin = await prisma.adminUser.findUnique({ where: { username } })
  if (!admin) return null

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) return null

  return admin
}

export async function createSession(username: string): Promise<void> {
  const admin = await prisma.adminUser.findUnique({ where: { username } })
  if (!admin) return
  const token = await createSecureSession(admin.id, 'ADMIN', 0)
  await setSecureSessionCookie(token, ADMIN_COOKIE)
}

export async function getCurrentSession(): Promise<string | null> {
  const session = await getSecureSession(ADMIN_COOKIE)
  if (!session) return null
  const admin = await prisma.adminUser.findUnique({ where: { id: session.userId } })
  return admin ? admin.username : null
}

export async function clearSession(): Promise<void> {
  await clearSecureSession(ADMIN_COOKIE)
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession()
  return session !== null
}

export async function isSessionValid(): Promise<boolean> {
  return await isAuthenticated()
}
