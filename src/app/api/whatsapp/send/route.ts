import { NextResponse } from 'next/server'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { sendTextMessage } from '@/lib/whatsapp'

interface SendRequestBody {
  phone: string
  message: string
  ticketNo: string
}

/**
 * POST /api/whatsapp/send
 * Protected endpoint for office users to send WhatsApp messages to citizens.
 */
export async function POST(req: Request) {
  const user = await getOfficeSessionUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as SendRequestBody

    if (!body.phone?.trim() || !body.message?.trim() || !body.ticketNo?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: phone, message, ticketNo' },
        { status: 400 }
      )
    }

    const result = await sendTextMessage(body.phone, body.message)

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      })
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Failed to send WhatsApp message' },
      { status: 502 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[WhatsApp Send] Error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
