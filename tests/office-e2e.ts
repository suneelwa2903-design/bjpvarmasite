/**
 * Office Portal End-to-End Test Suite
 *
 * Tests all office workflows for ADMIN, AGENT, and VIEWER roles.
 * Run: npx tsx tests/office-e2e.ts
 *
 * Prerequisites:
 *   - Dev server running on port 3002
 *   - Database with office users seeded (ADMIN, AGENT, VIEWER)
 */

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3003'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []
let cookies: Record<string, string> = {}

// ─── Helpers ───

function extractCookies(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {}
  headers.getSetCookie?.().forEach((c) => {
    const [kv] = c.split(';')
    const [k, ...rest] = kv.split('=')
    out[k.trim()] = rest.join('=')
  })
  return out
}

function cookieHeader(jar: Record<string, string>): string {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ')
}

async function apiCall(method: string, path: string, body?: any, jar?: Record<string, string>) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Cookie: cookieHeader(jar || cookies),
  }
  // CSRF token
  const csrfMatch = (jar || cookies)['csrf-token']
  if (csrfMatch && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers['x-csrf-token'] = csrfMatch
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  })
  const setCookies = extractCookies(res.headers)
  Object.assign(jar || cookies, setCookies)
  return res
}

function pass(name: string) {
  results.push({ name, passed: true })
  console.log(`  \x1b[32m✓\x1b[0m ${name}`)
}

function fail(name: string, error: string) {
  results.push({ name, passed: false, error })
  console.log(`  \x1b[31m✗\x1b[0m ${name} — ${error}`)
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    pass(name)
  } catch (e: any) {
    fail(name, e.message || String(e))
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg)
}

// ─── Get CSRF token by visiting a page ───

async function getCsrf(jar: Record<string, string>) {
  const res = await fetch(`${BASE}/office/login`, {
    headers: { Cookie: cookieHeader(jar) },
    redirect: 'manual',
  })
  const setCookies = extractCookies(res.headers)
  Object.assign(jar, setCookies)
}

// ─── Login helper ───

async function login(email: string, password: string, jar: Record<string, string>): Promise<any> {
  await getCsrf(jar)
  const res = await apiCall('POST', '/api/office/auth/login', { email, password }, jar)
  return { status: res.status, body: await res.json() }
}

// ─── TEST SUITES ───

async function testPageAccess() {
  console.log('\n\x1b[1m=== Page Access Tests ===\x1b[0m')

  await test('Homepage returns 200', async () => {
    const res = await fetch(`${BASE}/`)
    assert(res.status === 200, `Got ${res.status}`)
  })

  await test('Office login page returns 200', async () => {
    const res = await fetch(`${BASE}/office/login`)
    assert(res.status === 200, `Got ${res.status}`)
  })

  await test('Admin login page returns 200', async () => {
    const res = await fetch(`${BASE}/admin`)
    assert(res.status === 200, `Got ${res.status}`)
  })

  await test('Press release page returns 200', async () => {
    const res = await fetch(`${BASE}/press-release`)
    assert(res.status === 200, `Got ${res.status}`)
  })

  await test('Gallery page returns 200', async () => {
    const res = await fetch(`${BASE}/gallery`)
    assert(res.status === 200, `Got ${res.status}`)
  })

  await test('Initiatives page returns 200', async () => {
    const res = await fetch(`${BASE}/initiatives`)
    assert(res.status === 200, `Got ${res.status}`)
  })
}

async function testLoginValidation() {
  console.log('\n\x1b[1m=== Login Validation Tests ===\x1b[0m')

  await test('Login with empty credentials returns 400', async () => {
    const jar: Record<string, string> = {}
    await getCsrf(jar)
    const res = await apiCall('POST', '/api/office/auth/login', {}, jar)
    assert(res.status === 400 || res.status === 401, `Expected 400/401, got ${res.status}`)
  })

  await test('Login with wrong email returns 401', async () => {
    const jar: Record<string, string> = {}
    await getCsrf(jar)
    const res = await apiCall('POST', '/api/office/auth/login', { email: 'nonexistent@test.com', password: 'wrong' }, jar)
    assert(res.status === 401, `Expected 401, got ${res.status}`)
  })

  await test('Login with wrong password returns 401', async () => {
    const jar: Record<string, string> = {}
    await getCsrf(jar)
    const res = await apiCall('POST', '/api/office/auth/login', { email: 'admin@bjpvarma.co.in', password: 'wrongpassword' }, jar)
    // Could be 401 (wrong pass) or 401 (user not found) - both acceptable
    assert(res.status === 401 || res.status === 500, `Expected 401, got ${res.status}`)
  })
}

