import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMibCitizenSession } from '@/lib/mibCitizenSession'

// Lists tickets owned by the currently-authenticated citizen.
//
// Pre-Wave-2 history: this route accepted `?email=` / `?mobile=` query params
// and returned tickets matching those strings, with no authentication. That
// was a CRITICAL IDOR (anyone could read any citizen's tickets by guessing
// the email). We now silently ignore any legacy query params and identify
// the caller solely via the `mib-session` cookie.
export async function GET() {
  const user = await getMibCitizenSession()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }

  const tickets = await prisma.mibTicket.findMany({
    where: { createdById: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      ticketNo: true,
      subject: true,
      status: true,
      createdAt: true,
      category: true,
      categoryType: true,
      district: true,
    },
  })

  return NextResponse.json({ success: true, data: tickets })
}
