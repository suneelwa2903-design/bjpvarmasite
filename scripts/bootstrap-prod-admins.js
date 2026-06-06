/* eslint-disable no-console */
/**
 * Production admin bootstrap. Creates the two pre-defined super-admin accounts
 * on a freshly-deployed Cloud SQL database.
 *
 * This is intentionally separate from scripts/seed-super-admins.js (which
 * refuses to run in production per Wave 1 hardening). This script is the one
 * sanctioned way to create those two specific accounts on the live DB.
 *
 * Safety gates:
 *   1. Requires the `--confirm-production` flag (loud opt-in; no accidental runs).
 *   2. Requires both passwords via env vars, each >=12 chars.
 *   3. Hardcoded to seed only the two named accounts — cannot be repurposed
 *      to create arbitrary accounts.
 *   4. Idempotent: if the accounts already exist, updates the password hash
 *      and active flag; never errors with "user already exists".
 *
 * Usage on the VM after `prisma migrate deploy` completes:
 *
 *   SUNEEL_ADMIN_PASSWORD='...' VARMA_ADMIN_PASSWORD='...' \
 *     node scripts/bootstrap-prod-admins.js --confirm-production
 *
 * Generate the two passwords in a password manager (Bitwarden, 1Password,
 * etc.). NEVER commit them, NEVER paste them in chat, NEVER reuse from another
 * service. After seeding, change them at first login via the admin UI.
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
    name: 'Bhupathiraju Srinivasa Varma',
    passwordEnv: 'VARMA_ADMIN_PASSWORD',
  },
]

const BCRYPT_ROUNDS = 12

function requireConfirmationFlag() {
  if (!process.argv.includes('--confirm-production')) {
    console.error('Refusing to run without --confirm-production.')
    console.error('This script writes to the production database. Re-invoke as:')
    console.error('')
    console.error('  SUNEEL_ADMIN_PASSWORD=\'...\' VARMA_ADMIN_PASSWORD=\'...\' \\')
    console.error('    node scripts/bootstrap-prod-admins.js --confirm-production')
    console.error('')
    process.exit(1)
  }
}

function requirePasswords() {
  const missing = []
  const tooShort = []
  for (const u of SUPER_USERS) {
    const pw = process.env[u.passwordEnv]
    if (!pw) {
      missing.push(u.passwordEnv)
    } else if (pw.length < 12) {
      tooShort.push(u.passwordEnv)
    }
  }
  if (missing.length > 0 || tooShort.length > 0) {
    if (missing.length > 0) {
      console.error('Missing password env vars:')
      missing.forEach((e) => console.error(`  ${e}`))
    }
    if (tooShort.length > 0) {
      console.error('Passwords must be at least 12 characters:')
      tooShort.forEach((e) => console.error(`  ${e}`))
    }
    console.error('')
    console.error('Generate strong passwords from a password manager and re-invoke.')
    process.exit(1)
  }
}

async function main() {
  requireConfirmationFlag()
  requirePasswords()

  console.log('Bootstrapping production admins...')
  console.log(`Target database: ${maskDbUrl(process.env.DATABASE_URL || '')}`)
  console.log('')

  for (const entry of SUPER_USERS) {
    const { email, name, passwordEnv } = entry
    const password = process.env[passwordEnv]
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // CMS AdminUser row.
    const adminUser = await prisma.adminUser.upsert({
      where: { username: email },
      update: { passwordHash },
      create: { username: email, passwordHash },
    })

    // Office MibUser row (role OFFICE_ADMIN).
    const mibUser = await prisma.mibUser.upsert({
      where: { email },
      update: {
        name,
        role: 'OFFICE_ADMIN',
        active: true,
        passwordHash,
        emailVerifiedAt: new Date(),
      },
      create: {
        name,
        email,
        role: 'OFFICE_ADMIN',
        language: 'en',
        active: true,
        passwordHash,
        emailVerifiedAt: new Date(),
        marketingOptIn: true,
      },
    })

    console.log(`  Seeded: ${email}`)
    console.log(`    AdminUser id:  ${adminUser.id}`)
    console.log(`    MibUser id:    ${mibUser.id}`)
  }

  console.log('')
  console.log('Done. Both accounts can now log in at:')
  console.log('  CMS:    https://bjpvarma.co.in/admin')
  console.log('  Office: https://bjpvarma.co.in/office/login')
  console.log('')
  console.log('Strongly recommended: log in immediately and rotate both passwords')
  console.log('via the admin UI so the bootstrap env-var values can be discarded.')
}

function maskDbUrl(url) {
  // Mask the password portion of a postgres URL for the log line.
  return url.replace(/(\/\/[^:]+:)([^@]+)(@)/, '$1***$3')
}

main()
  .catch((err) => {
    console.error('Bootstrap failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