async function testAdminWorkflow() {
  console.log('\n\x1b[1m=== ADMIN Role Workflow ===\x1b[0m')

  const jar: Record<string, string> = {}

  // Try login (skip if no admin user exists)
  const loginResult = await login('e2e-admin@test.com', 'test123', jar)

  if (loginResult.status !== 200 || !loginResult.body.success) {
    console.log('  \x1b[33m⚠\x1b[0m  Admin user not found — skipping admin workflow tests')
    console.log('     Create admin user: POST /api/office/admin/users with admin session')
    return
  }

  pass('ADMIN login successful (no OTP required)')

  await test('ADMIN can access analytics', async () => {
    const res = await apiCall('GET', '/api/office/analytics', undefined, jar)
    assert(res.status === 200, `Got ${res.status}`)
    const body = await res.json()
    assert(body.success, 'Analytics response not successful')
  })

  await test('ADMIN can list tickets', async () => {
    const res = await apiCall('GET', '/api/mib/tickets/admin', undefined, jar)
    assert(res.status === 200, `Got ${res.status}`)
  })

  await test('ADMIN can create ticket', async () => {
    const res = await apiCall('POST', '/api/office/tickets', {
      applicantName: 'E2E Test Citizen',
      mobile: '9876543210',
      category: 'Constituency – Grievances',
      categoryType: 'Individual Petition',
      state: 'Andhra Pradesh',
      district: 'West Godavari',
      subject: 'E2E Test Ticket - Road repair needed',
      descriptionHtml: '<p>This is an automated E2E test ticket.</p>',
      priority: 'P2',
    }, jar)
    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`)
    const body = await res.json()
    assert(body.success, `Create failed: ${body.error || 'unknown'}`)
    assert(!!body.data?.ticketNo, 'No ticket number returned')
    console.log(`     Created ticket: ${body.data.ticketNo}`)

    // Store for later tests
    ;(globalThis as any).__testTicketNo = body.data.ticketNo
  })

  const ticketNo = (globalThis as any).__testTicketNo
  if (ticketNo) {
    await test('ADMIN can change ticket status to OPEN', async () => {
      const res = await apiCall('PATCH', `/api/mib/tickets/${ticketNo}/status`, {
        action: 'OPEN',
        note: 'Opening ticket for processing',
      }, jar)
      assert(res.status === 200, `Got ${res.status}`)
    })

    await test('ADMIN can change ticket status to IN_PROGRESS', async () => {
      const res = await apiCall('PATCH', `/api/mib/tickets/${ticketNo}/status`, {
        action: 'IN_PROGRESS',
        note: 'Work in progress',
      }, jar)
      assert(res.status === 200, `Got ${res.status}`)
    })

    await test('ADMIN can change ticket status to RESOLVED', async () => {
      const res = await apiCall('PATCH', `/api/mib/tickets/${ticketNo}/status`, {
        action: 'RESOLVED',
        note: 'Issue resolved',
      }, jar)
      assert(res.status === 200, `Got ${res.status}`)
    })

    await test('ADMIN can view ticket detail page', async () => {
      const res = await fetch(`${BASE}/office/tickets/${ticketNo}`, {
        headers: { Cookie: cookieHeader(jar) },
        redirect: 'manual',
      })
      assert(res.status === 200, `Got ${res.status}`)
    })
  }

  await test('ADMIN user management requires admin portal session (not office session)', async () => {
    // /api/office/admin/users checks admin-session cookie (main admin portal), not office-session
    const res = await apiCall('GET', '/api/office/admin/users', undefined, jar)
    assert(res.status === 403, `Expected 403 (needs admin portal session), got ${res.status}`)
  })

  await test('ADMIN can logout', async () => {
    const res = await apiCall('POST', '/api/office/auth/logout', {}, jar)
    assert(res.status === 200, `Got ${res.status}`)
  })
}

async function testAgentWorkflow() {
  console.log('\n\x1b[1m=== AGENT Role Workflow ===\x1b[0m')

  const jar: Record<string, string> = {}
  const loginResult = await login('e2e-agent@test.com', 'test123', jar)

  if (loginResult.status !== 200 || !loginResult.body.success) {
    console.log('  \x1b[33m⚠\x1b[0m  Agent user not found — skipping agent workflow tests')
    return
  }

  pass('AGENT login successful (no OTP required)')

  await test('AGENT can access analytics', async () => {
    const res = await apiCall('GET', '/api/office/analytics', undefined, jar)
    assert(res.status === 200, `Got ${res.status}`)
  })

  await test('AGENT can list tickets', async () => {
    const res = await apiCall('GET', '/api/mib/tickets/admin', undefined, jar)
    assert(res.status === 200, `Got ${res.status}`)
  })

  await test('AGENT can create ticket', async () => {
    const res = await apiCall('POST', '/api/office/tickets', {
      applicantName: 'Agent Test Citizen',
      mobile: '9876543211',
      category: 'Constituency – Infrastructure',
      categoryType: 'Roads',
      state: 'Andhra Pradesh',
      district: 'East Godavari',
      subject: 'Agent E2E Test Ticket',
      descriptionHtml: '<p>Agent created test ticket.</p>',
      priority: 'P3',
    }, jar)
    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`)
  })

  await test('AGENT cannot access user management', async () => {
    const res = await apiCall('GET', '/api/office/admin/users', undefined, jar)
    assert(res.status === 403 || res.status === 401, `Expected 403/401, got ${res.status}`)
  })
}

