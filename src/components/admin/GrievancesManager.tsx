'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Download, ExternalLink, Loader2, Search } from 'lucide-react'
import Image from 'next/image'
import TicketStatusActions from '@/components/admin/TicketStatusActions'
import TicketETA from '@/components/admin/TicketETA'
import TicketAssignment from '@/components/admin/TicketAssignment'
import PriorityControl from '@/components/admin/PriorityControl'
import { sanitizeHtml } from '@/lib/security/sanitize'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'

type Ticket = {
  id: string
  ticketNo: string
  source?: string
  applicantName: string
  mobile: string
  email?: string
  category: string
  categoryType: string
  district: string
  subject: string
  descriptionHtml: string
  status: string
  priority: string
  createdAt: string
  eta?: string | Date | null
  attachments: Array<{ id: string; fileName: string; mimeType: string; sizeBytes: number; storageUrl: string }>
  refName?: string
  refPhone?: string
  refLocation?: string
  assignedTo?: { id: string; name: string; email: string; role: string } | null
  assignedToId?: string | null
}

export default function GrievancesManager() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, any>>({})
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sourceFilter, setSourceFilter] = useState<string>('')
  const [officeUsers, setOfficeUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams()
        if (statusFilter) params.append('status', statusFilter)
        if (sourceFilter) params.append('source', sourceFilter)
        params.append('take', '200')
        const res = await apiFetch(`/api/mib/tickets/admin?${params}`, { credentials: 'include' })
        const json = await res.json()
        setTickets(json.data as Ticket[])
      } catch (e) {
        setTickets([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [statusFilter, sourceFilter])

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true)
      try {
        const res = await apiFetch('/api/office/users', { credentials: 'include' })
        const json = await res.json()
        if (json.success) {
          setOfficeUsers(json.data)
        }
      } catch (e) {
        console.error('Failed to load office users', e)
      } finally {
        setLoadingUsers(false)
      }
    }
    loadUsers()

    const loadCurrentUser = async () => {
      try {
        const res = await apiFetch('/api/office/me', { credentials: 'include' })
        const json = await res.json()
        if (json.success && json.data) {
          setCurrentUser({ id: json.data.id, role: json.data.role })
        }
      } catch (e) {
        console.error('Failed to load current user', e)
      }
    }
    loadCurrentUser()
  }, [])

  const toggle = async (t: Ticket) => {
    const id = t.id
    setExpandedId((curr) => (curr === id ? null : id))
    if (expandedId !== id && !details[id]) {
      try {
        const res = await apiFetch(`/api/mib/tickets/${t.ticketNo}/details`, { credentials: 'include' })
        const json = await res.json()
        if (json.success) setDetails((d) => ({ ...d, [id]: json.data }))
      } catch {}
    }
  }

  const officeUserMap = useMemo(() => new Map(officeUsers.map((u) => [u.id, u])), [officeUsers])

  const filtered = useMemo(() => {
    if (!tickets) return []
    const q = query.trim().toLowerCase()
    if (!q) return tickets
    return tickets.filter((t) =>
      [t.ticketNo, t.applicantName, t.mobile, t.email, t.subject, t.category, t.categoryType, t.district]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [tickets, query])

  const now = Date.now()

  const statusColor = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'CREATED':
        return 'bg-gray-100 text-gray-700'
      case 'OPEN':
        return 'bg-blue-100 text-blue-700'
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-700'
      case 'NEED_INFO':
        return 'bg-purple-100 text-purple-700'
      case 'RESOLVED':
        return 'bg-green-100 text-green-700'
      case 'CLOSED':
        return 'bg-gray-200 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ticket no, name, subject, district…"
                className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                suppressHydrationWarning
              />
            </div>
            <a
              className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-1"
              href="/api/office/tickets/export"
            >
              <Download className="h-4 w-4" /> Export XLSX
            </a>
          </div>
          <div className="flex gap-3">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-3 py-2 text-sm" suppressHydrationWarning>
              <option value="">All Status</option>
              <option value="NEW">NEW</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="NEED_INFO">NEED_INFO</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="border rounded px-3 py-2 text-sm" suppressHydrationWarning>
              <option value="">All Sources</option>
              <option value="PUBLIC">Public</option>
              <option value="OFFICE">Office</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center text-gray-500">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading tickets…
          </div>
        ) : (
          <>
          {/* Mobile card layout */}
          <div className="block lg:hidden">
            <div className="divide-y divide-gray-100">
              {filtered.map((t) => (
                <div
                  key={t.ticketNo}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow m-2"
                  onClick={() => window.location.href = `/office/tickets/${t.ticketNo}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-bold text-orange-600">{t.ticketNo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(t.status)}`}>{t.status}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{t.subject}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>{t.applicantName}</span>
                    <span>&bull;</span>
                    <span>{t.source || 'PUBLIC'}</span>
                    <span>&bull;</span>
                    <span>{t.priority || 'P2'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{t.category} / {t.categoryType}</span>
                    <span>{t.district}</span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-gray-500">No tickets found.</div>
              )}
            </div>
          </div>

          {/* Desktop table layout */}
          <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Ticket</th>
                  <th className="px-4 py-3 text-left">Applicant</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-left">Category / Type</th>
                  <th className="px-4 py-3 text-left">District</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">ETA</th>
                  <th className="px-4 py-3 text-left">Aging</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => {
                  const days = Math.max(0, Math.floor((now - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
                  return (
                    <React.Fragment key={t.id}>
                      <tr className="border-t hover:bg-orange-50/40 cursor-pointer" onClick={() => toggle(t)}>
                        <td className="px-4 py-3">{t.source || 'PUBLIC'}</td>
                        <td className="px-4 py-3 font-semibold text-blue-700">
                          <a href={`/office/tickets/${t.ticketNo}`} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} className="underline">{t.ticketNo}</a>
                        </td>
                        <td className="px-4 py-3">{t.applicantName}</td>
                        <td className="px-4 py-3">
                          {t.assignedTo ? (
                            <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-medium">
                              {t.assignedTo.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{t.category} / {t.categoryType}</td>
                        <td className="px-4 py-3">{t.district}</td>
                        <td className="px-4 py-3 whitespace-pre-line">{[t.refName, t.refPhone, t.refLocation].filter(Boolean).join('\n') || '-'}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{t.status}</span></td>
                        <td className="px-4 py-3">{t.priority}</td>
                        <td className="px-4 py-3 text-sm">
                          {t.eta ? (
                            <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-medium">
                              {new Date(t.eta).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-red-500 text-xs font-medium">Not added</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{days}d</td>
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                        <td className="px-2 py-3 text-right">
                          {expandedId === t.id ? <ChevronDown className="h-4 w-4 inline" /> : <ChevronRight className="h-4 w-4 inline" />}
                        </td>
                      </tr>
                      {expandedId === t.id && (
                        <tr className="border-t bg-gray-50/50">
                          <td colSpan={13} className="px-4 py-4">
                            <div className="grid grid-cols-1 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <div className="text-sm font-semibold mb-1">Subject</div>
                                  <div className="text-sm">{t.subject}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold mb-1">Description</div>
                                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(t.descriptionHtml) }} />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold mb-2">Attachments</div>
                                  {((details[t.id]?.attachments || t.attachments || []).length > 0) ? (
                                    <div className="flex flex-wrap gap-3">
                                      {(details[t.id]?.attachments || t.attachments || []).map((a: any) => {
                                        const isImage = /^image\//.test(a.mimeType) || /\.(png|jpe?g|webp|gif)$/i.test(a.fileName || '')
                                        return (
                                          <a key={a.id} href={a.storageUrl} target="_blank" className="group block">
                                            <div className="relative w-28 h-20 rounded border bg-white overflow-hidden flex items-center justify-center">
                                              {isImage ? (
                                                <Image src={a.storageUrl} alt={a.fileName || 'Attachment'} fill className="object-cover" sizes="112px" />
                                              ) : (
                                                <div className="text-xs text-gray-600 flex items-center justify-center w-full h-full">
                                                  <ExternalLink className="h-4 w-4 mr-1" /> File
                                                </div>
                                              )}
                                            </div>
                                            <div className="text-[11px] text-gray-700 mt-1 max-w-[7rem] truncate">{a.fileName}</div>
                                          </a>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500">No attachments</div>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <div className="p-4 rounded border bg-white shadow-sm">
                                    <div className="text-sm font-semibold mb-2">Status Workflow</div>
                                    <ul className="space-y-2 text-sm">
                                      {(details[t.id]?.events || []).map((ev: any, idx: number) => {
                                        let label = ev.eventType
                                        if (ev.eventType === 'STATUS_CHANGED') {
                                          label = `Status changed: ${ev.fromValue || ''} → ${ev.toValue || ''}`
                                        } else if (ev.eventType === 'PRIORITY') {
                                          label = `Priority changed: ${ev.fromValue || ''} → ${ev.toValue || ''}`
                                        } else if (ev.eventType === 'ASSIGNED' || ev.eventType === 'ASSIGN') {
                                          if (ev.toValue) {
                                            const assignedUser = officeUserMap.get(ev.toValue)
                                            if (assignedUser) {
                                              const roleLabel = assignedUser.role ? assignedUser.role.replace('OFFICE_', '') : ''
                                              label = `Ticket assigned to ${assignedUser.name}${roleLabel ? ` (${roleLabel})` : ''}`
                                            } else if (ev.note) {
                                              const noteMatch = ev.note.match(/assigned to (.+?)(?:\s+during|$)/i)
                                              label = noteMatch && noteMatch[1]
                                                ? `Ticket assigned to ${noteMatch[1].trim()}`
                                                : 'Ticket assigned'
                                            } else {
                                              label = 'Ticket assigned'
                                            }
                                          } else {
                                            label = 'Ticket unassigned'
                                          }
                                        } else if (ev.eventType === 'COMMENT') {
                                          label = 'Comment'
                                        }
                                        // For assignment events, don't show the note separately since name is in the label
                                        const shouldShowNote = !(ev.eventType === 'ASSIGNED' || ev.eventType === 'ASSIGN')
                                        const note = ev.note && ev.note.trim() && shouldShowNote ? ev.note : (label.includes('changed') && !label.includes('assigned') ? '' : shouldShowNote ? '-' : '')
                                        return (
                                          <li key={idx} className="flex items-start gap-2">
                                            <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                                            <div>
                                              <div className="font-semibold">{label}</div>
                                              {note && note !== '-' && <div className="text-gray-600">{note}</div>}
                                              <div className="text-xs text-gray-500">
                                                {new Date(ev.createdAt).toLocaleString()}
                                                {ev.actor && ev.actor.name && (
                                                  <span className="ml-2">by {ev.actor.name}</span>
                                                )}
                                              </div>
                                            </div>
                                          </li>
                                        )
                                      })}
                                      {!details[t.id]?.events?.length && (
                                        <li className="text-gray-500">No events yet.</li>
                                      )}
                                    </ul>
                                  </div>
                                  <div className="p-4 rounded border bg-white shadow-sm">
                                    <div className="text-sm font-semibold mb-2">Ticket Owner</div>
                                    {(() => {
                                      const isAdmin = currentUser?.role === 'OFFICE_ADMIN'
                                      const isAgentOwner = currentUser?.role === 'OFFICE_AGENT' && t.assignedToId === currentUser.id
                                      const canAssign = isAdmin || isAgentOwner
                                      const canEdit = Boolean(isAdmin || isAgentOwner)

                                      return (
                                        <div className="space-y-2" data-ticket-id={t.id}>
                                          {canAssign ? (
                                            <>
                                              <select
                                                name="assignee"
                                                defaultValue={t.assignedToId || ''}
                                                onClick={(e)=>e.stopPropagation()}
                                                onChange={(e)=>{ (t as any)._newAssigneeId = e.target.value }}
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                suppressHydrationWarning
                                              >
                                                <option value="">-- Unassign --</option>
                                                {officeUsers.map((u) => (
                                                  <option key={u.id} value={u.id}>{u.name} ({u.role.replace('OFFICE_', '')})</option>
                                                ))}
                                              </select>
                                              <textarea
                                                data-ticket-id={t.id}
                                                placeholder="Optional comment for assignment..."
                                                onClick={(e)=>e.stopPropagation()}
                                                onChange={(e)=>{ (t as any)._assignComment = e.target.value }}
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                rows={2}
                                                suppressHydrationWarning
                                              />
                                              <button
                                                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold shadow-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                onClick={async(e)=>{
                                          e.stopPropagation()
                                          const newAssigneeId = (t as any)._newAssigneeId !== undefined ? (t as any)._newAssigneeId : ''
                                          const currentAssigneeId = t.assignedToId || ''
                                          const assignComment = (t as any)._assignComment || ''

                                          // Check if assignment actually changed
                                          if (newAssigneeId === currentAssigneeId) {
                                            toast.error('Please select a different owner or unassign the ticket')
                                            return
                                          }

                                          const res = await apiFetch(`/api/mib/tickets/${t.ticketNo}/assign`, {
                                            method:'PATCH',
                                            headers:{'Content-Type':'application/json'},
                                            body: JSON.stringify({
                                              assignedToId: newAssigneeId || null,
                                              comment: assignComment
                                            })
                                          })
                                          const j = await res.json()
                                          if (j.success) {
                                            // Reload tickets to get updated assignment
                                            const params = new URLSearchParams()
                                            if (statusFilter) params.append('status', statusFilter)
                                            if (sourceFilter) params.append('source', sourceFilter)
                                            params.append('take', '200')
                                            const res2 = await apiFetch(`/api/mib/tickets/admin?${params}`, { credentials: 'include' })
                                            const json2 = await res2.json()
                                            setTickets(json2.data as Ticket[])
                                            // Reload details
                                            const det = await apiFetch(`/api/mib/tickets/${t.ticketNo}/details`).then(r=>r.json())
                                            if (det.success) setDetails((d)=>({ ...d, [t.id]: det.data }))
                                            // Clear assignment comment and reset dropdown
                                            delete (t as any)._assignComment
                                            delete (t as any)._newAssigneeId
                                            // Reset the select element - find it by looking for the select in the form area
                                            const formArea = document.querySelector(`[data-ticket-id="${t.id}"]`) as HTMLElement
                                            if (formArea) {
                                              const select = formArea.querySelector('select[name="assignee"]') as HTMLSelectElement
                                              if (select) select.value = j.data.assignedToId || ''
                                            }
                                            // Clear textarea
                                            const textarea = document.querySelector(`textarea[data-ticket-id="${t.id}"]`) as HTMLTextAreaElement
                                            if (textarea) textarea.value = ''
                                          } else {
                                            toast.error(j.error || 'Failed to assign ticket')
                                          }
                                        }}
                                      >
                                        Assign/Update Owner
                                      </button>
                                            </>
                                          ) : (
                                            <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded">
                                              {currentUser?.role === 'OFFICE_VIEWER'
                                                ? 'View only - no edit permissions'
                                                : !t.assignedToId
                                                  ? 'Ticket must be assigned to you to edit'
                                                  : 'Only admins or the current owner can assign tickets'}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })()}
                                    <div className="h-px bg-gray-200 my-3" />
                                    {(() => {
                                      const canEdit = currentUser ? (
                                        currentUser.role === 'OFFICE_ADMIN' ||
                                        (currentUser.role === 'OFFICE_AGENT' && t.assignedToId === currentUser.id)
                                      ) : false
                                      return <TicketETA ticketNo={t.ticketNo} currentETA={t.eta || details[t.id]?.eta} canEdit={canEdit} />
                                    })()}
                                    <div className="h-px bg-gray-200 my-3" />
                                    {(() => {
                                      const canEdit = currentUser ? (
                                        currentUser.role === 'OFFICE_ADMIN' ||
                                        (currentUser.role === 'OFFICE_AGENT' && t.assignedToId === currentUser.id)
                                      ) : false
                                      return <TicketStatusActions ticketNo={t.ticketNo} current={t.status} officeUsers={officeUsers} canEdit={canEdit} isOfficeTicket={t.source === 'OFFICE'} />
                                    })()}
                                    <div className="mt-2 text-xs text-gray-500">Status changes send an email to the applicant.</div>
                                    <div className="h-px bg-gray-200 my-3" />
                                    <div className="text-sm font-semibold mb-2">Priority</div>
                                    {(() => {
                                      const canEdit = currentUser ? (
                                        currentUser.role === 'OFFICE_ADMIN' ||
                                        (currentUser.role === 'OFFICE_AGENT' && t.assignedToId === currentUser.id)
                                      ) : false
                                      return canEdit ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                          <select
                                            defaultValue={t.priority}
                                            onClick={(e)=>e.stopPropagation()}
                                            onChange={(e)=>{ (t as any)._newPriority = e.target.value }}
                                            className="border rounded px-3 py-2 text-sm"
                                            suppressHydrationWarning
                                          >
                                            <option value="P1">P1 – Critical</option>
                                            <option value="P2">P2 – Moderate</option>
                                            <option value="P3">P3 – Normal</option>
                                            <option value="P4">P4 – Low</option>
                                          </select>
                                          <button
                                            className="px-3 py-1.5 rounded bg-orange-600 text-white text-sm hover:bg-orange-700"
                                            onClick={async(e)=>{
                                              e.stopPropagation()
                                              const next = (t as any)._newPriority || t.priority
                                              if (!next || next === t.priority) return
                                              const res = await apiFetch(`/api/mib/tickets/${t.ticketNo}/priority`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ priority: next }) })
                                              const j = await res.json()
                                              if (j.success) {
                                                t.priority = j.data.priority
                                                const det = await apiFetch(`/api/mib/tickets/${t.ticketNo}/details`).then(r=>r.json())
                                                if (det.success) setDetails((d)=>({ ...d, [t.id]: det.data }))
                                                // force re-render
                                                setTickets((list)=> list ? list.map(x=> x.id===t.id ? { ...x, priority: j.data.priority } : x) : list)
                                              } else {
                                                toast.error(j.error || 'Failed to update priority')
                                              }
                                            }}
                                            suppressHydrationWarning
                                          >
                                            Update Priority
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="text-sm text-gray-500 italic">View only - no edit permissions</div>
                                      )
                                    })()}
                                  </div>
                                  {/* Comment panel removed; using status card for all comment types */}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={13} className="px-4 py-10 text-center text-gray-500">No tickets found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
          </>
        )}
      </div>
    </div>
  )
}


