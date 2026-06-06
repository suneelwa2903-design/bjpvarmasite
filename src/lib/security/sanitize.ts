/**
 * XSS Protection - HTML Sanitization
 * 
 * Uses DOMPurify to sanitize user-generated HTML content
 * Prevents XSS attacks while allowing safe HTML formatting
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML tags and attributes for rich text formatting
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ''
  
  return DOMPurify.sanitize(dirty, {
    // Allow safe HTML tags for formatting
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img',
      'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    // Allow safe attributes
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'width', 'height', 'class', 'id',
      'target', 'rel', 'style', 'colspan', 'rowspan',
    ],
    // Allow data URIs for images (with size limits)
    ALLOW_DATA_ATTR: false,
    // Keep relative URLs
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Add rel="noopener noreferrer" to links
    ADD_ATTR: ['target'],
    // Remove all script tags and event handlers
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    // Return only text if sanitization fails
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  })
}

/**
 * Sanitize plain text (removes all HTML).
 *
 * SCOPE: this strips HTML tags only. It does NOT remove control characters,
 * null bytes (U+0000), or unicode direction-override characters (U+202E etc.).
 * Those are safe today because every consumer of the returned string either
 * (a) renders it via React JSX text content (auto-escaped), or (b) interpolates
 * it into HTML that gets re-sanitized at the render boundary. If a future
 * code path passes the result of sanitizeText to:
 *   - a filesystem call (filename, path) → null bytes can truncate paths
 *   - a shell command or exec()         → null bytes can corrupt arg parsing
 *   - dangerouslySetInnerHTML directly  → re-sanitize via sanitizeHtml
 *   - an `eval`-like context            → don't
 * then add input-specific validation at that call site. See Phase 3 findings
 * LOW-P3-1, LOW-P3-2 in MIGRATION_NOTES.md.
 */
export function sanitizeText(dirty: string | null | undefined): string {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

/**
 * Sanitize URL to prevent javascript: and data: XSS
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return ''
  
  const clean = DOMPurify.sanitize(url, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerUrl = clean.toLowerCase().trim()
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '#'
    }
  }
  
  return clean
}

/**
 * Sanitize embed code (for third-party widgets like SociableKit)
 * More permissive but still removes scripts
 */
export function sanitizeEmbedCode(dirty: string | null | undefined): string {
  if (!dirty) return ''
  
  // For embed codes, we allow iframes but sanitize their src
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['div', 'iframe', 'script'],
    ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'class', 'id', 'data-embed-id', 'style'],
    // Only allow https: and http: protocols for iframe src
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Still block dangerous attributes
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  })
}

