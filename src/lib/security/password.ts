/**
 * Secure password hashing and verification
 * 
 * Uses native bcrypt (faster and more secure than bcryptjs)
 * Cost factor: 12-14 (adjust based on server performance)
 */

import bcrypt from 'bcrypt'

// Bcrypt cost factor - higher = more secure but slower
// 12-14 is recommended for production (takes ~250-500ms)
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)

if (BCRYPT_ROUNDS < 10 || BCRYPT_ROUNDS > 15) {
  throw new Error('BCRYPT_ROUNDS must be between 10 and 15')
}

/**
 * Hash a password using bcrypt
 * Returns the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }
  
  return await bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verify a password against a hash
 * Returns true if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false
  }
  
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    // Log error but don't expose details
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * Check if a hash needs to be rehashed (e.g., after increasing rounds)
 * Returns true if hash should be regenerated
 */
export async function needsRehash(hash: string): Promise<boolean> {
  // Extract rounds from bcrypt hash (format: $2b$rounds$...)
  const match = hash.match(/\$2[abxy]\$(\d+)\$/)
  if (!match) {
    return true // Invalid hash format, needs rehash
  }
  
  const hashRounds = parseInt(match[1], 10)
  return hashRounds < BCRYPT_ROUNDS
}

/**
 * Rehash password if needed (call after successful login)
 * Returns new hash if rehashed, null if not needed
 */
export async function rehashIfNeeded(password: string, currentHash: string): Promise<string | null> {
  if (await needsRehash(currentHash)) {
    return await hashPassword(password)
  }
  return null
}

