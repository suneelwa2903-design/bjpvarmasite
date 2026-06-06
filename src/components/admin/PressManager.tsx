'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Save, Star } from 'lucide-react'
import Image from 'next/image'
import { PressItem, PressCategory } from '@/lib/types'
import { slugify } from '@/lib/utils'
import { apiFetch } from '@/lib/api-client'
import UploadGuidance from './UploadGuidance'

export default function PressManager({ data }: { data: any }) {
  const [items, setItems] = useState<PressItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [editing, setEditing] = useState<PressItem | null>(null)

  useEffect(() => {
    setItems(Array.isArray(data?.press) ? data.press : [])
  }, [data])

  const years = useMemo(() => {
    const ys = new Set<string>()
    for (const p of items) if (p.date) ys.add(p.date.slice(0, 4))
    return Array.from(ys).sort((a, b) => b.localeCompare(a))
  }, [items])

  const uploadAsset = async (file: File): Promise<string | null> => {
    const fd = new FormData()
    fd.append('image', file)
    fd.append('type', 'press')
    const res = await apiFetch('/api/admin/upload', { method: 'POST', body: fd })
    if (!res.ok) return null
    const j = await res.json()
    return j.url as string
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Press Releases</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Press Item
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
            let linkUrl = (fd.get('link') as string) || ''

            if (thumbFile) {
              const url = await uploadAsset(thumbFile)
              if (url) thumbnailUrl = url
            }

            if (pdfFile) {
              const url = await uploadAsset(pdfFile)
              if (url) linkUrl = url
            }

            const payload: Partial<PressItem> = {
              slug: editing?.slug || slugify(fd.get('title') as string),
              title: (fd.get('title') as string) || '',
              date: (fd.get('date') as string) || new Date().toISOString().slice(0, 10),
              category: fd.get('category') as PressCategory,
              summary: (fd.get('summary') as string) || '',
              source: (fd.get('source') as string) || '',
              link: linkUrl,
              thumbnail: thumbnailUrl,
              isFeatured: (fd.get('isFeatured') as string) === 'on',
            }

            try {
              const response = await apiFetch('/api/admin/data', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'press', id: editing?.id, data: payload }),
              })
              if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                alert(err.error || 'Failed to save press item')
                return
              }
              const resJson = await response.json()
              setItems(resJson.data.press || [])
              setShowForm(false)
              setThumbFile(null); setThumbPreview(null); setPdfFile(null)
              form.reset()
            } catch {
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" defaultValue={editing?.category || 'Release'} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="Release">Release</option>
                <option value="Statement">Statement</option>
                <option value="Article">Article</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input name="source" defaultValue={editing?.source} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <textarea name="summary" rows={3} defaultValue={editing?.summary} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">External / PDF Link</label>
              <input name="link" placeholder="https://... or will auto-fill if PDF uploaded" defaultValue={editing?.link} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
              <UploadGuidance
                dimensions="1920 × 1080 px"
                format="JPEG, under 500 KB"
                tip="Used at multiple sizes across the site — keep important content in the central area."
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
              {thumbPreview ? (
                <div className="relative w-24 h-24 rounded mt-2 border overflow-hidden">
                  <Image src={thumbPreview} alt="preview" fill className="object-cover" sizes="96px" unoptimized />
                </div>
              ) : editing?.thumbnail ? (
                <div className="relative w-24 h-24 rounded mt-2 border overflow-hidden">
                  <Image src={editing.thumbnail} alt="current" fill className="object-cover" sizes="96px" />
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF (optional)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {pdfFile && <p className="text-xs text-gray-600 mt-1">Selected: {pdfFile.name}</p>}
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                id="isFeatured"
                name="isFeatured"
                type="checkbox"
                className="h-4 w-4"
                defaultChecked={(editing as any)?.isFeatured === true}
              />
              <label htmlFor="isFeatured" className="text-sm text-gray-700 flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" /> Featured (show in homepage carousel)
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditing(null); setThumbFile(null); setThumbPreview(null); setPdfFile(null) }}
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
              {isSubmitting ? 'Saving...' : (editing ? 'Update Press' : 'Save Press')}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-4">
        {items.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold">{p.category}</span>
                  <span>{p.date}</span>
                  <span>•</span>
                  <span>{p.source}</span>
                  {(p as any).isFeatured && (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-semibold">
                      <Star className="h-3 w-3" /> Featured
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900">{p.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{p.summary}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => { setEditing(p); setShowForm(true) }} className="px-3 py-2 border rounded hover:bg-gray-50 text-sm">Edit</button>
                <button
                  onClick={async () => {
                    if (!confirm('Delete this press item?')) return
                    const res = await apiFetch('/api/admin/data', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ type: 'press', id: p.id }),
                    })
                    if (res.ok) {
                      const j = await res.json()
                      setItems(j.data.press || [])
                    } else {
                      alert('Failed to delete')
                    }
                  }}
                  className="px-3 py-2 border rounded text-red-600 hover:bg-red-50 flex items-center gap-1 text-sm"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p>No press items yet. Click &ldquo;Add Press Item&rdquo; to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
