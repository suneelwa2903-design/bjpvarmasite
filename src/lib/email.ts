import type { Transporter } from 'nodemailer'

const host = process.env.EMAIL_SMTP_HOST || process.env.SMTP_HOST
const port = process.env.EMAIL_SMTP_PORT ? parseInt(process.env.EMAIL_SMTP_PORT, 10) : (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined)
const user = process.env.EMAIL_SMTP_USER || process.env.SMTP_USER
const pass = process.env.EMAIL_SMTP_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_PASS
const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'no-reply@example.com'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!host || !port || !user || !pass) {
    console.warn('[email] SMTP not configured')
    return null
  }
  if (!transporter) {
    try {
      const nodemailer = require('nodemailer')
      transporter = nodemailer.createTransport({ host, port, auth: { user, pass } })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      console.error('[email] Failed to init transporter:', message)
      return null
    }
  }
  return transporter
}

export async function sendEmail(to: string, subject: string, html: string) {
  const t = getTransporter()
  if (!t) return { skipped: true }
  try {
    const info = await t.sendMail({ from, to, subject, html })
    return { ok: true, messageId: info?.messageId }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Send failed'
    console.error('[email] Send failed:', message)
    throw e
  }
}
