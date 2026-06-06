'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, Edit } from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

interface YearlyReport {
  id: string
  year: string
  title: string
  available: boolean
  pdfPath?: string
  highlights: string[]
}

export default function YearlyReportsManager({ data }: { data: any }) {
  const [reports, setReports] = useState<YearlyReport[]>(() =>
    Array.isArray(data?.yearlyReports) ? data.yearlyReports : []
  )
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<YearlyReport | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openAdd = () => { setEditing(null); setShowForm(true) }
  const openEdit = (r: YearlyReport) => { setEditing(r); setShowForm(true) }
  const closeForm = () => { setEditing(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      year: (fd.get('year') as string).trim(),
      title: (fd.get('title') as string).trim(),
      available: (fd.get('available') as string) === 'on',
      pdfPath: (fd.get('pdfPath') as string).trim() || undefined,
      highlights: (fd.get('highlights') as string)
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    try {
      const res = await apiFetch('/api/admin/data', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'yearlyReport', id: editing?.id, data: payload }),
      })
      if (!res.ok) { alert('Failed to save report'); return }
      const j = await res.json()
      setReports(j.data.yearlyReports || [])
      closeForm()
      form.reset()
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return
    const res = await apiFetch('/api/admin/data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'yearlyReport', id }),
    })
    if (res.ok) {
      const j = await res.json()
      setReports(j.data.yearlyReports || [])
    } else {
      alert('Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Yearly Reports</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Report
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white rounded-lg shadow p-6 space-y-4 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800">{editing ? 'Edit Report' : 'New Report'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year (e.g. 2024–25)</label>
              <input name="year" required defaultValue={editing?.year} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input name="title" required defaultValue={editing?.title} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PDF / Link (optional)</label>
              <input name="pdfPath" placeholder="/uploads/report.pdf or https://..." defaultValue={editing?.pdfPath} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input id="rAvailable" name="available" type="checkbox" className="h-4 w-4" defaultChecked={editing ? editing.available : false} />
              <label htmlFor="rAvailable" className="text-sm text-gray-700">Report available (show download button)</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (one per line)</label>
              <textarea
                name="highlights"
                rows={4}
                defaultValue={editing?.highlights?.join('\n')}
                placeholder="₹2,787 crore secured for Amaravati&#10;Another highlight"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeForm} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2" disabled={isSubmitting}>
              <Save className="h-4 w-4" />{isSubmitting ? 'Saving...' : (editing ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="bg-white rounded-lg shadow p-5 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {r.available ? 'Available' : 'Coming Soon'}
                </span>
                <span className="text-sm font-bold text-gray-900">{r.year}</span>
              </div>
              <p className="text-sm text-gray-700 font-medium">{r.title}</p>
              {r.pdfPath && <p className="text-xs text-orange-600 mt-0.5 truncate">{r.pdfPath}</p>}
              <ul className="mt-2 space-y-0.5">
                {r.highlights?.slice(0, 2).map((h, i) => (
                  <li key={i} className="text-xs text-gray-500">• {h}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p>No reports yet. Click &ldquo;Add Report&rdquo; to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
