/**
 * Client-side API helper that auto-includes CSRF token
 */

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)

  const method = (options.method || 'GET').toUpperCase()
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken)
    }
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  })
}
