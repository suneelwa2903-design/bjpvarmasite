'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'

export default function TicketETA({ 
  ticketNo, 
  currentETA,
  canEdit = true
}: { 
  ticketNo: string
  currentETA?: string | Date | null
  canEdit?: boolean
}) {
  const [eta, setEta] = useState<string>(currentETA ? new Date(currentETA).toISOString().split('T')[0] : '')
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState<string>(currentETA ? new Date(currentETA).toTimeString().slice(0, 5) : '')

  const handleUpdate = async () => {
    if (!eta) {
      // Clear ETA
      setLoading(true)
      try {
        const res = await apiFetch(`/api/mib/tickets/${ticketNo}/eta`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eta: null }),
          credentials: 'include'
        })
        const j = await res.json()
        if (j.success) {
          setEta('')
          setTime('')
          toast.success('ETA cleared successfully')
        } else {
          toast.error(j.error || 'Failed to update ETA')
        }
      } catch (e) {
        toast.error('Failed to update ETA')
      } finally {
        setLoading(false)
      }
      return
    }

    // Set ETA
    const dateTime = time ? `${eta}T${time}:00` : `${eta}T23:59:59`
    const etaDate = new Date(dateTime)
    
    if (isNaN(etaDate.getTime())) {
      toast.error('Invalid date/time')
      return
    }

    setLoading(true)
    try {
      const res = await apiFetch(`/api/mib/tickets/${ticketNo}/eta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eta: etaDate.toISOString() }),
        credentials: 'include'
      })
      const j = await res.json()
      if (j.success) {
        toast.success('ETA updated successfully')
      } else {
        toast.error(j.error || 'Failed to update ETA')
      }
    } catch (e) {
      toast.error('Failed to update ETA')
    } finally {
      setLoading(false)
    }
  }

  const formattedEta = currentETA
    ? (() => {
        const date = new Date(currentETA)
        // Format as DD/MM/YYYY to match displayed convention
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        const datePart = `${day}/${month}/${year}`
        const timePart = date.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        return `${datePart} • ${timePart}`
      })()
    : null

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Target Date</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            formattedEta ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {formattedEta || 'Not added'}
        </span>
      </div>

      {canEdit ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              disabled={loading}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-colors"
              min={new Date().toISOString().split('T')[0]}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={loading || !eta}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-colors"
            />
          </div>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold shadow-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Updating…' : eta ? 'Update ETA' : 'Clear ETA'}
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2">
          You do not have permission to update the ETA.
        </div>
      )}
    </div>
  )
}

