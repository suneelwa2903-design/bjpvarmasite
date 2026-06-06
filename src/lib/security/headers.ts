/**
 * Security Headers for API Routes
 * 
 * Apply security headers to API responses
 */

import { NextResponse } from 'next/server'

/**
 * Add security headers to an API response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers for API routes
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // CORS headers (adjust as needed for your use case)
  // For a public API, you might want to allow specific origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  const origin = response.headers.get('origin')
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
  }
  
  return response
}

/**
 * Create a secure API response with security headers
 */
export function createSecureResponse(
  data: unknown,
  status: number = 200,
  options?: { headers?: Record<string, string> }
): NextResponse {
  const response = NextResponse.json(data, { status })
  
  // Add security headers
  addSecurityHeaders(response)
  
  // Add custom headers if provided
  if (options?.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }
  
  return response
}

