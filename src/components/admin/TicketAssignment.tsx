'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'

type OfficeUser = {
  id: string
  name: string
  email: string
  role: string
}

export default function TicketAssignment({
  ticketNo,
  assignedTo,
  assignedToId,
  canEdit = true,
}: {
  ticketNo: string
  assignedTo?: { id: string; name: string; email: string | null; role: string } | null
  assignedToId?: string | null
  canEdit?: boolean
}) {
  const [officeUsers, setOfficeUsers] = useState<OfficeUser[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>(assignedToId || '')
  const [comment, setComment] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)

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
  }, [])

  useEffect(() => {
    setSelectedUserId(assignedToId || '')
  }, [assignedToId])

  const handleAssign = async () => {
    setLoading(true)
    try {
      const res = await apiFetch(`/api/mib/tickets/${ticketNo}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedToId: selectedUserId || null,
          comment: comment
        }),
        credentials: 'include'
      })
      const j = await res.json()
      if (j.success) {
        toast.success('Ticket assigned successfully')
        setComment('')
      } else {
        toast.error(j.error || 'Failed to assign ticket')
      }
    } catch (e) {
      toast.error('Failed to assign ticket')
    } finally {
      setLoading(false)
    }
  }

  const formattedOwner = assignedTo
    ? (() => {
        const roleLabel = assignedTo.role ? assignedTo.role.replace('OFFICE_', '') : ''
        return roleLabel ? `${assignedTo.name} • ${roleLabel}` : assignedTo.name
      })()
    : 'Not assigned'

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Owner</h3>
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
            assignedTo ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
          } whitespace-nowrap`}
        >
          <span>{formattedOwner}</span>
        </span>
      </div>

      {canEdit ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Assign to</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loadingUsers || loading}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-colors"
            >
              <option value="">Unassign</option>
              {officeUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('OFFICE_', '')})
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment for this change..."
            disabled={loading}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-colors"
            rows={2}
          />
          <button
            onClick={handleAssign}
            disabled={loading || loadingUsers}
            className="w-full px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold shadow-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Assigning…' : assignedToId ? 'Update owner' : 'Assign owner'}
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2">
          You do not have permission to reassign this ticket.
        </div>
      )}
    </div>
  )
}

