/**
 * Fire-and-forget WhatsApp notification helpers for ticket lifecycle events.
 * All functions catch errors internally and log them without throwing.
 */

import { sendTemplateMessage, isWhatsAppEnabled } from '@/lib/whatsapp'

export function notifyTicketCreated(
  ticketNo: string,
  phone: string,
  subject: string
): void {
  if (!isWhatsAppEnabled()) return

  sendTemplateMessage(phone, 'ticket_created', 'en', [ticketNo, subject])
    .then(result => {
      if (!result.success) {
        console.error(`[WhatsApp] Failed to send ticket_created for ${ticketNo}:`, result.error)
      }
    })
    .catch(err => {
      console.error(`[WhatsApp] ticket_created notification error for ${ticketNo}:`, err)
    })
}

export function notifyStatusUpdate(
  ticketNo: string,
  phone: string,
  status: string,
  note?: string
): void {
  if (!isWhatsAppEnabled()) return

  const params = note ? [ticketNo, status, note] : [ticketNo, status]

  sendTemplateMessage(phone, 'status_update', 'en', params)
    .then(result => {
      if (!result.success) {
        console.error(`[WhatsApp] Failed to send status_update for ${ticketNo}:`, result.error)
      }
    })
    .catch(err => {
      console.error(`[WhatsApp] status_update notification error for ${ticketNo}:`, err)
    })
}

export function notifyCommentAdded(
  ticketNo: string,
  phone: string
): void {
  if (!isWhatsAppEnabled()) return

  sendTemplateMessage(phone, 'comment_added', 'en', [ticketNo])
    .then(result => {
      if (!result.success) {
        console.error(`[WhatsApp] Failed to send comment_added for ${ticketNo}:`, result.error)
      }
    })
    .catch(err => {
      console.error(`[WhatsApp] comment_added notification error for ${ticketNo}:`, err)
    })
}

export function notifyTicketResolved(
  ticketNo: string,
  phone: string
): void {
  if (!isWhatsAppEnabled()) return

  sendTemplateMessage(phone, 'ticket_resolved', 'en', [ticketNo])
    .then(result => {
      if (!result.success) {
        console.error(`[WhatsApp] Failed to send ticket_resolved for ${ticketNo}:`, result.error)
      }
    })
    .catch(err => {
      console.error(`[WhatsApp] ticket_resolved notification error for ${ticketNo}:`, err)
    })
}
