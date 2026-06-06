'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import Image from 'next/image'
import { apiFetch } from '@/lib/api-client'
import UploadGuidance from './UploadGuidance'

interface Initiative {
  id: string
  title: string
  description: string
  type: 'constituency' | 'ministry'
  date: string
  isActive: boolean
  achievements: string[]
  images?: string[]
  fundingAmount?: string
  officialLetterUrl?: string
}

export default function InitiativesManager({ data }: { data: any }) {
  const [initiatives, setInitiatives] = useState<Initiative[]>(() =>
    Array.isArray(data?.initiatives) ? data.initiatives : []
  )
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Initiative | null>(null)
  const [selectedType, setSelectedType] = useState<'constituency' | 'ministry'>('constituency')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const openAdd = () => {
    setEditing(null)
    setImages([])
    setImagePreviews([])
    setPdfFile(null)
    setShowForm(true)
  }

  const openEdit = (item: Initiative) => {
    setEditing(item)
    setImages([])
    setImagePreviews([])
    setPdfFile(null)
    setShowForm(true)
  }

  const closeForm = () => {
    setEditing(null)
    setShowForm(false)
    setImages([])
    setImagePreviews([])
    setPdfFile(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    // Upload images
    let imageUrls: string[] = editing?.images ? [...editing.images] : []
    if (images.length > 0) {
      imageUrls = []
      for (const file of images) {
        const f = new FormData()
        f.append('image', file)
        f.append('type', 'initiatives')
        const res = await apiFetch('/api/admin/upload', { method: 'POST', body: f })
        if (res.ok) {
          const d = await res.json()
          if (d.url) imageUrls.push(d.url)
        }
      }
    }

    // Upload PDF if provided
    let officialLetterUrl = (formData.get('officialLetterUrl') as string)?.trim() || editing?.officialLetterUrl || ''
    if (pdfFile) {
      const f = new FormData()
      f.append('image', pdfFile)
      f.append('type', 'initiatives')
      const res = await apiFetch('/api/admin/upload', { method: 'POST', body: f })
      if (res.ok) {
        const d = await res.json()
        if (d.url) officialLetterUrl = d.url
      }
    }

    const payload: Partial<Initiative> = {
      title: (formData.get('title') as string)?.trim(),
      description: (formData.get('description') as string)?.trim(),
      type: formData.get('type') as 'constituency' | 'ministry',
      date: (formData.get('date') as string) || new Date().toISOString().slice(0, 10),
      isActive: (formData.get('isActive') as string) === 'on',
      achievements: (formData.get('achievements') as string)
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) || [],
      images: imageUrls,
      fundingAmount: (formData.get('fundingAmount') as string)?.trim() || undefined,
      officialLetterUrl: officialLetterUrl || undefined,
    }

    try {
      const res = await apiFetch('/api/admin/data', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'initiative', id: editing?.id, data: payload }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to save impact item')
        return
      }
      const result = await res.json()
      setInitiatives(result.data.initiatives || [])
      closeForm()
      form.reset()
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this impact item?')) return
    const res = await apiFetch('/api/admin/data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'initiative', id }),
    })
    if (res.ok) {
      const j = await res.json()
      setInitiatives(j.data.initiatives || [])
    } else {
      alert('Failed to delete')
    }
  }

  const filteredImpact = initiatives.filter((item) => item.type === selectedType)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Impact</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add New Impact Item
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white rounded-lg shadow p-6 space-y-4 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">{editing ? 'Edit Impact Item' : 'New Impact Item'}</h3>
            <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select name="type" defaultValue={editing?.type || selectedType} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="constituency">Constituency</option>
                <option value="ministry">Ministry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Funding Amount (e.g. ₹2,787 Cr)</label>
              <input name="fundingAmount" placeholder="₹362.23 Cr" defaultValue={editing?.fundingAmount} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" rows={3} defaultValue={editing?.description} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Achievements (comma separated)</label>
              <input name="achievements" defaultValue={editing?.achievements?.join(', ')} placeholder="e.g. Launched scheme A, Built 10 schools" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Official Letter URL (or paste below)</label>
              <input name="officialLetterUrl" placeholder="https://... (leave blank if uploading PDF)" defaultValue={editing?.officialLetterUrl} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Official Letter (PDF, optional)</label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {pdfFile && <p className="text-xs text-gray-500 mt-1">Selected: {pdfFile.name}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Images (multiple)</label>
              <UploadGuidance
                dimensions="1920 × 1080 px"
                format="JPEG, under 500 KB"
                tip="Top and bottom may be cropped on this section — keep important content in the middle."
              />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []) as File[]
                  setImages(files)
                  setImagePreviews(files.map((f) => URL.createObjectURL(f)))
                }}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {/* Show existing images when editing */}
              {editing?.images && editing.images.length > 0 && images.length === 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Current images (upload new to replace):</p>
                  <div className="flex flex-wrap gap-2">
                    {editing.images.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded border overflow-hidden">
                        <Image src={src} alt={`img ${i + 1}`} fill className="object-cover" sizes="64px" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {imagePreviews.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-16 h-16 rounded border overflow-hidden">
                      <Image src={src} alt="preview" fill className="object-cover" sizes="64px" unoptimized />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input id="iIsActive" name="isActive" type="checkbox" className="h-4 w-4" defaultChecked={editing ? editing.isActive : true} />
              <label htmlFor="iIsActive" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeForm} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2" disabled={isSubmitting}>
              <Save className="h-4 w-4" />{isSubmitting ? 'Saving...' : (editing ? 'Update Impact Item' : 'Save Impact Item')}
            </button>
          </div>
        </form>
      )}

      {/* Type Filter */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setSelectedType('constituency')} className={`px-6 py-2 rounded-lg font-semibold transition-all ${selectedType === 'constituency' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Constituency</button>
        <button onClick={() => setSelectedType('ministry')} className={`px-6 py-2 rounded-lg font-semibold transition-all ${selectedType === 'ministry' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Ministry</button>
      </div>

      {/* Impact Items List */}
      <div className="space-y-4">
        {filteredImpact.map((initiative) => (
          <div key={initiative.id} className="bg-white rounded-lg shadow-md p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${initiative.type === 'ministry' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {initiative.type}
                  </span>
                  <span className="text-xs text-gray-500">{initiative.date}</span>
                  {initiative.fundingAmount && (
                    <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded-full">{initiative.fundingAmount}</span>
                  )}
                  {!initiative.isActive && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Inactive</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{initiative.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{initiative.description}</p>
                {initiative.officialLetterUrl && (
                  <a href={initiative.officialLetterUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline">View Official Letter →</a>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {initiative.achievements?.slice(0, 2).map((ach, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded line-clamp-1 max-w-xs">{ach}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(initiative)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(initiative.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredImpact.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            <p>No {selectedType} impact items yet. Click &ldquo;Add New Impact Item&rdquo; to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
