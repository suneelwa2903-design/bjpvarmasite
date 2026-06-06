'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, Edit } from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

interface Quote {
  id: string
  en: string
  te: string
  isActive: boolean
}

export default function QuotesManager({ data }: { data: any }) {
  const [quotes, setQuotes] = useState<Quote[]>(() => Array.isArray(data?.quotes) ? data.quotes : [])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Quote | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openAdd = () => { setEditing(null); setShowForm(true) }
  const openEdit = (q: Quote) => { setEditing(q); setShowForm(true) }
  const closeForm = () => { setEditing(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      en: (fd.get('en') as string).trim(),
      te: (fd.get('te') as string).trim(),
      isActive: (fd.get('isActive') as string) === 'on',
    }
    try {
      const res = await apiFetch('/api/admin/data', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'quote', id: editing?.id, data: payload }),
      })
      if (!res.ok) { alert('Failed to save quote'); return }
      const j = await res.json()
      setQuotes(j.data.quotes || [])
      closeForm()
      form.reset()
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quote?')) return
    const res = await apiFetch('/api/admin/data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'quote', id }),
    })
    if (res.ok) {
      const j = await res.json()
      setQuotes(j.data.quotes || [])
    } else {
      alert('Failed to delete')
    }
  }

  const toggleActive = async (q: Quote) => {
    const res = await apiFetch('/api/admin/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'quote', id: q.id, data: { isActive: !q.isActive } }),
    })
    if (res.ok) {
      const j = await res.json()
      setQuotes(j.data.quotes || [])
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Quotes Ticker</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Quote
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white rounded-lg shadow p-6 space-y-4 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800">{editing ? 'Edit Quote' : 'New Quote'}</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">English Text</label>
            <textarea
              name="en"
              required
              rows={2}
              defaultValue={editing?.en}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telugu Text</label>
            <textarea
              name="te"
              rows={2}
              defaultValue={editing?.te}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="qIsActive"
              name="isActive"
              type="checkbox"
              className="h-4 w-4"
              defaultChecked={editing ? editing.isActive : true}
            />
            <label htmlFor="qIsActive" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeForm} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2" disabled={isSubmitting}>
              <Save className="h-4 w-4" />{isSubmitting ? 'Saving...' : (editing ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {quotes.map((q) => (
          <div key={q.id} className="bg-white rounded-lg shadow p-4 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{q.en}</p>
              {q.te && <p className="text-xs text-gray-500 mt-1 line-clamp-1" style={{ fontFamily: "'Noto Sans Telugu', sans-serif" }}>{q.te}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleActive(q)}
                className={`text-xs px-2 py-1 rounded-full font-semibold ${q.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {q.isActive ? 'Active' : 'Off'}
              </button>
              <button onClick={() => openEdit(q)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(q.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {quotes.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p>No quotes yet. Click &ldquo;Add Quote&rdquo; to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
