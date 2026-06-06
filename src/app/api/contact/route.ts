import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { sendEmail } from '@/lib/email'
import { sanitizeText } from '@/lib/security/sanitize'
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rateLimit'

// Field length caps. Contact submissions land in src/lib/database.json (a JSON
// file on disk), so unbounded payloads are a disk-fill DoS vector. These are
// generous enough for legitimate use, tight enough that ~5 capped submissions
// per hour per IP can't realistically fill a 20 GB VM.
const MAX_NAME = 200
const MAX_SUBJECT = 200
const MAX_MESSAGE = 5000
const MAX_CATEGORY = 100
const MAX_EMAIL = 320  // RFC 5321 max

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'database.json')

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  try {
    // Per-IP rate limit. The contact form is the only fully-anonymous write
    // path in the app; uncapped, it's a disk-fill DoS surface (see length
    // caps above). Mirrors the pattern used by /api/mib/auth/login and OTP.
    const clientId = getClientIdentifier(request)
    const rateLimit = checkRateLimit(`contact:${clientId}`, {
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000,        // 5 per hour
      lockoutMs: 60 * 60 * 1000,       // additional 1h lockout after exceeded
    })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.lockedUntil
              ? Math.ceil((rateLimit.lockedUntil - Date.now()) / 1000).toString()
              : '3600',
          },
        }
      )
    }

    const body = await request.json()
    const { category, name, email, subject, message } = body

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    // Length caps BEFORE sanitization — no point cleaning 1MB of HTML before
    // rejecting it. Each cap is generous for legitimate use but tight enough
    // that 5 submissions per hour cannot fill a 20 GB VM.
    if (typeof name === 'string' && name.length > MAX_NAME) {
      return NextResponse.json({ error: `Name exceeds ${MAX_NAME} characters.` }, { status: 400 })
    }
    if (typeof subject === 'string' && subject.length > MAX_SUBJECT) {
      return NextResponse.json({ error: `Subject exceeds ${MAX_SUBJECT} characters.` }, { status: 400 })
    }
    if (typeof message === 'string' && message.length > MAX_MESSAGE) {
      return NextResponse.json({ error: `Message exceeds ${MAX_MESSAGE} characters.` }, { status: 400 })
    }
    if (typeof category === 'string' && category.length > MAX_CATEGORY) {
      return NextResponse.json({ error: `Category exceeds ${MAX_CATEGORY} characters.` }, { status: 400 })
    }
    if (typeof email === 'string' && email.length > MAX_EMAIL) {
      return NextResponse.json({ error: `Email exceeds ${MAX_EMAIL} characters.` }, { status: 400 })
    }

    // Sanitize once. These are plain-text fields (name, subject, message body),
    // so sanitizeText strips ALL HTML — the strictest possible cleaning. Used
    // for both the DB write AND every email-body interpolation below so the
    // stored value and outbound HTML can never drift apart. Mirrors the
    // Wave-3 pattern for comment writes.
    const safeName = sanitizeText(name)?.trim() || ''
    const safeSubject = sanitizeText(subject)?.trim() || ''
    const safeMessage = sanitizeText(message)?.trim() || ''
    const safeCategory = sanitizeText(category)?.trim() || 'General Enquiry'
    // Email is used as a recipient address AND interpolated into the admin
    // notification HTML. Sanitize for the HTML path; the recipient address
    // path will simply fail at SMTP if the address became malformed after
    // sanitization, which is the desired failure mode.
    const safeEmail = sanitizeText(email)?.trim() || ''

    const db = readDb()
    if (!Array.isArray(db.contactMessages)) {
      db.contactMessages = []
    }

    const entry = {
      id: `contact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      category: safeCategory,
      name: safeName,
      email: safeEmail,
      subject: safeSubject,
      message: safeMessage,
      status: 'unread',
      createdAt: new Date().toISOString(),
    }

    db.contactMessages.unshift(entry)
    writeDb(db)

    // Notify admin
    const adminEmail = process.env.SMTP_USER || process.env.EMAIL_SMTP_USER
    if (adminEmail) {
      try {
        await sendEmail(
          adminEmail,
          `[BJPVarma.co.in] New Contact: ${entry.subject}`,
          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#ea580c;margin-top:0;">New Contact Message</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#6b7280;width:100px;">Category</td><td style="padding:6px 0;font-weight:600;">${entry.category}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">From</td><td style="padding:6px 0;font-weight:600;">${entry.name} &lt;${entry.email}&gt;</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Subject</td><td style="padding:6px 0;font-weight:600;">${entry.subject}</td></tr>
            </table>
            <div style="margin-top:16px;padding:16px;background:#f9fafb;border-left:4px solid #ea580c;border-radius:4px;">
              <p style="margin:0;white-space:pre-wrap;color:#374151;">${entry.message}</p>
            </div>
            <p style="margin-top:16px;font-size:12px;color:#9ca3af;">Received at ${new Date(entry.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST · bjpvarma.co.in</p>
          </div>`
        )
      } catch (emailErr) {
        console.error('[contact] Admin notification failed:', emailErr)
      }
    }

    // Send confirmation to submitter
    try {
      await sendEmail(
        entry.email,
        'We received your message — BJP Varma Office',
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#ea580c;padding:16px 24px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:20px;">Bhupathiraju Srinivasa Varma</h1>
            <p style="color:#fed7aa;margin:4px 0 0;font-size:13px;">Member of Parliament, Narsapuram</p>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
            <h2 style="color:#111827;font-size:18px;margin-top:0;">Thank you, ${entry.name}!</h2>
            <p style="color:#374151;line-height:1.6;">We have received your message regarding <strong>"${entry.subject}"</strong>. Our team will review it and get back to you as soon as possible.</p>
            <p style="color:#374151;line-height:1.6;"><strong>Forever At Your Service</strong></p>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
              <p>BJPVarma.co.in · office@bjpvarma.co.in</p>
            </div>
          </div>
        </div>`
      )
    } catch (emailErr) {
      console.error('[contact] Confirmation email failed:', emailErr)
    }

    return NextResponse.json({ success: true, id: entry.id })
  } catch (err) {
    console.error('[contact] error:', err)
    return NextResponse.json({ error: 'Failed to save message.' }, { status: 500 })
  }
}
