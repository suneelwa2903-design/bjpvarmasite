import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Validate DATABASE_URL at module load.
// Production: required. Dev: allow missing — page-level callers guard with
// `process.env.DATABASE_URL && !process.env.SKIP_DB_QUERIES`, and dropping the
// throw here lets `next build` succeed in environments without a DB attached.
function ensureDatabaseUrl(): void {
  const dbUrl = process.env.DATABASE_URL?.trim()
  if (!dbUrl) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL is required in production')
    }
    return
  }
  const isValidUrl =
    dbUrl.startsWith('postgresql://') ||
    dbUrl.startsWith('postgres://') ||
    dbUrl.startsWith('file:')
  if (!isValidUrl) {
    throw new Error(
      `DATABASE_URL must start with 'postgresql://', 'postgres://', or 'file:'. ` +
      `Current value: ${dbUrl.substring(0, 30)}...`
    )
  }
}
ensureDatabaseUrl()

// ---- Prisma singleton ----
const prismaClient =
  globalThis.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prismaClient
}

export const prisma = prismaClient
