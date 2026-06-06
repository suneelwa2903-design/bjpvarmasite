import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { isSessionValid } from '@/lib/auth'

const dbPath = path.join(process.cwd(), 'src', 'lib', 'database.json')

// In-memory cache to avoid reading file on every request
let cachedData: any = null
let cacheTimestamp = 0
const CACHE_TTL = 5000 // 5 seconds cache (for public reads)

function readDatabase() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(fileData)
  } catch (error) {
    console.error('Error reading database:', error)
    return {
      slideshow: [], initiatives: [], press: [], events: [], gallery: [],
      testimonials: [], journey: [], biography: null, users: [],
      quotes: [], yearlyReports: [], siteSettings: {
        quotesTicker: true, voicesOfSupport: true, yearlyReports: true, foundation: false
      },
      contactMessages: [], subscribers: [], foundation: []
    }
  }
}

function readDatabaseWithCache(): any {
  const now = Date.now()
  if (cachedData && (now - cacheTimestamp < CACHE_TTL)) {
    return cachedData
  }
  cachedData = readDatabase()
  cacheTimestamp = now
  return cachedData
}

function writeDatabase(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
    // Invalidate cache on write
    cachedData = data
    cacheTimestamp = Date.now()
    return true
  } catch (error) {
    console.error('Error writing database:', error)
    return false
  }
}

// Middleware to check authentication
async function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  return authHeader === 'Bearer admin-token' || await isSessionValid()
}

// Keys safe to expose to anonymous (unauthenticated) callers. Derived from
// what the public homepage and public pages actually consume. Anything not
// in this list — newsletter subscribers, contact-form messages, the users
// array — is admin-only PII and gets stripped from anonymous responses.
const ANONYMOUS_SAFE_KEYS = [
  'slideshow',
  'biography',
  'journey',
  'press',
  'initiatives',
  'events',
  'gallery',
  'testimonials',
  'quotes',
  'yearlyReports',
  'foundation',
  'siteSettings',
] as const

function filterForAnonymous(data: any): Record<string, any> {
  if (!data || typeof data !== 'object') return data
  const out: Record<string, any> = {}
  for (const key of ANONYMOUS_SAFE_KEYS) {
    if (key in data) out[key] = data[key]
  }
  return out
}

