import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const SUPER_USERS = [
  {
    email: 'mvsuneelkumar2903@gmail.com',
    name: 'M V Suneel Kumar',
  },
  {
    email: 'bhupathirajusrinivasvarma@gmail.com',
    name: 'Bhupathi Raju Srinivasa Varma',
  },
]

function getAuthToken(req: Request) {
  const header = req.headers.get('x-admin-reset-token')
  if (header) return header
  const { searchParams } = new URL(req.url)
  return searchParams.get('token')
}

export async function POST(req: Request) {
  // Hard-disabled in production. This endpoint creates admin accounts with
  // password = email — fine for dev/local convenience, catastrophic if reachable
  // in prod. Return 404 (not 403) so the endpoint is invisible to scanners.
  // Long-term replacement: scripts/bootstrap-admin.js CLI driven from a one-off
  // SSH session, with passwords from env vars.
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    // Use bracket access to avoid build-time inlining and ensure runtime lookup
    const expected = process.env['ADMIN_SUPER_TOKEN'] || process.env['ADMIN_RESET_TOKEN']
    const adminCount = await prisma.adminUser.count().catch(() => 0)
    const allowBootstrap = adminCount === 0

    const provided = getAuthToken(req)
    if (!allowBootstrap) {
      if (!expected) {
        return NextResponse.json({ success: false, error: 'Server missing ADMIN_SUPER_TOKEN/ADMIN_RESET_TOKEN' }, { status: 500 })
      }
      if (provided !== expected) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
    }

    const results: any[] = []

    for (const entry of SUPER_USERS) {
      const { email, name } = entry
      const passwordHash = await bcrypt.hash(email, 10)

      const adminUser = await prisma.adminUser.upsert({
        where: { username: email },
        update: { passwordHash },
        create: {
          username: email,
          passwordHash,
        },
      })

      const mibUser = await prisma.mibUser.upsert({
        where: { email },
        update: {
          name: name || email,
          role: 'OFFICE_ADMIN',
          active: true,
          passwordHash,
          emailVerifiedAt: new Date(),
        },
        create: {
          name: name || email,
          email,
          role: 'OFFICE_ADMIN',
          language: 'en',
          active: true,
          passwordHash,
          emailVerifiedAt: new Date(),
          marketingOptIn: true,
        },
      })

      results.push({
        email,
        adminUserId: adminUser.id,
        officeUserId: mibUser.id,
      })
    }

    return NextResponse.json({ success: true, data: results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Seeding failed' }, { status: 500 })
  }
}

