import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { sendEmail } from '@/lib/email'

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'database.json')

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const normalised = email.toLowerCase().trim()
    const db = readDb()
    db.subscribers = db.subscribers || []

    // Idempotent — don't add duplicates
    const exists = db.subscribers.some((s: any) => s.email === normalised)
    if (!exists) {
      db.subscribers.push({ email: normalised, subscribedAt: new Date().toISOString() })
      writeDb(db)
    }

    // Send welcome email to subscriber
    try {
      await sendEmail(
        normalised,
        'Welcome to BJP Varma Updates!',
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#ea580c;padding:16px 24px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:20px;">Bhupathiraju Srinivasa Varma</h1>
            <p style="color:#fed7aa;margin:4px 0 0;font-size:13px;">Member of Parliament, Narsapuram · Union MoS Heavy Industries &amp; Steel</p>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
            <h2 style="color:#111827;font-size:18px;margin-top:0;">Thank you for subscribing!</h2>
            <p style="color:#374151;line-height:1.6;">You are now subscribed to BJP Varma's official updates. You will receive the latest news, press releases, and constituency developments directly in your inbox.</p>
            <p style="color:#374151;line-height:1.6;"><strong>Forever At Your Service</strong></p>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
              <p>BJPVarma.co.in · Narsapuram, Andhra Pradesh · India</p>
              <p>You received this email because you subscribed at bjpvarma.co.in</p>
            </div>
          </div>
        </div>`
      )
    } catch (emailErr) {
      // Log but don't fail the subscription if email fails
      console.error('[newsletter] Welcome email failed:', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
