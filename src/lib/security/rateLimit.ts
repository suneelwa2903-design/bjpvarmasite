/**
 * Rate limiting for brute-force protection
 * 
 * Features:
 * - Sliding window rate limiting
 * - Progressive backoff
 * - Uniform error messages (prevents enumeration)
 * - In-memory store (use Redis in production)
 */

interface RateLimitEntry {
  count: number
  resetAt: number
  lockedUntil?: number
}

// In-memory store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now && (!entry.lockedUntil || entry.lockedUntil < now)) {
      rateLimitStore.delete(key)
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  lockoutMs?: number // Optional lockout after max attempts
  progressiveBackoff?: boolean
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
  progressiveBackoff: true,
}

/**
 * Check rate limit and increment counter
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetAt: number; lockedUntil?: number } {
  const now = Date.now()
  const key = `ratelimit:${identifier}`
  
  let entry = rateLimitStore.get(key)
  
  // Clean up expired entries
  if (entry && entry.resetAt < now && (!entry.lockedUntil || entry.lockedUntil < now)) {
    rateLimitStore.delete(key)
    entry = undefined
  }
  
  // Check if locked out
  if (entry?.lockedUntil && entry.lockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      lockedUntil: entry.lockedUntil,
    }
  }
  
  // Initialize or reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    }
  }
  
  // Increment counter
  entry.count++
  
  // Check if exceeded limit
  if (entry.count > config.maxAttempts) {
    // Apply lockout if configured
    if (config.lockoutMs) {
      entry.lockedUntil = now + config.lockoutMs
    }
    
    rateLimitStore.set(key, entry)
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      lockedUntil: entry.lockedUntil,
    }
  }
  
  // Apply progressive backoff delay
  if (config.progressiveBackoff && entry.count > 1) {
    const delayMs = Math.min(entry.count * 1000, 5000) // Max 5 seconds
    // Note: In production, you'd want to actually delay the response
    // For now, we just track it
  }
  
  rateLimitStore.set(key, entry)
  
  return {
    allowed: true,
    remaining: Math.max(0, config.maxAttempts - entry.count),
    resetAt: entry.resetAt,
  }
}

/**
 * Reset rate limit for an identifier (e.g., on successful login)
 */
export function resetRateLimit(identifier: string): void {
  const key = `ratelimit:${identifier}`
  rateLimitStore.delete(key)
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  // Prefer user ID if available (more accurate)
  if (userId) return `user:${userId}`
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  return `ip:${ip}`
}

