'use client'

import { useEffect, useState } from 'react'
import { GalleryItem } from '@/lib/types'
import { Save, Trash2, Plus } from 'lucide-react'
import Image from 'next/image'
import { apiFetch } from '@/lib/api-client'
import UploadGuidance from './UploadGuidance'

export default function GalleryManager({ data }: { data: any }) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editing, setEditing] = useState<GalleryItem | null>(null)

  useEffect(() => {
    setItems(Array.isArray(data?.gallery) ? data.gallery : [])
  }, [data])

  const uploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData()
    fd.append('image', file)
    fd.append('type', 'gallery')
    const res = await apiFetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' })
    if (!res.ok) return null
    const j = await res.json()
    return j.url as string
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Gallery</h2>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add Photo
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setIsSubmitting(true)
            const form = e.target as HTMLFormElement
            const fd = new FormData(form)

            let imageUrl = editing?.image || ''
            if (imageFile) {
              const url = await uploadImage(imageFile)
              if (url) imageUrl = url
            }

            const payload: GalleryItem = {
              title: (fd.get('title') as string) || '',
              date: (fd.get('date') as string) || new Date().toISOString().slice(0, 10),
              description: (fd.get('description') as string) || '',
              image: imageUrl
            }

            try {
              const response = await apiFetch('/api/admin/data', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'gallery', id: editing?.id, data: payload }),
                              })
              if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                alert(err.error || 'Failed to save photo')
                return
              }
              const resJson = await response.json()
              setItems(resJson.data.gallery || [])
              setShowForm(false)
              setImageFile(null); setImagePreview(null)
              form.reset()
            } catch (err) {
              console.error('Save gallery error:', err)
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea name="description" rows={3} defaultValue={editing?.description} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <UploadGuidance
                dimensions="1920 × 1080 px"
                format="JPEG, under 500 KB"
                tip="Visitors can click to view the full image, so the full frame is preserved."
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null
                  setImageFile(f)
                  setImagePreview(f ? URL.createObjectURL(f) : null)
                }}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {imagePreview && (
                <div className="relative w-24 h-24 rounded mt-2 border overflow-hidden">
                  <Image src={imagePreview} alt="preview" fill className="object-cover" sizes="96px" unoptimized />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setImageFile(null); setImagePreview(null) }} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2" disabled={isSubmitting}>
              <Save className="h-5 w-5" /> {isSubmitting ? 'Saving...' : (editing ? 'Update Photo' : 'Save Photo')}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((g) => (
          <div key={g.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-44 bg-gray-100">
              <Image src={g.image} alt={g.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            </div>
            <div className="p-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">{g.date}</div>
                <div className="font-bold text-gray-900">{g.title}</div>
                <div className="text-sm text-gray-600 line-clamp-2">{g.description}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(g); setShowForm(true) }} className="px-3 py-2 border rounded hover:bg-gray-50">Edit</button>
                <button
                  onClick={async () => {
                    if (!confirm('Delete this photo?')) return
                    const res = await apiFetch('/api/admin/data', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: 'gallery', id: g.id }),
                                          })
                    if (res.ok) {
                      const j = await res.json()
                      setItems(j.data.gallery || [])
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
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p>No photos yet. Click "Add Photo" to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}


