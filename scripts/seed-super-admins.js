/* eslint-disable no-console */
/**
 * Seed two pre-defined super-admin accounts (both AdminUser and MibUser
 * OFFICE_ADMIN). Hardened: this script previously hashed the user's email as
 * the password, which was harmless in dev but catastrophic if it ever ran in
 * production. It now:
 *
 *   - Refuses to run unless invoked with `--force`.
 *   - Requires passwords to be supplied via env vars (one per account).
 *   - Refuses to run when NODE_ENV === 'production'. Use a CLI bootstrap script
 *     for prod instead.
 *
 * Usage (local):
 *   SUNEEL_ADMIN_PASSWORD='...' VARMA_ADMIN_PASSWORD='...' \
 *     node scripts/seed-super-admins.js --force
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const SUPER_USERS = [
  {
    email: 'mvsuneelkumar2903@gmail.com',
    name: 'M V Suneel Kumar',
    passwordEnv: 'SUNEEL_ADMIN_PASSWORD',
  },
  {
    email: 'bhupathirajusrinivasvarma@gmail.com',
    name: 'Bhupathi Raju Srinivasa Varma',
    passwordEnv: 'VARMA_ADMIN_PASSWORD',
  },
]

function refuseInProduction() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run seed-super-admins.js in production.')
    console.error('In production, create admins via a one-off CLI bootstrap script and rotate the password immediately.')
    process.exit(1)
  }
}

function requireForceFlag() {
  if (!process.argv.includes('--force')) {
    console.error('This script no longer runs without --force.')
    console.error('Re-invoke with --force after exporting passwords:')
    for (const u of SUPER_USERS) {
      console.error(`  ${u.passwordEnv}='...'`)
    }
    process.exit(1)
  }
}

function requirePasswords() {
  const missing = SUPER_USERS.filter((u) => !process.env[u.passwordEnv] || process.env[u.passwordEnv].length < 12)
  if (missing.length > 0) {
    console.error('Refusing to seed: missing or too-short passwords (need >=12 chars).')
    for (const u of missing) {
      console.error(`  ${u.passwordEnv} for ${u.email}`)
    }
    process.exit(1)
  }
}

async function main() {
  refuseInProduction()
  requireForceFlag()
  requirePasswords()

  for (const entry of SUPER_USERS) {
    const { email, name, passwordEnv } = entry
    const password = process.env[passwordEnv]
    const passwordHash = await bcrypt.hash(password, 10)

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

    console.log('Seeded super admin:', {
      email,
      adminUserId: adminUser.id,
      officeUserId: mibUser.id,
    })
  }
}

main()
  .catch((err) => {
    console.error('Failed to seed super admins:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
