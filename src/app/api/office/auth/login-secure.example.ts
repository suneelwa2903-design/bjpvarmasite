/**
 * EXAMPLE: Secure login route with all security features
 * 
 * This is a reference implementation showing how to integrate:
 * - Rate limiting
 * - Secure password verification
 * - Password rehashing
 * - Secure session management
 * - Uniform error messages
 * 
 * Copy this pattern to your actual login routes.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, rehashIfNeeded } from '@/lib/security/password'
import { checkRateLimit, resetRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'
import { createSecureSession, setSecureSessionCookie } from '@/lib/security/session'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json() as { email?: string; password?: string }
    
    // Input validation
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password required' 
      }, { status: 400 })
    }

    // Rate limiting - use email as identifier (prevents enumeration)
    const identifier = getClientIdentifier(req, email.toLowerCase())
    const rateLimit = checkRateLimit(identifier, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
    })

    if (!rateLimit.allowed) {
      // Uniform error message (prevents enumeration)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' // Same message as wrong password
      }, { status: 401 })
    }

    // Fetch user - uniform error if not found (prevents enumeration)
    const user = await prisma.mibUser.findUnique({ where: { email: email.toLowerCase() } })
    
    // Always return same error message (prevents user enumeration)
    if (!user || 
        !['OFFICE_ADMIN','OFFICE_AGENT','OFFICE_VIEWER'].includes(user.role) ||
        !user.active ||
        !user.passwordHash) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }

    // Verify password
    const validPassword = await verifyPassword(password, user.passwordHash)
    
    if (!validPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' // Same message as user not found
      }, { status: 401 })
    }

    // Rehash password if needed (e.g., after increasing bcrypt rounds)
    const newHash = await rehashIfNeeded(password, user.passwordHash)
    if (newHash) {
      // Update hash in background (don't block login)
      prisma.mibUser.update({ 
        where: { id: user.id }, 
        data: { passwordHash: newHash } 
      }).catch(console.error)
    }

    // Reset rate limit on successful login
    resetRateLimit(identifier)

    // Create secure session
    // TODO: Get sessionVersion from user record (increment on password/role change)
    const sessionVersion = 0 // Replace with actual version from DB
    const token = await createSecureSession(user.id, user.role, sessionVersion)
    await setSecureSessionCookie(token)

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    })
  } catch (e: any) {
    console.error('Login error:', e)
    // Don't expose internal errors
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed' 
    }, { status: 500 })
  }
}