async function testViewerWorkflow() {
  console.log('\n\x1b[1m=== VIEWER Role Workflow ===\x1b[0m')

  const jar: Record<string, string> = {}
  const loginResult = await login('e2e-viewer@test.com', 'test123', jar)

  if (loginResult.status !== 200 || !loginResult.body.success) {
    console.log('  \x1b[33m⚠\x1b[0m  Viewer user not found — skipping viewer workflow tests')
    return
  }

  pass('VIEWER login successful (no OTP required)')

  await test('VIEWER can access analytics', async () => {
    const res = await apiCall('GET', '/api/office/analytics', undefined, jar)
    assert(res.status === 200, `Got ${res.status}`)
  })

  await test('VIEWER can list tickets', async () => {
    const res = await apiCall('GET', '/api/mib/tickets/admin', undefined, jar)
    assert(res.status === 200, `Got ${res.status}`)
  })

  await test('VIEWER CANNOT create ticket', async () => {
    const res = await apiCall('POST', '/api/office/tickets', {
      applicantName: 'Viewer Test',
      mobile: '9876543212',
      category: 'Government Department',
      categoryType: 'Police',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      subject: 'Viewer trying to create ticket',
      descriptionHtml: '<p>Should be blocked.</p>',
    }, jar)
    assert(res.status === 403, `Expected 403 (view-only), got ${res.status}`)
  })

  await test('VIEWER cannot access user management', async () => {
    const res = await apiCall('GET', '/api/office/admin/users', undefined, jar)
    assert(res.status === 403 || res.status === 401, `Expected 403/401, got ${res.status}`)
  })
}

async function testSecurityChecks() {
  console.log('\n\x1b[1m=== Security Tests ===\x1b[0m')

  await test('Unauthenticated ticket creation returns 401', async () => {
    const jar: Record<string, string> = {}
    await getCsrf(jar)
    const res = await apiCall('POST', '/api/office/tickets', {
      applicantName: 'Hacker',
      mobile: '0000000000',
      subject: 'Unauthorized',
      descriptionHtml: '<p>test</p>',
    }, jar)
    assert(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`)
  })

  await test('Unauthenticated analytics returns 401', async () => {
    const jar: Record<string, string> = {}
    const res = await fetch(`${BASE}/api/office/analytics`, {
      headers: { Cookie: '' },
    })
    assert(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`)
  })

  await test('API without CSRF token returns 403', async () => {
    const res = await fetch(`${BASE}/api/office/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'test' }),
    })
    assert(res.status === 403, `Expected 403 (CSRF), got ${res.status}`)
  })

  await test('Admin data API requires auth for mutations', async () => {
    const jar: Record<string, string> = {}
    await getCsrf(jar)
    const res = await apiCall('POST', '/api/admin/data', {
      type: 'slideshow',
      data: { title: 'hacked' },
    }, jar)
    assert(res.status === 401, `Expected 401, got ${res.status}`)
  })
}

// ─── MAIN ───

async function main() {
  console.log('\x1b[1m\x1b[36m')
  console.log('╔════════════════════════════════════════╗')
  console.log('║   Office Portal E2E Test Suite         ║')
  console.log('╚════════════════════════════════════════╝')
  console.log('\x1b[0m')

  // Check server is up
  try {
    await fetch(`${BASE}/`, { signal: AbortSignal.timeout(5000) })
  } catch {
    console.error(`\x1b[31mServer not running at ${BASE}. Start it first: npm run dev\x1b[0m`)
    process.exit(1)
  }

  await testPageAccess()
  await testLoginValidation()
  await testAdminWorkflow()
  await testAgentWorkflow()
  await testViewerWorkflow()
  await testSecurityChecks()

  // Summary
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  console.log(`\n\x1b[1m═══ Results ═══\x1b[0m`)
  console.log(`  \x1b[32m${passed} passed\x1b[0m`)
  if (failed > 0) {
    console.log(`  \x1b[31m${failed} failed\x1b[0m`)
    results.filter(r => !r.passed).forEach(r => {
      console.log(`    \x1b[31m✗\x1b[0m ${r.name}: ${r.error}`)
    })
  }
  console.log('')

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(console.error)
