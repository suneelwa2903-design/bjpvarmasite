import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { randomInt } from 'crypto'

function generateTicketNo(): string {
  const d = new Date()
  const y = d.getFullYear().toString().slice(-2)
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const rand = randomInt(0, 100000).toString().padStart(5, '0')
  return `OFF-${y}${m}-${rand}`
}

function calculateSLADueAt(priority: string, createdAt: Date): Date {
  const days = priority === 'P1' ? 3 : priority === 'P2' ? 7 : priority === 'P3' ? 15 : 30
  const due = new Date(createdAt)
  due.setDate(due.getDate() + days)
  return due
}

export async function POST(request: Request) {
  const user = await getOfficeSessionUser()
  if (!user) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  if (user.role === 'OFFICE_VIEWER') {
    return NextResponse.json({ success: false, error: 'View-only access. Please contact an office admin to create tickets.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      applicantName,
      mobile,
      email,
      category,
      categoryType,
      state,
      district,
      mandal,
      ward,
      pincode,
      subject,
      descriptionHtml,
      descriptionPlain,
      hasReference,
      refName,
      refPhone,
      refLocation,
      priority,
      eta,
      assignedToId,
      attachments,
    } = body || {}

    if (!applicantName || !mobile || !category || !categoryType || !state || !district || !subject || !descriptionHtml) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Validate mobile: must be exactly 10 digits
    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ success: false, error: 'Mobile number must be exactly 10 digits' }, { status: 400 })
    }

    // Validate priority
    const validPriorities = ['P1', 'P2', 'P3', 'P4']
    const ticketPriority = validPriorities.includes(priority) ? priority : 'P2'

    // Validate category/type exists in taxonomy_office
    const taxonomySetting = await prisma.mibSetting.findUnique({ where: { key: 'taxonomy_office' } })
    if (taxonomySetting) {
      const taxonomy: Record<string, string[]> = JSON.parse(taxonomySetting.value)
      if (!taxonomy[category] || !taxonomy[category].includes(categoryType)) {
        return NextResponse.json({ success: false, error: 'Invalid category or type. Please ensure the category and type exist in the office taxonomy.' }, { status: 400 })
      }
    }

    // Validate assignedToId if provided
    // If assignedToId is explicitly null (user selected "Unassigned"), keep it as null
    // If assignedToId is undefined (not in payload), default to creator
    let finalAssignedToId: string | null = null
    if (assignedToId === null) {
      // Explicitly unassigned
      finalAssignedToId = null
    } else if (assignedToId === undefined) {
      // Not provided in payload, default to creator
      finalAssignedToId = user.id
    } else if (assignedToId) {
      // Validate the assigned user
      const assignee = await prisma.mibUser.findUnique({
        where: { id: assignedToId },
        select: { id: true, role: true, active: true }
      })
      if (assignee && assignee.active && ['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'].includes(assignee.role)) {
        finalAssignedToId = assignedToId
      } else {
        // If invalid, default to creator
        finalAssignedToId = user.id
      }
    } else {
      // Empty string or falsy, default to creator
      finalAssignedToId = user.id
    }

    // Parse ETA if provided
    let etaDate: Date | null = null
    if (eta) {
      try {
        etaDate = new Date(eta)
        if (isNaN(etaDate.getTime())) {
          etaDate = null
        }
      } catch {
        etaDate = null
      }
    }

    const ticketNo = generateTicketNo()
    const createdAt = new Date()

    // Calculate SLA based on priority
    const slaDueAt = calculateSLADueAt(ticketPriority, createdAt)

    // Use office user as creator
    const ticket = await prisma.mibTicket.create({
      data: {
        source: 'OFFICE',
        ticketNo,
        applicantName,
        mobile,
        email,
        category,
        categoryType,
        state,
        district,
        mandal,
        ward,
        pincode,
        subject,
        descriptionHtml,
        descriptionPlain,
        hasReference: !!hasReference,
        refName,
        refPhone,
        refLocation,
        status: 'NEW',
        priority: ticketPriority,
        eta: etaDate,
        assignedToId: finalAssignedToId,
        slaDueAt,
        createdById: user.id,
      }
    })

    if (attachments && Array.isArray(attachments)) {
      for (const a of attachments) {
        if (a?.fileName && a?.mimeType && a?.sizeBytes && a?.storageUrl) {
          await prisma.mibTicketAttachment.create({ data: { ticketId: ticket.id, fileName: a.fileName, mimeType: a.mimeType, sizeBytes: Number(a.sizeBytes), storageUrl: a.storageUrl } })
        }
      }
    }

    await prisma.mibTicketEvent.create({
      data: { ticketId: ticket.id, actorUserId: user.id, eventType: 'CREATED' }
    })

    return NextResponse.json({ success: true, data: { ticketNo } }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to create ticket' }, { status: 500 })
  }
}

