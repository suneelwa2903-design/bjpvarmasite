"use client"

import { useState } from 'react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'

export default function PriorityControl({ ticketNo, current, canEdit = true }: { ticketNo: string; current: string; canEdit?: boolean }) {
  const [priority, setPriority] = useState(current)
  const [next, setNext] = useState(current)
  const [loading, setLoading] = useState(false)

  const update = async () => {
    if (!next || next === priority) return
    setLoading(true)
    const res = await apiFetch(`/api/mib/tickets/${ticketNo}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: next })
    })
    const json = await res.json()
    setLoading(false)
    if (json.success) {
      setPriority(json.data.priority)
    } else {
      toast.error(json.error || 'Failed to update priority')
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Priority</h3>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          {priority}
        </span>
      </div>
      {canEdit ? (
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2">
          <select
            value={next}
            onChange={(e) => setNext(e.target.value)}
            disabled={loading}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-colors"
          >
            <option value="P1">P1 – Critical</option>
            <option value="P2">P2 – Moderate</option>
            <option value="P3">P3 – Normal</option>
            <option value="P4">P4 – Low</option>
          </select>
          <button
            onClick={update}
            disabled={loading || next === priority}
            className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? 'Updating…' : 'Apply'}
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2">
          You do not have permission to change the priority.
        </div>
      )}
    </div>
  )
}


