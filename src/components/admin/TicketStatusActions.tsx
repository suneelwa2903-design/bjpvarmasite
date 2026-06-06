"use client"

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'

const STATUSES = ['CREATED', 'OPEN', 'IN_PROGRESS', 'NEED_INFO', 'RESOLVED', 'CLOSED'] as const
const ALLOWED: Record<string, string[]> = {
  CREATED: ['OPEN'],
  OPEN: ['IN_PROGRESS', 'NEED_INFO', 'RESOLVED'],
  IN_PROGRESS: ['NEED_INFO', 'RESOLVED'],
  NEED_INFO: ['OPEN'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
}

type OfficeUser = { id: string; name: string; email: string | null; role: string }

export default function TicketStatusActions({
  ticketNo,
  current,
  canEdit = true,
  isOfficeTicket = false,
  officeUsers = [],
}: {
  ticketNo: string
  current: string
  canEdit?: boolean
  isOfficeTicket?: boolean
  officeUsers?: OfficeUser[]
}) {
  const normalize = (s: string) => (s === 'NEW' ? 'CREATED' : s)
  const [status, setStatus] = useState(current)
  const [next, setNext] = useState<string>('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'STATUS' | 'COMMENT'>('STATUS')
  const [commentVisibility, setCommentVisibility] = useState<'EXTERNAL' | 'INTERNAL'>('EXTERNAL')
  const [file, setFile] = useState<File | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const uploadIfNeeded = async () => {
    if (!file) return null
    const fd = new FormData()
    fd.append('image', file)
    const up = await apiFetch('/api/mib/upload', { method: 'POST', body: fd })
    const meta = await up.json()
    if (!up.ok) {
      toast.error(meta?.error || 'Upload failed')
      return null
    }
    await apiFetch(`/api/mib/tickets/${ticketNo}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        storageUrl: meta.key,
      }),
    })
    return meta
  }

  const submit = async () => {
    if (mode === 'STATUS') {
      if (!next || next === status) return
      if (!note.trim()) {
        toast.error('Please enter a comment explaining this status change.')
        return
      }
      setLoading(true)
      await uploadIfNeeded()
      const body = { action: next, note: note.trim() }
      const res = await apiFetch(`/api/mib/tickets/${ticketNo}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      setLoading(false)
      if (json.success) {
        setStatus(json.data.status)
        setNote('')
        setNext('')
        setFile(null)
        toast.success('Updated successfully')
      } else {
        toast.error(json.error || 'Failed to update status')
      }
    } else {
      if (!note.trim()) {
        toast.error('Enter comment')
        return
      }
      setLoading(true)
      await uploadIfNeeded()
      const visibility = commentVisibility
      const res = await apiFetch(`/api/mib/tickets/${ticketNo}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: note.trim(), visibility }),
      })
      const json = await res.json()
      setLoading(false)
      if (json.success) {
        setNote('')
        setFile(null)
      } else {
        toast.error(json.error || 'Failed to add comment')
      }
    }
  }

  if (!mounted) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700" suppressHydrationWarning>
        <div>
          Current status: <span className="font-semibold">{status}</span>
        </div>
      </div>
    )
  }

  const actionButtonLabel = mode === 'STATUS' ? 'Update status' : 'Add comment'

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Current Status</h3>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          {status}
        </span>
      </div>

      {canEdit ? (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                mode === 'STATUS'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => {
                setMode('STATUS')
                setNote('')
                setFile(null)
                setNext('')
              }}
            >
              Status change
            </button>
            {!isOfficeTicket && (
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  mode === 'COMMENT'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setMode('COMMENT')
                  setCommentVisibility('EXTERNAL')
                  setNote('')
                  setFile(null)
                }}
              >
                Add comment
              </button>
            )}
          </div>

          {mode === 'STATUS' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2">
                <select
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  disabled={loading}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-colors"
                  suppressHydrationWarning
                >
                  <option value="">Select next status</option>
                  {ALLOWED[normalize(status)]?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={submit}
                  disabled={loading || !next}
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {loading ? 'Updating…' : 'Apply'}
                </button>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
                placeholder="Add required status change comment (visible to citizen)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-colors"
                rows={3}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    checked={commentVisibility === 'EXTERNAL'}
                    onChange={() => setCommentVisibility('EXTERNAL')}
                  />
                  External (visible to citizen)
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    checked={commentVisibility === 'INTERNAL'}
                    onChange={() => setCommentVisibility('INTERNAL')}
                  />
                  Internal (team only)
                </label>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
                placeholder="Add your comment…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-colors"
                rows={3}
              />
            </div>
          )}

          {/* File input + helper text always stack vertically. Previously this
              used `sm:flex-row` which broke when the actions panel sat in a
              narrow sidebar (e.g. the office ticket detail page) — the helper
              text squished into a vertical strip on the right. Stacking is
              cleaner at every width. */}
          <div className="flex flex-col gap-2">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
              className="block w-full text-sm text-gray-600 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500">
              {mode === 'STATUS'
                ? 'A comment is mandatory for status changes. Status changes notify the citizen.'
                : commentVisibility === 'EXTERNAL'
                ? 'External comments notify the citizen.'
                : 'Internal comments are visible only to the office team.'}
            </p>
          </div>

          <button
            onClick={submit}
            disabled={loading || (mode === 'STATUS' ? !next : false)}
            className="w-full px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? 'Saving…' : actionButtonLabel}
          </button>
        </>
      ) : (
        <div className="text-sm text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2">
          You do not have permission to update the status.
        </div>
      )}
    </div>
  )
}
