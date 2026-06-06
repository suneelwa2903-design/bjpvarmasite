/**
 * CSRF protection utilities
 * 
 * Two approaches:
 * 1. CSRF tokens (Synchronizer Token Pattern)
 * 2. Double-Submit Cookie Pattern
 * 
 * For write endpoints, we recommend using Bearer tokens instead of cookies
 * to eliminate CSRF risk entirely.
 */

import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Set CSRF token in cookie (for Double-Submit pattern)
 */
export async function setCsrfCookie(token: string): Promise<void> {
  const jar = await cookies()
  jar.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JavaScript for Double-Submit
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  })
}

/**
 * Get CSRF token from cookie
 */
export async function getCsrfCookie(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(CSRF_COOKIE_NAME)?.value || null
}

/**
 * Verify CSRF token (Double-Submit Cookie Pattern)
 * Token must be in both cookie and header
 */
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  const cookieToken = await getCsrfCookie()
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  
  if (!cookieToken || !headerToken) {
    return false
  }
  
  // Tokens must match exactly
  return cookieToken === headerToken
}

/**
 * Check if request needs CSRF protection
 * Only POST, PUT, PATCH, DELETE need protection
 */
export function requiresCsrfProtection(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
}

/**
 * Verify CSRF for state-changing requests
 * Throws error if verification fails
 */
export async function requireCsrfProtection(request: Request): Promise<void> {
  if (!requiresCsrfProtection(request.method)) {
    return // GET requests don't need CSRF protection
  }
  
  const isValid = await verifyCsrfToken(request)
  if (!isValid) {
    throw new Error('CSRF token verification failed')
  }
}

/**
 * Alternative: Check for Bearer token (no CSRF risk)
 * If Bearer token is present, skip CSRF check
 */
export function hasBearerToken(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  return authHeader?.startsWith('Bearer ') ?? false
}

