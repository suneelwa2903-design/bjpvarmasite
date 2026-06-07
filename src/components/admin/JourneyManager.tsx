'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Upload, GripVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { apiFetch } from '@/lib/api-client'
import UploadGuidance from './UploadGuidance'

export default function JourneyManager({ data }: { data: any }) {
  const [journeyItems, setJourneyItems] = useState(() => {
    const items = Array.isArray(data?.journey) ? data.journey : []
    return items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (data?.journey) {
      const items = Array.isArray(data.journey) ? data.journey : []
      setJourneyItems(items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)))
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
      let imageUrl = editing?.image || '/images/slide1.jpg'

      if (selectedImage) {
        const uploadFormData = new FormData()
        uploadFormData.append('image', selectedImage)
        uploadFormData.append('type', 'journey')

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
      const journeyData = {
        image: imageUrl,
        description: formData.get('description') as string,
        order: editing?.order || journeyItems.length + 1,
        isActive: formData.get('isActive') === 'true',
      }

      const response = await apiFetch('/api/admin/data', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'journey',
          id: editing?.id,
          data: journeyData
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const items = Array.isArray(result.data.journey) ? result.data.journey : []
        setJourneyItems(items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)))
        setShowForm(false)
        setEditing(null)
        setSelectedImage(null)
        setImagePreview(null)
        alert('Journey item saved successfully!')
      } else {
        alert('Failed to save journey item')
      }
    } catch (error) {
      console.error('Error saving journey item:', error)
      alert('Error saving journey item')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journey item?')) return

    try {
      const response = await apiFetch('/api/admin/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'journey', id }),
      })

      if (response.ok) {
        const result = await response.json()
        const items = Array.isArray(result.data.journey) ? result.data.journey : []
        setJourneyItems(items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)))
        alert('Journey item deleted successfully!')
      } else {
        alert('Failed to delete journey item')
      }
    } catch (error) {
      console.error('Error deleting journey item:', error)
      alert('Error deleting journey item')
    }
  }

  const handleDragStart = (e: React.DragEvent, journeyId: string) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'
    const index = journeyItems.findIndex((j: any) => j.id === journeyId)
    setDraggedIndex(index)
    // Store the dragged item ID in dataTransfer for fallback
    e.dataTransfer.setData('text/plain', journeyId)
  }

  const handleDragOver = (e: React.DragEvent, journeyId: string) => {
    // Prevent default to allow drop
    if (e.preventDefault) {
      e.preventDefault()
    }
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    
    const targetIndex = journeyItems.findIndex((j: any) => j.id === journeyId)
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const newItems = [...journeyItems]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    newItems.forEach((item, idx) => {
      item.order = idx + 1
    })

    setJourneyItems(newItems)
    setDraggedIndex(targetIndex)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    try {
      const updatePromises = journeyItems.map((item: any, idx: number) =>
        fetch('/api/admin/data', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'journey',
            id: item.id,
            data: { ...item, order: idx + 1 }
          }),
          })
      )

      const results = await Promise.all(updatePromises)
      const allOk = results.every(r => r.ok)

      if (allOk) {
        const response = await apiFetch('/api/admin/data', { credentials: 'include' })
        const result = await response.json()
        const items = Array.isArray(result.data.journey) ? result.data.journey : []
        setJourneyItems(items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)))
        alert('Journey order updated successfully!')
      } else {
        alert('Some items failed to update. Please refresh and try again.')
      }
    } catch (error) {
      console.error('Error updating journey order:', error)
      alert('Error updating journey order')
    } finally {
      setDraggedIndex(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Journey</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Journey Item
        </button>
      </div>

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
                  {editing ? 'Edit Journey Item' : 'Add Journey Item'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                    setSelectedImage(null)
                    setImagePreview(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Photo Upload
                  </label>
                  <UploadGuidance
                    dimensions="1600 × 1200 px"
                    format="JPEG, under 500 KB"
                    tip="Photos are displayed in black & white — upload color photos; the site converts automatically. Keep subject centered."
                  />
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative h-48 rounded-lg border border-gray-200 overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Journey item image preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null)
                            setImagePreview(null)
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-green-600">✓ Image selected: {selectedImage?.name}</p>
                    </div>
                  ) : (
                    /* No new file selected — show current (if any) AND always show an upload control */
                    <div className="space-y-3">
                      {editing?.image && (
                        <div>
                          <div className="relative h-48 rounded-lg border border-gray-200 overflow-hidden">
                            <Image
                              src={editing.image}
                              alt="Current journey image"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Current image — upload a new file below to replace it.
                          </p>
                        </div>
                      )}

                      <input
                        type="file"
                        id="journey-image-upload"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageSelect}
                      />
                      <label
                        htmlFor="journey-image-upload"
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors block"
                      >
                        <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                        <p className="text-sm text-gray-700 mb-1 font-medium">
                          {editing?.image ? 'Click to upload a replacement image' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500">JPG, PNG or WebP — max 5MB</p>
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    One-liner Description
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    maxLength={200}
                    defaultValue={editing?.description || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                    placeholder="Enter a one-liner description (shown below the photo)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="isActive"
                    defaultValue={editing?.isActive !== false ? 'true' : 'false'}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {selectedImage ? 'Uploading & Saving...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {editing ? 'Update Item' : 'Save Item'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditing(null)
                      setSelectedImage(null)
                      setImagePreview(null)
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-gray-400" />
          <span>Drag items to reorder (order will be saved automatically)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journeyItems.map((item: any, displayIndex: number) => {
            const isDragging = draggedIndex !== null && journeyItems[draggedIndex]?.id === item.id
            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragEnter={handleDragEnter}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-move transition-all ${
                  isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg'
                }`}
                style={{ touchAction: 'none' }}
              >
                <div className="relative h-48 bg-gray-100">
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
                    <GripVertical className="h-3 w-3" />
                    <span>Order: {item.order || displayIndex + 1}</span>
                  </div>
                  <Image
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.description || 'Journey item'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {!item.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Inactive
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Drag to reorder</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditing(item)
                          setShowForm(true)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {journeyItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>No journey items added yet. Click &quot;Add Journey Item&quot; to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

