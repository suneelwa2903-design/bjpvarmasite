import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

function ensureAdmin(session: any) {
  // Using existing admin session guard (admin portal)
  return !!session
}

export async function GET() {
  const session = await getCurrentSession()
  if (!ensureAdmin(session)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  const users = await prisma.mibUser.findMany({
    where: { role: { in: ['OFFICE_ADMIN','OFFICE_AGENT','OFFICE_VIEWER'] } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, mobile: true, role: true, active: true, createdAt: true }
  })
  return NextResponse.json({ success: true, data: users })
}

const MIN_PASSWORD_LENGTH = 8

export async function POST(req: Request) {
  const session = await getCurrentSession()
  if (!ensureAdmin(session)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    const { name, email, mobile, role, password } = await req.json() as any
    if (!email || !role) return NextResponse.json({ success: false, error: 'Email and role required' }, { status: 400 })
    const normalizedRole = (role as string) || 'OFFICE_VIEWER'
    if (!['OFFICE_ADMIN','OFFICE_AGENT','OFFICE_VIEWER'].includes(normalizedRole)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }
    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json({ success: false, error: 'password is required' }, { status: 400 })
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 })
    }

    // Check for mobile uniqueness if mobile is provided
    if (mobile) {
      const existingMobile = await prisma.mibUser.findUnique({ where: { mobile } })
      if (existingMobile && existingMobile.email !== email) {
        return NextResponse.json({ success: false, error: 'Mobile number already in use by another user' }, { status: 409 })
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const existing = await prisma.mibUser.findUnique({ where: { email } })

    if (existing) {
      const updateData: any = {
        name: name || existing.name || email,
        mobile: mobile || null,
        role: normalizedRole,
        active: true,
        // Explicit password always rewrites the hash — no email-as-default
        // fallback. Caller must pass a real password.
        passwordHash,
      }

      if (
        normalizedRole === 'OFFICE_ADMIN' &&
        !existing.emailVerifiedAt
      ) {
        updateData.emailVerifiedAt = new Date()
      }

      const user = await prisma.mibUser.update({
        where: { id: existing.id },
        data: updateData,
        select: { id: true },
      })

      return NextResponse.json({ success: true, data: { id: user.id } })
    }

    const emailVerifiedAt = normalizedRole === 'OFFICE_ADMIN' ? new Date() : null

    const user = await prisma.mibUser.create({
      data: {
        name: name || email,
        email,
        mobile: mobile || null,
        role: normalizedRole,
        active: true,
        passwordHash,
        emailVerifiedAt,
      },
      select: { id: true },
    })

    return NextResponse.json({ success: true, data: { id: user.id } })
  } catch (e:any) {
    // Handle unique constraint violations more gracefully
    if (e?.code === 'P2002') {
      const field = e?.meta?.target?.[0] || 'field'
      return NextResponse.json({ success: false, error: `${field === 'mobile' ? 'Mobile' : 'Email'} already exists` }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: e?.message || 'Failed to save' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getCurrentSession()
  if (!ensureAdmin(session)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    const { id, role, active, name, mobile, password } = await req.json() as any
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })

    const updateData: any = { role, active, name, mobile }

    // Password is optional on PATCH — if absent, the existing hash is left
    // untouched. If present, it must meet the minimum length. Never default
    // to the email or any other derived value.
    if (password !== undefined) {
      if (typeof password !== 'string' || password.length === 0) {
        return NextResponse.json({ success: false, error: 'password must be a non-empty string' }, { status: 400 })
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json({ success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 })
      }
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    await prisma.mibUser.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true })
  } catch (e:any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getCurrentSession()
  if (!ensureAdmin(session)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id') || ''
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    await prisma.mibUser.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e:any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to delete' }, { status: 500 })
  }
}


