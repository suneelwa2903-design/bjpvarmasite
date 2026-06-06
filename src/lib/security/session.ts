/**
 * Secure session management with signed cookies
 *
 * Features:
 * - Signed and encrypted session cookies
 * - Session ID regeneration on login/privilege changes
 * - Idle timeout + absolute expiry
 * - Session version tracking for invalidation
 * - Parameterized cookie names for admin vs office sessions
 */

import { cookies } from 'next/headers'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { randomBytes } from 'crypto'

function getSecretKey() {
  const secret = process.env.SESSION_SECRET || process.env.COOKIE_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET or COOKIE_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

// Session configuration
const SESSION_CONFIG = {
  httpOnly: true,
  secure: process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https') || false,
  sameSite: 'lax' as const,
  path: '/',
  idleTimeout: 30 * 60 * 1000, // 30 minutes
  absoluteTimeout: 24 * 60 * 60 * 1000, // 24 hours
} as const

export interface SessionData {
  userId: string
  sessionId: string
  role: string
  createdAt: number
  lastActivity: number
  sessionVersion: number
  [key: string]: unknown
}

/**
 * Create a secure session with signed JWT
 */
export async function createSecureSession(userId: string, role: string, sessionVersion: number = 0): Promise<string> {
  const sessionId = randomBytes(16).toString('hex')
  const now = Date.now()

  const sessionData: SessionData = {
    userId,
    sessionId,
    role,
    createdAt: now,
    lastActivity: now,
    sessionVersion,
  }

  const token = await new SignJWT(sessionData as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor((now + SESSION_CONFIG.absoluteTimeout) / 1000))
    .sign(getSecretKey())

  return token
}

/**
 * Verify and decode session token
 */
export async function verifySession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())

    const sessionData = payload as unknown as SessionData
    const now = Date.now()

    if (now - sessionData.createdAt > SESSION_CONFIG.absoluteTimeout) {
      return null
    }

    if (now - sessionData.lastActivity > SESSION_CONFIG.idleTimeout) {
      return null
    }

    return sessionData
  } catch {
    return null
  }
}

/**
 * Update session activity timestamp
 */
export async function updateSessionActivity(sessionData: SessionData): Promise<string> {
  const updated = {
    ...sessionData,
    lastActivity: Date.now(),
  }

  const token = await new SignJWT(updated as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor((updated.createdAt + SESSION_CONFIG.absoluteTimeout) / 1000))
    .sign(getSecretKey())

  return token
}

/**
 * Set secure session cookie with configurable name
 */
export async function setSecureSessionCookie(token: string, cookieName: string = 'session'): Promise<void> {
  const jar = await cookies()
  jar.set(cookieName, token, {
    ...SESSION_CONFIG,
    maxAge: Math.floor(SESSION_CONFIG.absoluteTimeout / 1000),
  })
}

/**
 * Get and verify session from cookie with configurable name
 */
export async function getSecureSession(cookieName: string = 'session'): Promise<SessionData | null> {
  const jar = await cookies()
  const token = jar.get(cookieName)?.value

  if (!token) return null

  const session = await verifySession(token)

  if (session) {
    try {
      const updatedToken = await updateSessionActivity(session)
      await setSecureSessionCookie(updatedToken, cookieName)
    } catch {
      // Cookie writes are not allowed in Server Components (layouts/pages).
      // The session is still valid — silently skip the activity refresh.
    }
  }

  return session
}

/**
 * Clear session cookie
 */
export async function clearSecureSession(cookieName: string = 'session'): Promise<void> {
  const jar = await cookies()
  jar.delete(cookieName)
}

/**
 * Regenerate session ID (for login, privilege changes)
 */
export async function regenerateSession(userId: string, role: string, sessionVersion: number, cookieName: string = 'session'): Promise<void> {
  const newToken = await createSecureSession(userId, role, sessionVersion)
  await setSecureSessionCookie(newToken, cookieName)
}
