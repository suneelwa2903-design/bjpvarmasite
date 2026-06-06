import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { checkRateLimit, getClientIdentifier, resetRateLimit } from '@/lib/security/rateLimit'
import { setMibCitizenSession } from '@/lib/mibCitizenSession'

export async function POST(req: NextRequest) {
  try {
    const clientId = getClientIdentifier(req)
    const rateLimit = checkRateLimit(clientId, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      lockoutMs: 30 * 60 * 1000,
      progressiveBackoff: true,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      )
    }

    const body = await req.json()
    const { email, password } = body as { email?: string; password?: string }
    if (!email || !password) return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })

    const user = await prisma.mibUser.findUnique({ where: { email } })

    // Generic error to prevent user enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json({ success: false, error: 'Email not verified' }, { status: 403 })
    }

    if (!user.active) {
      return NextResponse.json({ success: false, error: 'Account is inactive. Contact support.' }, { status: 403 })
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    resetRateLimit(clientId)

    // Set the citizen session cookie. setMibCitizenSession is a no-op if the
    // user isn't CITIZEN role — but the auth flow above only reaches here for
    // password-verified MibUsers, so CITIZEN is the expected case.
    await setMibCitizenSession(user.id)

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Login failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
