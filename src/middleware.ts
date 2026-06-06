/**
 * Next.js Middleware - Security Headers, CSRF Protection & Request Processing
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

// Routes exempt from CSRF (public API endpoints that don't use cookies for auth)
const CSRF_EXEMPT_ROUTES = [
  '/api/whatsapp/webhook', // WhatsApp webhook uses signature verification
  '/api/admin/superusers', // Bootstrap endpoint
  '/api/admin/auth', // Admin login — has its own rate limiting
  '/api/office/auth', // Office auth — has its own rate limiting
  '/api/mib/auth', // MIB auth — has its own rate limiting
  '/api/newsletter/subscribe', // Public newsletter signup
  '/api/contact', // Public contact form
]

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl

  // Set pathname header so root layout can detect admin/office routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Security Headers (apply to all routes)
  const securityHeaders: Record<string, string> = {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widgets.sociablekit.com https://*.sociablekit.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://widgets.sociablekit.com https://*.sociablekit.com https://maxcdn.bootstrapcdn.com",
      "img-src 'self' data: https: http: blob:",
      "font-src 'self' data: https://fonts.gstatic.com https://maxcdn.bootstrapcdn.com",
      "connect-src 'self' https://widgets.sociablekit.com https://*.sociablekit.com https://data.accentapi.com https://*.accentapi.com",
      "frame-src 'self' https://widgets.sociablekit.com https://*.sociablekit.com https://www.youtube.com https://www.google.com https://maps.google.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      ...(process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https') ? ["upgrade-insecure-requests"] : []),
    ].join('; '),

    'Permissions-Policy': [
      'accelerometer=()',
      'autoplay=(self "https://widgets.sociablekit.com" "https://www.youtube.com")',
      'camera=()',
      'display-capture=()',
      'encrypted-media=(self "https://widgets.sociablekit.com" "https://www.youtube.com")',
      'fullscreen=(self "https://widgets.sociablekit.com" "https://www.youtube.com")',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'picture-in-picture=(self "https://widgets.sociablekit.com" "https://www.youtube.com")',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=(self)',
      'xr-spatial-tracking=()',
      'clipboard-read=()',
      'clipboard-write=(self)',
      'unload=(self)',
    ].join(', '),

    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...(process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https') ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' } : {}),
    'X-XSS-Protection': '1; mode=block',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    ...(process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https') ? { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' } : {}),
    'Cross-Origin-Resource-Policy': 'cross-origin',
  }

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  response.headers.delete('X-Powered-By')

  // CSRF Protection
  const isApiRoute = pathname.startsWith('/api/')
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  const isExempt = CSRF_EXEMPT_ROUTES.some(route => pathname.startsWith(route))

  // Set CSRF cookie on page loads if not present
  if (!isApiRoute && request.method === 'GET') {
    const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
    if (!existingToken) {
      const token = generateCsrfToken()
      response.cookies.set(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Must be readable by JavaScript for Double-Submit
        secure: process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https') || false,
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60,
      })
    }
  }

  // Verify CSRF token on state-changing API requests
  if (isApiRoute && isStateChanging && !isExempt) {
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
    const headerToken = request.headers.get(CSRF_HEADER_NAME)

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return NextResponse.json(
        { error: 'CSRF token verification failed' },
        { status: 403 }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
