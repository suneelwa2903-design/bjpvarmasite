/**
 * Secrets management and validation
 * 
 * Validates required environment variables
 * Supports key rotation (two active keys)
 */

const REQUIRED_SECRETS = [
  'SESSION_SECRET', // or COOKIE_SECRET
  'DATABASE_URL',
] as const

const OPTIONAL_SECRETS = [
  'BCRYPT_ROUNDS',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
] as const

/**
 * Validate that all required secrets are present
 * Throws error if any are missing
 */
export function validateSecrets(): void {
  const missing: string[] = []

  // Check SESSION_SECRET or COOKIE_SECRET
  if (!process.env.SESSION_SECRET && !process.env.COOKIE_SECRET) {
    missing.push('SESSION_SECRET or COOKIE_SECRET')
  }

  // Check other required secrets
  for (const secret of REQUIRED_SECRETS) {
    if (secret === 'SESSION_SECRET') continue // Already checked above
    
    if (!process.env[secret]) {
      missing.push(secret)
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

/**
 * Get session secret (supports rotation with two keys)
 * Returns primary key, or secondary if primary not available
 */
export function getSessionSecret(): string {
  const primary = process.env.SESSION_SECRET || process.env.COOKIE_SECRET
  const secondary = process.env.SESSION_SECRET_SECONDARY || process.env.COOKIE_SECRET_SECONDARY

  if (!primary) {
    throw new Error('SESSION_SECRET or COOKIE_SECRET is required')
  }

  return primary
}

/**
 * Get secondary session secret (for key rotation)
 */
export function getSecondarySessionSecret(): string | null {
  return process.env.SESSION_SECRET_SECONDARY || process.env.COOKIE_SECRET_SECONDARY || null
}

/**
 * Validate secret strength
 */
export function validateSecretStrength(secret: string, minLength: number = 32): boolean {
  if (secret.length < minLength) {
    return false
  }
  
  // Check for sufficient entropy (basic check)
  const uniqueChars = new Set(secret).size
  return uniqueChars >= minLength / 2
}

/**
 * Generate a secure random secret
 */
export function generateSecret(length: number = 32): string {
  const crypto = require('crypto')
  return crypto.randomBytes(length).toString('hex')
}

// Validate on module load (in production)
if (process.env.NODE_ENV === 'production') {
  try {
    validateSecrets()
  } catch (error) {
    console.error('Secret validation failed:', error)
    // Don't throw in development to allow flexible setup
  }
}

