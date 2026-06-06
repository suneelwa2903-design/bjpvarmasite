import { NextResponse } from 'next/server'
import { listTypes } from '@/lib/mibTaxonomy'
import { prisma } from '@/lib/prisma'
import { sanitizeHtml, sanitizeText, sanitizeUrl } from '@/lib/security/sanitize'
import { createSecureResponse } from '@/lib/security/headers'
import { randomInt } from 'crypto'

function generateTicketNo(): string {
  const d = new Date()
  const y = d.getFullYear().toString().slice(-2)
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const rand = randomInt(0, 100000).toString().padStart(5, '0')
  return `MIB-${y}${m}-${rand}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      applicantName,
      mobile,
      email,
      language,
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
      attachments,
    } = body || {}

    // Sanitize all input fields
    const sanitizedApplicantName = sanitizeText(applicantName)?.trim()
    const sanitizedMobile = sanitizeText(mobile)?.trim().replace(/[^0-9+]/g, '') // Only digits and +
    const sanitizedEmail = email ? sanitizeText(email)?.trim().toLowerCase() : null
    const sanitizedSubject = sanitizeText(subject)?.trim()
    const sanitizedDescriptionHtml = sanitizeHtml(descriptionHtml)
    const sanitizedDescriptionPlain = sanitizeText(descriptionPlain)?.trim()
    const sanitizedCategory = sanitizeText(category)?.trim()
    const sanitizedCategoryType = sanitizeText(categoryType)?.trim()
    const sanitizedState = sanitizeText(state)?.trim()
    const sanitizedDistrict = sanitizeText(district)?.trim()
    const sanitizedMandal = mandal ? sanitizeText(mandal)?.trim() : null
    const sanitizedWard = ward ? sanitizeText(ward)?.trim() : null
    const sanitizedPincode = pincode ? sanitizeText(pincode)?.trim().replace(/[^0-9]/g, '') : null
    const sanitizedRefName = refName ? sanitizeText(refName)?.trim() : null
    const sanitizedRefPhone = refPhone ? sanitizeText(refPhone)?.trim().replace(/[^0-9+]/g, '') : null
    const sanitizedRefLocation = refLocation ? sanitizeText(refLocation)?.trim() : null

    // Validate required fields
    if (!sanitizedApplicantName || !sanitizedMobile || !sanitizedCategory || !sanitizedCategoryType || !sanitizedState || !sanitizedDistrict || !sanitizedSubject || !sanitizedDescriptionHtml) {
      return createSecureResponse({ success: false, error: 'Missing required fields' }, 400)
    }
    
    // Validate mobile number format (basic check)
    if (sanitizedMobile.length < 10 || sanitizedMobile.length > 15) {
      return createSecureResponse({ success: false, error: 'Invalid mobile number' }, 400)
    }
    
    // Validate email format if provided
    if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return createSecureResponse({ success: false, error: 'Invalid email format' }, 400)
    }
    
    if (!listTypes(sanitizedCategory as any)?.includes(sanitizedCategoryType)) {
      return createSecureResponse({ success: false, error: 'Invalid category/type' }, 400)
    }

    const ticketNo = generateTicketNo()

    // Minimal user linkage: create/find citizen by mobile/email
    const userEmail = sanitizedEmail || `citizen-${sanitizedMobile}@local`
    const user = await prisma.mibUser.upsert({
      where: { email: userEmail },
      update: { name: sanitizedApplicantName, mobile: sanitizedMobile, language: language || 'en', role: 'CITIZEN' },
      create: { name: sanitizedApplicantName, email: userEmail, mobile: sanitizedMobile, language: language || 'en', role: 'CITIZEN' },
    })

    const ticket = await prisma.mibTicket.create({
      data: {
        source: 'PUBLIC',
        ticketNo,
        applicantName: sanitizedApplicantName,
        mobile: sanitizedMobile,
        email: sanitizedEmail,
        language: language || 'en',
        category: sanitizedCategory,
        categoryType: sanitizedCategoryType,
        state: sanitizedState,
        district: sanitizedDistrict,
        mandal: sanitizedMandal,
        ward: sanitizedWard,
        pincode: sanitizedPincode,
        subject: sanitizedSubject,
        descriptionHtml: sanitizedDescriptionHtml,
        descriptionPlain: sanitizedDescriptionPlain,
        hasReference: !!hasReference,
        refName: sanitizedRefName,
        refPhone: sanitizedRefPhone,
        refLocation: sanitizedRefLocation,
        status: 'NEW',
        priority: 'P2',
        createdById: user.id,
      }
    })

    // Persist attachments if provided
    if (attachments && Array.isArray(attachments)) {
      for (const a of attachments) {
        if (a?.fileName && a?.mimeType && a?.sizeBytes && a?.storageUrl) {
          // Sanitize attachment data
          const sanitizedFileName = sanitizeText(a.fileName)?.trim()
          const sanitizedMimeType = sanitizeText(a.mimeType)?.trim()
          const sanitizedStorageUrl = sanitizeUrl(a.storageUrl)
          
          // Validate file size (max 10MB)
          const fileSize = Number(a.sizeBytes)
          if (fileSize > 10 * 1024 * 1024) {
            continue // Skip oversized files
          }
          
          if (sanitizedFileName && sanitizedMimeType && sanitizedStorageUrl) {
            await prisma.mibTicketAttachment.create({ 
              data: { 
                ticketId: ticket.id, 
                fileName: sanitizedFileName, 
                mimeType: sanitizedMimeType, 
                sizeBytes: fileSize, 
                storageUrl: sanitizedStorageUrl 
              } 
            })
          }
        }
      }
    }

    await prisma.mibTicketEvent.create({
      data: { ticketId: ticket.id, actorUserId: user.id, eventType: 'CREATED' }
    })

    return createSecureResponse({ success: true, data: { ticketNo } }, 201)
  } catch (e: any) {
    console.error('Ticket creation error:', e)
    return createSecureResponse({ success: false, error: 'Failed to create ticket' }, 500)
  }
}
