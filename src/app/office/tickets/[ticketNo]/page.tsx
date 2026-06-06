import React from 'react'
import { prisma } from '@/lib/prisma'
import { signAttachments } from '@/lib/storage'
import TicketStatusActions from '@/components/admin/TicketStatusActions'
import PriorityControl from '@/components/admin/PriorityControl'
import TicketAssignment from '@/components/admin/TicketAssignment'
import TicketETA from '@/components/admin/TicketETA'
import Image from 'next/image'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { redirect } from 'next/navigation'
import { sanitizeHtml } from '@/lib/security/sanitize'

async function getOfficeUsers() {
  try {
    const users = await prisma.mibUser.findMany({
      where: {
        role: { in: ['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'] },
        active: true
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true }
    })
    return users
  } catch (e) {
    return []
  }
}

function StatusStepper({ current }: { current: string }) {
  const steps = ['CREATED', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const currentIdx = steps.indexOf(current === 'NEW' ? 'CREATED' : current)

  return (
    <div className="flex items-center justify-between w-full mb-6">
      {steps.map((step, i) => {
        const isCompleted = i < currentIdx
        const isCurrent = i === currentIdx
        const isPending = i > currentIdx

        return (
          <React.Fragment key={step}>
            {i > 0 && (
              <div className={`flex-1 h-0.5 mx-1 ${isCompleted ? 'bg-orange-500' : 'bg-gray-200'}`} />
            )}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                isCurrent ? 'bg-orange-500 text-white border-orange-500 ring-4 ring-orange-100' :
                isCompleted ? 'bg-orange-500 text-white border-orange-500' :
                'bg-white text-gray-400 border-gray-200'
              }`}>
                {isCompleted ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                isCurrent ? 'text-orange-600' : isCompleted ? 'text-orange-500' : 'text-gray-400'
              }`}>
                {step.replace('_', ' ')}
              </span>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

// Force dynamic rendering - don't pre-render this page at build time
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OfficeTicketDetail(context: { params: Promise<{ ticketNo: string }> }) {
  const user = await getOfficeSessionUser()
  if (!user) {
    redirect('/office/login')
  }

  const { ticketNo } = await context.params
  
  // Wrap in try-catch to handle database connection errors during build
  let ticket = null
  let events = []
  let comments = []
  let officeUsers = []
  
  // Check if we can safely query the database
  const canQueryDB = process.env.DATABASE_URL && !process.env.SKIP_DB_QUERIES
  
  if (canQueryDB) {
    try {
      [ticket, officeUsers] = await Promise.all([
        prisma.mibTicket.findUnique({ 
          where: { ticketNo }, 
          include: { 
            attachments: true,
            assignedTo: {
              select: { id: true, name: true, email: true, role: true }
            }
          } 
        }),
        getOfficeUsers()
      ])
      
      if (!ticket) {
        return <div className="max-w-4xl mx-auto p-8">Not found</div>
      }

      // All office users (ADMIN, AGENT, VIEWER) can view all tickets
      // No access check needed for viewing - all office portal users can see everything

      // Sign private-bucket attachment keys before render. Permission is already
      // gated by getOfficeSessionUser() above.
      ticket.attachments = await signAttachments(ticket.attachments);

      [events, comments] = await Promise.all([
        prisma.mibTicketEvent.findMany({ 
          where: { ticketId: ticket.id }, 
          orderBy: { createdAt: 'asc' },
          include: {
            actor: {
              select: { id: true, name: true, email: true }
            }
          }
        }),
        prisma.mibTicketComment.findMany({ 
          where: { ticketId: ticket.id }, 
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          }
        }),
      ])
    } catch (error: any) {
      // P2021 is "Table does not exist" - this is expected during initial build
      // P1001 is "Can't reach database server" - also expected if DB isn't set up yet
      if (error?.code === 'P2021' || error?.code === 'P1001') {
        // Return a message that this will work after deployment
        return <div className="max-w-4xl mx-auto p-8">Database not available during build. This page will work after deployment when the database is configured.</div>
      }
      console.error('Error fetching ticket:', error)
      return <div className="max-w-4xl mx-auto p-8">Error loading ticket. Please try again later.</div>
    }
  } else {
    // During build without DATABASE_URL, return a placeholder
    return <div className="max-w-4xl mx-auto p-8">Loading ticket details...</div>
  }

  const officeUserMap = new Map((officeUsers || []).map(u => [u.id, u]))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header card */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{ticket.ticketNo}</h1>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-gray-100">{ticket.category} / {ticket.categoryType}</span>
              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">{ticket.district}{ticket.mandal ? ', ' + ticket.mandal : ''}{ticket.ward ? ', ' + ticket.ward : ''}</span>
              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Created {new Date(ticket.createdAt).toLocaleString()}</span>
              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700">Priority {ticket.priority}</span>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700">Status {ticket.status}</span>
              {ticket.assignedTo && (
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">Owner: {ticket.assignedTo.name}</span>
              )}
              {ticket.eta ? (
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">ETA: {new Date(ticket.eta).toLocaleDateString()}</span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">ETA: Not added</span>
              )}
            </div>
          </div>
          <div className="text-sm text-right">
            <div><span className="font-semibold">Applicant:</span> {ticket.applicantName}</div>
            <div><span className="font-semibold">Mobile:</span> {ticket.mobile}</div>
            <div><span className="font-semibold">Email:</span> {ticket.email || '-'}</div>
            {(ticket.refName || ticket.refPhone || ticket.refLocation) && (
              <div className="mt-1 text-xs text-gray-600">
                <span className="font-semibold">Reference:</span> {[ticket.refName, ticket.refPhone, ticket.refLocation].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div>
              <h2 className="font-semibold mb-2">Subject</h2>
              <div className="text-sm">{ticket.subject}</div>
            </div>
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Description</h2>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(ticket.descriptionHtml) }} />
            </div>
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Attachments</h2>
              {ticket.attachments.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {ticket.attachments.map(a => {
                    const isImage = /^image\//.test(a.mimeType) || /\.(png|jpe?g|webp|gif)$/i.test(a.fileName || '')
                    return (
                      <a key={a.id} href={a.storageUrl} target="_blank" rel="noopener noreferrer" className="group block">
                        <div className="relative w-28 h-20 rounded border bg-white overflow-hidden flex items-center justify-center">
                          {isImage ? (
                            <Image src={a.storageUrl} alt={a.fileName} fill sizes="112px" className="object-cover" loading="lazy" />
                          ) : (
                            <div className="text-xs text-gray-600 flex items-center justify-center w-full h-full">File</div>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-700 mt-1 max-w-[7rem] truncate">{a.fileName}</div>
                      </a>
                    )
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No attachments</div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg border p-4 h-fit space-y-4">
            <StatusStepper current={ticket.status} />
            {ticket.status === 'NEED_INFO' && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 -mt-4 mb-2 text-center">Currently awaiting more information</p>
            )}
            {/* Role-based access: Admin can edit all, Agents can edit assigned tickets, Viewers can only view */}
            {(() => {
              const canEdit = user.role === 'OFFICE_ADMIN' || (user.role === 'OFFICE_AGENT' && ticket.assignedToId === user.id)
              const isViewer = user.role === 'OFFICE_VIEWER'
              
              return (
                <>
                  <div>
                    <h2 className="text-sm font-semibold mb-2">Ticket Owner</h2>
                    <TicketAssignment 
                      ticketNo={ticket.ticketNo} 
                      assignedTo={ticket.assignedTo}
                      assignedToId={ticket.assignedToId}
                      canEdit={canEdit}
                    />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div>
                    <h2 className="text-sm font-semibold mb-2">ETA</h2>
                    <TicketETA ticketNo={ticket.ticketNo} currentETA={ticket.eta} canEdit={canEdit} />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div>
                    <TicketStatusActions 
                      ticketNo={ticket.ticketNo} 
                      current={ticket.status} 
                      officeUsers={officeUsers}
                      canEdit={canEdit}
                      isOfficeTicket={ticket.source === 'OFFICE'}
                    />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div>
                    <h2 className="text-sm font-semibold mb-2">Priority</h2>
                    <PriorityControl ticketNo={ticket.ticketNo} current={ticket.priority} canEdit={canEdit} />
                  </div>
                  {isViewer && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      <strong>View Only:</strong> You have view-only access. Contact an admin to request edit permissions.
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Timeline</h2>
        <ul className="text-sm relative pl-4">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
          {events.map(ev => {
            let eventLabel = ev.eventType
            if (ev.eventType === 'STATUS_CHANGED') {
              eventLabel = 'Status changed'
            } else if (ev.eventType === 'PRIORITY') {
              eventLabel = 'Priority changed'
            } else if (ev.eventType === 'ASSIGNED' || ev.eventType === 'ASSIGN') {
              if (ev.toValue) {
                const assignedUser = officeUserMap.get(ev.toValue)
                if (assignedUser) {
                  const roleLabel = assignedUser.role ? assignedUser.role.replace('OFFICE_', '') : ''
                  eventLabel = `Ticket assigned to ${assignedUser.name}${roleLabel ? ` (${roleLabel})` : ''}`
                } else if (ev.note) {
                  const noteMatch = ev.note.match(/assigned to (.+?)(?:\s+during|$)/i)
                  eventLabel = noteMatch && noteMatch[1]
                    ? `Ticket assigned to ${noteMatch[1].trim()}`
                    : 'Ticket assigned'
                } else {
                  eventLabel = 'Ticket assigned'
                }
              } else {
                eventLabel = 'Ticket unassigned'
              }
            }
            
            return (
              <li key={ev.id} className="pl-4 mb-3">
                <span className="absolute -left-0.5 mt-1 h-2 w-2 rounded-full bg-orange-500" />
                <div className="font-semibold">
                  {eventLabel}
                  {ev.eventType === 'STATUS_CHANGED' && (ev.fromValue || ev.toValue) && (
                    <span className="ml-2 text-gray-600">{ev.fromValue || ''}{(ev.fromValue && ev.toValue) ? ' → ' : ''}{ev.toValue || ''}</span>
                  )}
                  {ev.eventType === 'PRIORITY' && (ev.fromValue || ev.toValue) && (
                    <span className="ml-2 text-gray-600">{ev.fromValue || ''}{(ev.fromValue && ev.toValue) ? ' → ' : ''}{ev.toValue || ''}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(ev.createdAt).toLocaleString()}
                  {ev.actor && ev.actor.name && (
                    <span className="ml-2">by {ev.actor.name}</span>
                  )}
                </div>
                {ev.note && ev.eventType !== 'ASSIGNED' && ev.eventType !== 'ASSIGN' && <div className="text-gray-700 mt-1">{ev.note}</div>}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Comments</h2>
        <ul className="text-sm space-y-3">
          {comments.map(c => (
            <li key={c.id} className="border rounded p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-xs ${c.isInternal ? 'bg-yellow-100 text-yellow-900' : 'bg-green-100 text-green-900'}`}>{c.isInternal ? 'Internal' : 'Public'}</span>
                <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(c.bodyHtml) }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

