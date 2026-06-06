/**
 * WhatsApp Business Cloud API client
 * Uses Meta Cloud API (free, direct)
 */

import { createHmac } from 'crypto'

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'

interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
  appSecret: string
  webhookVerifyToken: string
}

function getConfig(): WhatsAppConfig {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    appSecret: process.env.WHATSAPP_APP_SECRET || '',
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
  }
}

export function isWhatsAppEnabled(): boolean {
  const config = getConfig()
  return Boolean(config.accessToken && config.phoneNumberId)
}

function normalizePhone(phone: string): string {
  // Remove non-digit chars, add India country code if not present
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 10) digits = '91' + digits
  if (!digits.startsWith('91') && digits.length === 12) return digits
  return digits
}

export async function sendTemplateMessage(
  phone: string,
  templateName: string,
  languageCode: string = 'en',
  parameters: string[] = []
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isWhatsAppEnabled()) return { success: false, error: 'WhatsApp not configured' }

  const config = getConfig()
  const normalizedPhone = normalizePhone(phone)

  const components = parameters.length > 0 ? [{
    type: 'body' as const,
    parameters: parameters.map(p => ({ type: 'text' as const, text: p })),
  }] : []

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizedPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          ...(components.length > 0 ? { components } : {}),
        },
      }),
    })

    const data = await res.json() as {
      messages?: Array<{ id: string }>
      error?: { message: string }
    }
    if (data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id }
    }
    return { success: false, error: data.error?.message || 'Failed to send' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'WhatsApp API error'
    console.error('[WhatsApp] Send failed:', message)
    return { success: false, error: message }
  }
}

export async function sendTextMessage(
  phone: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isWhatsAppEnabled()) return { success: false, error: 'WhatsApp not configured' }

  const config = getConfig()
  const normalizedPhone = normalizePhone(phone)

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizedPhone,
        type: 'text',
        text: { body: text },
      }),
    })

    const data = await res.json() as {
      messages?: Array<{ id: string }>
      error?: { message: string }
    }
    if (data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id }
    }
    return { success: false, error: data.error?.message || 'Failed to send' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'WhatsApp API error'
    console.error('[WhatsApp] Send failed:', message)
    return { success: false, error: message }
  }
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const config = getConfig()
  if (!config.appSecret) return false

  const expectedSig = createHmac('sha256', config.appSecret).update(payload).digest('hex')
  return `sha256=${expectedSig}` === signature
}

export function getWebhookVerifyToken(): string {
  return getConfig().webhookVerifyToken
}
