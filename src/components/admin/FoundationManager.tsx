'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { apiFetch } from '@/lib/api-client'
import UploadGuidance from './UploadGuidance'

interface FoundationItem {
  id: string
  title: string
  description: string
  date: string
  image: string
  link?: string
  isActive: boolean
  createdAt?: string
}

export default function FoundationManager({ data }: { data: any }) {
  const [items, setItems] = useState<FoundationItem[]>(() =>
    Array.isArray(data?.foundation) ? data.foundation : []
  )
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<FoundationItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (data?.foundation) {
      setItems(Array.isArray(data.foundation) ? data.foundation : [])
    }
  }, [data])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = editing?.image || ''

      if (selectedImage) {
        const uploadFormData = new FormData()
        uploadFormData.append('image', selectedImage)
        uploadFormData.append('type', 'foundation')

        const uploadResponse = await apiFetch('/api/admin/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          imageUrl = uploadResult.url
        } else {
          alert('Image upload failed')
          setIsSubmitting(false)
          return
        }
      }

      const formData = new FormData(e.target as HTMLFormElement)
      const itemData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        date: formData.get('date') as string,
        image: imageUrl,
        link: (formData.get('link') as string) || '',
        isActive: formData.get('isActive') === 'true',
      }

      const response = await apiFetch('/api/admin/data', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'foundation',
          id: editing?.id,
          data: itemData,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setItems(result.data.foundation || [])
        setShowForm(false)
        setEditing(null)
        setSelectedImage(null)
        setImagePreview(null)
        alert('CSR initiative saved successfully!')
      } else {
        alert('Failed to save. Please try again.')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error saving. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CSR initiative?')) return

    try {
      const response = await apiFetch('/api/admin/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'foundation', id }),
      })

      if (response.ok) {
        const result = await response.json()
        setItems(result.data.foundation || [])
        alert('Deleted successfully!')
      } else {
        alert('Failed to delete')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error deleting')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Foundation / CSR</h2>
          <p className="text-sm text-gray-500 mt-1">Manage Corporate Social Responsibility initiatives shown on the homepage</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add CSR Initiative
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editing ? 'Edit CSR Initiative' : 'Add CSR Initiative'}
                </h3>
                <button
                  onClick={() => { setShowForm(false); setEditing(null); setSelectedImage(null); setImagePreview(null) }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    maxLength={150}
                    defaultValue={editing?.title || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                    placeholder="e.g., Rural Education Program"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    maxLength={500}
                    defaultValue={editing?.description || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                    placeholder="Brief description of the CSR initiative"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      name="date"
                      required
                      defaultValue={editing?.date || new Date().toISOString().slice(0, 10)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      name="isActive"
                      defaultValue={editing?.isActive !== false ? 'true' : 'false'}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Link (Optional)</label>
                  <input
                    type="url"
                    name="link"
                    defaultValue={editing?.link || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                    placeholder="https://example.com/csr-details"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                  <UploadGuidance
                    dimensions="1920 × 1080 px"
                    format="JPEG, under 500 KB"
                    tip="A dark gradient overlay covers the bottom of the image — avoid placing text or key elements in the lower third."
                  />
                  {imagePreview ? (
                    <div className="space-y-2">
                      <div className="relative h-48 rounded-lg border overflow-hidden">
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
                        <button type="button" onClick={() => { setSelectedImage(null); setImagePreview(null) }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input type="file" id="foundation-image" className="hidden" accept="image/*" onChange={handleImageSelect} />
                      <label htmlFor="foundation-image"
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors block">
                        <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (max 5MB)</p>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Saving...</> : <><Save className="h-5 w-5" /> {editing ? 'Update' : 'Save'}</>}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditing(null); setSelectedImage(null); setImagePreview(null) }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {item.image && (
              <div className="relative h-44 bg-gray-100">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                {!item.isActive && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Inactive</div>
                )}
              </div>
            )}
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-1">{item.date ? new Date(item.date).toLocaleDateString('en-IN') : ''}</p>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
              {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline">View Details →</a>}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => { setEditing(item); setShowForm(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p>No CSR initiatives yet. Click &quot;Add CSR Initiative&quot; to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
