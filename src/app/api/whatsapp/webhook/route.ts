import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature, getWebhookVerifyToken } from '@/lib/whatsapp'
import { sanitizeHtml } from '@/lib/security/sanitize'

/**
 * WhatsApp Cloud API Webhook
 *
 * GET  - Meta webhook verification (hub.mode, hub.verify_token, hub.challenge)
 * POST - Incoming message handler with signature verification
 */

// --- Meta webhook verification ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === getWebhookVerifyToken()) {
    console.log('[WhatsApp Webhook] Verification successful')
    return new NextResponse(challenge, { status: 200 })
  }

  console.warn('[WhatsApp Webhook] Verification failed - token mismatch')
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// --- Types for incoming WhatsApp webhook payload ---
interface WhatsAppMessage {
  from: string
  id: string
  timestamp: string
  type: string
  text?: { body: string }
}

interface WhatsAppContact {
  profile: { name: string }
  wa_id: string
}

interface WhatsAppValue {
  messaging_product: string
  metadata: { display_phone_number: string; phone_number_id: string }
  contacts?: WhatsAppContact[]
  messages?: WhatsAppMessage[]
}

interface WhatsAppChange {
  field: string
  value: WhatsAppValue
}

interface WhatsAppEntry {
  id: string
  changes: WhatsAppChange[]
}

interface WhatsAppWebhookPayload {
  object: string
  entry: WhatsAppEntry[]
}

// --- Incoming message handler ---
export async function POST(req: NextRequest) {
  // Refuse to process if the secret isn't configured. Without it
  // verifyWebhookSignature() returns false for every input, but failing fast
  // here makes the misconfiguration loud rather than producing 401s that look
  // like attacker traffic in the logs.
  if (!process.env.WHATSAPP_APP_SECRET) {
    console.error('[WhatsApp Webhook] WHATSAPP_APP_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const rawBody = await req.text()

  // Verify signature. The previous `if (signature && ...)` guard let
  // missing-signature requests through — a CSRF-exempt unauthenticated bypass.
  const signature = req.headers.get('x-hub-signature-256') || ''
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[WhatsApp Webhook] Invalid or missing signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: WhatsAppWebhookPayload
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Meta requires 200 response quickly; process asynchronously
  if (payload.object !== 'whatsapp_business_account') {
    return NextResponse.json({ status: 'ignored' }, { status: 200 })
  }

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue

      const messages = change.value.messages
      if (!messages || messages.length === 0) continue

      for (const msg of messages) {
        if (msg.type !== 'text' || !msg.text?.body) continue

        await handleIncomingTextMessage(
          msg.from,
          msg.text.body,
          msg.id,
          change.value.contacts?.[0]?.profile?.name
        )
      }
    }
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 })
}

async function handleIncomingTextMessage(
  senderPhone: string,
  text: string,
  whatsappMessageId: string,
  senderName?: string
) {
  try {
    // Normalize phone: try matching with and without country code prefix
    const phoneVariants = [senderPhone]
    if (senderPhone.startsWith('91') && senderPhone.length === 12) {
      phoneVariants.push(senderPhone.slice(2)) // 10-digit version
    }

    // Find the most recent ticket associated with this phone number
    const ticket = await prisma.mibTicket.findFirst({
      where: { mobile: { in: phoneVariants } },
      orderBy: { createdAt: 'desc' },
    })

    if (!ticket) {
      console.log(`[WhatsApp Webhook] No ticket found for phone ${senderPhone}`)
      return
    }

    // Create an external comment from the citizen via WhatsApp.
    // Sanitize the citizen-provided text on write — even though signature
    // verification establishes the message came from Meta, the *content* is
    // arbitrary user input from the citizen's phone.
    const safeBodyHtml = sanitizeHtml(`[WhatsApp${senderName ? ` - ${senderName}` : ''}] ${text}`)
    await prisma.mibTicketComment.create({
      data: {
        ticketId: ticket.id,
        authorUserId: null,
        isInternal: false,
        bodyHtml: safeBodyHtml,
      },
    })

    await prisma.mibTicketEvent.create({
      data: {
        ticketId: ticket.id,
        eventType: 'COMMENT',
        note: `EXTERNAL (WhatsApp ${whatsappMessageId}): ${text.substring(0, 140)}`,
      },
    })

    // If ticket is in NEED_INFO, move it back to OPEN
    if (ticket.status === 'NEED_INFO') {
      await prisma.mibTicket.update({
        where: { id: ticket.id },
        data: { status: 'OPEN' },
      })

      await prisma.mibTicketEvent.create({
        data: {
          ticketId: ticket.id,
          eventType: 'STATUS_CHANGED',
          fromValue: 'NEED_INFO',
          toValue: 'OPEN',
          note: 'Citizen responded via WhatsApp',
        },
      })
    }

    console.log(
      `[WhatsApp Webhook] Comment added to ticket ${ticket.ticketNo} from ${senderPhone}`
    )
  } catch (error) {
    console.error('[WhatsApp Webhook] Error handling incoming message:', error)
  }
}
