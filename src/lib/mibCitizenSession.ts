import { prisma } from '@/lib/prisma'
import {
  createSecureSession,
  getSecureSession,
  clearSecureSession,
  setSecureSessionCookie,
} from '@/lib/security/session'

// Cookie name follows the existing `<scope>-session` convention used by
// admin (`admin-session`) and office (`office-session`).
const MIB_COOKIE = 'mib-session'

export async function setMibCitizenSession(userId: string) {
  const user = await prisma.mibUser.findUnique({ where: { id: userId } })
  if (!user || user.role !== 'CITIZEN') return
  const token = await createSecureSession(userId, 'CITIZEN', 0)
  await setSecureSessionCookie(token, MIB_COOKIE)
}

export async function clearMibCitizenSession() {
  await clearSecureSession(MIB_COOKIE)
}

// Returns the MibUser record for the currently-authenticated citizen, or
// null. Defensive: re-checks role from the DB at every call so a user who
// gets promoted to OFFICE_* can't keep acting through a stale citizen cookie.
export async function getMibCitizenSession() {
  const session = await getSecureSession(MIB_COOKIE)
  if (!session) return null
  const user = await prisma.mibUser.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, mobile: true, role: true, active: true },
  })
  if (!user || !user.active || user.role !== 'CITIZEN') return null
  return user
}
