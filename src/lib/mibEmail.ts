import { sendEmail } from '@/lib/email'

const APP_BRAND = 'Make It Better For People'
const SUPPORT_EMAIL = process.env.EMAIL_FROM || 'no-reply@example.com'

function buildEmailTemplate(title: string, body: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2933; padding: 24px;">
      <div style="max-width: 520px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 16px 24px;">
          <h1 style="margin: 0; font-size: 20px; color: #ffffff;">${APP_BRAND}</h1>
        </div>
        <div style="padding: 24px;">
          <h2 style="margin-top: 0; font-size: 18px; color: #111827;">${title}</h2>
          <div style="font-size: 15px; color: #1f2933;">
            ${body}
          </div>
          <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">
            If you did not request this, please ignore this email or contact us at ${SUPPORT_EMAIL}.
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280;">
          &copy; ${new Date().getFullYear()} ${APP_BRAND}. All rights reserved.
        </div>
      </div>
    </div>
  `
}

export async function sendVerificationCodeEmail(to: string, code: string) {
  const body = `
    <p>Hello,</p>
    <p>Thank you for signing up for <strong>${APP_BRAND}</strong>.</p>
    <p>Your verification code is:</p>
    <p style="font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #2563eb; text-align: center;">${code}</p>
    <p>This code will expire in 15 minutes. Please enter it in the portal to verify your email and activate your account.</p>
  `

  return sendEmail(to, 'Verify your email address', buildEmailTemplate('Verify your email', body))
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const body = `
    <p>Hello,</p>
    <p>We received a request to reset the password for your <strong>${APP_BRAND}</strong> account.</p>
    <p>Use the code below to reset your password:</p>
    <p style="font-size: 28px; letter-spacing: 8px; font-weight: bold; color: #2563eb; text-align: center;">${code}</p>
    <p>This code will expire in 15 minutes. If you did not request a password reset, you can ignore this email.</p>
  `

  return sendEmail(to, 'Reset your password', buildEmailTemplate('Password reset code', body))
}

