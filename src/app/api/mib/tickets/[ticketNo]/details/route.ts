import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { signAttachments } from '@/lib/storage'

export async function GET(_: Request, context: { params: Promise<{ ticketNo: string }> }) {
  const session = await getCurrentSession()
  const office = await getOfficeSessionUser()
  if (!session && !office) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  const { ticketNo } = await context.params
  const ticket = await prisma.mibTicket.findUnique({
    where: { ticketNo },
    include: {
      attachments: true,
      events: { 
        orderBy: { createdAt: 'asc' },
        include: {
          actor: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      comments: { 
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      assignedTo: {
        select: { id: true, name: true, email: true, role: true }
      },
    }
  })
  if (!ticket) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  // Sign private-bucket attachment keys before returning. Permission already
  // gated by getCurrentSession() || getOfficeSessionUser() above.
  const signedAttachments = await signAttachments(ticket.attachments)
  return NextResponse.json({ success: true, data: { ...ticket, attachments: signedAttachments } })
}


