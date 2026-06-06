import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin, createSession, clearSession, isSessionValid } from '@/lib/auth'
import { checkRateLimit, getClientIdentifier, resetRateLimit } from '@/lib/security/rateLimit'
import { createSecureResponse } from '@/lib/security/headers'
import { sanitizeText } from '@/lib/security/sanitize'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent brute force attacks
    const clientId = getClientIdentifier(request)
    const rateLimit = checkRateLimit(clientId, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
      progressiveBackoff: true,
    })
    
    if (!rateLimit.allowed) {
      return createSecureResponse(
        { error: 'Too many login attempts. Please try again later.' },
        429,
        {
          headers: {
            'Retry-After': rateLimit.lockedUntil 
              ? Math.ceil((rateLimit.lockedUntil - Date.now()) / 1000).toString()
              : '900',
          },
        }
      )
    }
    
    const { username, password } = await request.json()
    
    // Sanitize and validate input
    const sanitizedUsername = sanitizeText(username)?.trim()
    const sanitizedPassword = sanitizeText(password)?.trim()
    
    if (!sanitizedUsername || !sanitizedPassword) {
      return createSecureResponse(
        { error: 'Username and password are required' },
        400
      )
    }
    
    // Additional validation
    if (sanitizedUsername.length > 100 || sanitizedPassword.length > 200) {
      return createSecureResponse(
        { error: 'Invalid input' },
        400
      )
    }

    const adminUser = await authenticateAdmin(sanitizedUsername, sanitizedPassword)
    if (adminUser) {
      resetRateLimit(clientId)

      await createSession(adminUser.username)
      return createSecureResponse({
        success: true,
        message: 'Login successful',
        username: adminUser.username,
      })
    } else {
      // Don't reveal whether username exists (security best practice)
      return createSecureResponse(
        { error: 'Invalid credentials' },
        401
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return createSecureResponse(
      { error: 'Internal server error' },
      500
    )
  }
}

export async function DELETE() {
  try {
    await clearSession()
    return createSecureResponse({
      success: true,
      message: 'Logout successful',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return createSecureResponse(
      { error: 'Internal server error' },
      500
    )
  }
}

export async function GET() {
  try {
    const isValid = await isSessionValid()
    return createSecureResponse({ 
      authenticated: isValid 
    })
  } catch (error) {
    console.error('Session check error:', error)
    return createSecureResponse(
      { error: 'Internal server error' },
      500
    )
  }
}
