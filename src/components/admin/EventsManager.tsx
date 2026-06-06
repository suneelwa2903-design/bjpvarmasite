'use client'

import { useEffect, useState } from 'react'
import { Save, Trash2, Plus } from 'lucide-react'
import Image from 'next/image'
import { EventItem, EventStatus, EventCategory } from '@/lib/types'
import { slugify } from '@/lib/utils'
import { apiFetch } from '@/lib/api-client'
import UploadGuidance from './UploadGuidance'

export default function EventsManager({ data }: { data: any }) {
  const [items, setItems] = useState<EventItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [editing, setEditing] = useState<EventItem | null>(null)

  useEffect(() => {
    setItems(Array.isArray(data?.events) ? data.events : [])
  }, [data])

  const uploadThumb = async (file: File): Promise<string | null> => {
    const fd = new FormData()
    fd.append('image', file)
    fd.append('type', 'events')
    const res = await apiFetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' })
    if (!res.ok) return null
    const j = await res.json()
    return j.url as string
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Events</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Event
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setIsSubmitting(true)
            const form = e.target as HTMLFormElement
            const fd = new FormData(form)

            let thumbnailUrl = editing?.thumbnail || ''
            if (thumbFile) {
              const url = await uploadThumb(thumbFile)
              if (url) thumbnailUrl = url
            }

            const payload: EventItem = {
              slug: editing?.slug || slugify(fd.get('title') as string),
              title: (fd.get('title') as string) || '',
              date: (fd.get('date') as string) || new Date().toISOString().slice(0, 10),
              status: fd.get('status') as EventStatus,
              category: (fd.get('category') as EventCategory) || 'Other',
              location: (fd.get('location') as string) || '',
              summary: (fd.get('summary') as string) || '',
              link: (fd.get('link') as string) || '',
              thumbnail: thumbnailUrl
            }

            try {
              const response = await apiFetch('/api/admin/data', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'event', id: editing?.id, data: payload }),
                              })
              if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                alert(err.error || 'Failed to save event')
                return
              }
              const resJson = await response.json()
              setItems(resJson.data.events || [])
              setShowForm(false)
              setThumbFile(null); setThumbPreview(null)
              form.reset()
            } catch (err) {
              console.error('Save event error:', err)
              alert('Network error. Please try again.')
            } finally {
              setIsSubmitting(false)
            }
          }}
          className="mb-8 bg-white rounded-lg shadow p-6 space-y-4 border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input name="title" required defaultValue={editing?.title} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input name="date" type="date" defaultValue={editing?.date} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" defaultValue={editing?.status || 'Upcoming'} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="Upcoming">Upcoming</option>
                <option value="Past">Past</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" defaultValue={editing?.category || 'Other'} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Public Meeting</option>
                <option>Government Event</option>
                <option>Rally</option>
                <option>Conference</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input name="location" defaultValue={editing?.location} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">External Link (optional)</label>
              <input name="link" defaultValue={editing?.link} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <textarea name="summary" rows={3} defaultValue={editing?.summary} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
              <UploadGuidance
                dimensions="1920 × 1080 px"
                format="JPEG, under 500 KB"
                tip="Top and bottom may be cropped — center the action."
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null
                  setThumbFile(f)
                  setThumbPreview(f ? URL.createObjectURL(f) : null)
                }}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {thumbPreview && (
                <div className="relative w-24 h-24 rounded mt-2 border overflow-hidden">
                  <Image src={thumbPreview} alt="preview" fill className="object-cover" sizes="96px" unoptimized />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditing(null); setThumbFile(null); setThumbPreview(null) }}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Save className="h-5 w-5" />
              {isSubmitting ? 'Saving...' : (editing ? 'Update Event' : 'Save Event')}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-4">
        {items.map((e) => (
          <div key={e.id} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${e.status === 'Upcoming' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{e.status}</span>
                  <span>{e.date}</span>
                  {e.location && <><span>•</span><span>{e.location}</span></>}
                </div>
                <h3 className="font-bold text-gray-900">{e.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{e.summary}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => { setEditing(e); setShowForm(true) }} className="px-3 py-2 border rounded hover:bg-gray-50">Edit</button>
                <button
                  onClick={async () => {
                    if (!confirm('Delete this event?')) return
                    const res = await apiFetch('/api/admin/data', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: 'event', id: e.id }),
                                          })
                    if (res.ok) {
                      const j = await res.json()
                      setItems(j.data.events || [])
                    } else {
                      alert('Failed to delete')
                    }
                  }}
                  className="px-3 py-2 border rounded text-red-600 hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p>No events yet. Click "Add Event" to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}