export async function GET(request: NextRequest) {
  try {
    const data = readDatabaseWithCache()
    const authenticated = await checkAuth(request)
    const payload = authenticated ? data : filterForAnonymous(data)
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10'
      }
    })
  } catch (error) {
    console.error('Error reading database:', error)
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await checkAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, data: newData } = await request.json()
    const db = readDatabase()

    if (type === 'slideshow') {
      db.slideshow.push({ id: `slide-${Date.now()}`, ...newData, createdAt: new Date().toISOString() })
    } else if (type === 'initiative') {
      db.initiatives.push({ id: `init-${Date.now()}`, ...newData, createdAt: new Date().toISOString() })
    } else if (type === 'press') {
      db.press = db.press || []
      db.press.push({ id: `press-${Date.now()}`, ...newData, createdAt: new Date().toISOString() })
    } else if (type === 'gallery') {
      db.gallery = db.gallery || []
      db.gallery.push({ id: `gallery-${Date.now()}`, ...newData, createdAt: new Date().toISOString() })
    } else if (type === 'testimonial') {
      db.testimonials = db.testimonials || []
      db.testimonials.push({ id: `testimonial-${Date.now()}`, ...newData, createdAt: new Date().toISOString() })
    } else if (type === 'journey') {
      db.journey = db.journey || []
      db.journey.push({ id: `journey-${Date.now()}`, ...newData, createdAt: new Date().toISOString() })
    } else if (type === 'biography') {
      db.biography = { ...newData, updatedAt: new Date().toISOString() }
    } else if (type === 'quote') {
      db.quotes = db.quotes || []
      db.quotes.push({ id: `q-${Date.now()}`, ...newData, createdAt: new Date().toISOString() })
    } else if (type === 'yearlyReport') {
      db.yearlyReports = db.yearlyReports || []
      db.yearlyReports.push({ id: `yr-${Date.now()}`, ...newData, createdAt: new Date().toISOString() })
    } else if (type === 'foundation') {
      db.foundation = db.foundation || []
      db.foundation.push({ id: `csr-${Date.now()}`, ...newData, createdAt: new Date().toISOString() })
    } else {
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    if (writeDatabase(db)) {
      return NextResponse.json({ success: true, data: db })
    } else {
      return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error saving data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await checkAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id, data: updateData } = await request.json()
    const db = readDatabase()

    if (type === 'slideshow') {
      const index = db.slideshow.findIndex((s: any) => s.id === id)
      if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      db.slideshow[index] = { ...db.slideshow[index], ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'initiative') {
      const index = db.initiatives.findIndex((i: any) => i.id === id)
      if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      db.initiatives[index] = { ...db.initiatives[index], ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'press') {
      const index = (db.press || []).findIndex((p: any) => p.id === id)
      if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      db.press[index] = { ...db.press[index], ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'gallery') {
      const index = (db.gallery || []).findIndex((g: any) => g.id === id)
      if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      db.gallery[index] = { ...db.gallery[index], ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'testimonial') {
      const index = (db.testimonials || []).findIndex((t: any) => t.id === id)
      if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      db.testimonials[index] = { ...db.testimonials[index], ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'journey') {
      const index = (db.journey || []).findIndex((j: any) => j.id === id)
      if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      db.journey[index] = { ...db.journey[index], ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'biography') {
      db.biography = { ...(db.biography || {}), ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'quote') {
      const index = (db.quotes || []).findIndex((q: any) => q.id === id)
      if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      db.quotes[index] = { ...db.quotes[index], ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'yearlyReport') {
      const index = (db.yearlyReports || []).findIndex((r: any) => r.id === id)
      if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      db.yearlyReports[index] = { ...db.yearlyReports[index], ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'siteSettings') {
      db.siteSettings = { ...(db.siteSettings || {}), ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'foundation') {
      const index = (db.foundation || []).findIndex((f: any) => f.id === id)
      if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      db.foundation[index] = { ...db.foundation[index], ...updateData, updatedAt: new Date().toISOString() }
    } else if (type === 'contactMessage') {
      const index = (db.contactMessages || []).findIndex((m: any) => m.id === id)
      if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      db.contactMessages[index] = { ...db.contactMessages[index], ...updateData }
    } else {
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    if (writeDatabase(db)) {
      return NextResponse.json({ success: true, data: db })
    } else {
      return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = await request.json()
    const db = readDatabase()

    if (type === 'slideshow') {
      db.slideshow = db.slideshow.filter((s: any) => s.id !== id)
    } else if (type === 'initiative') {
      db.initiatives = db.initiatives.filter((i: any) => i.id !== id)
    } else if (type === 'press') {
      db.press = (db.press || []).filter((p: any) => p.id !== id)
    } else if (type === 'gallery') {
      db.gallery = (db.gallery || []).filter((g: any) => g.id !== id)
    } else if (type === 'testimonial') {
      db.testimonials = (db.testimonials || []).filter((t: any) => t.id !== id)
    } else if (type === 'journey') {
      db.journey = (db.journey || []).filter((j: any) => j.id !== id)
    } else if (type === 'quote') {
      db.quotes = (db.quotes || []).filter((q: any) => q.id !== id)
    } else if (type === 'yearlyReport') {
      db.yearlyReports = (db.yearlyReports || []).filter((r: any) => r.id !== id)
    } else if (type === 'foundation') {
      db.foundation = (db.foundation || []).filter((f: any) => f.id !== id)
    } else if (type === 'contactMessage') {
      db.contactMessages = (db.contactMessages || []).filter((m: any) => m.id !== id)
    } else if (type === 'subscriber') {
      db.subscribers = (db.subscribers || []).filter((s: any) => s.email !== id)
    } else {
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    if (writeDatabase(db)) {
      return NextResponse.json({ success: true, data: db })
    } else {
      return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
