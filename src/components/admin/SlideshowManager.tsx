'use client'

import { useState, useRef } from 'react'
import { Plus, Edit, Trash2, Upload, Eye, Save, X, GripVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { apiFetch } from '@/lib/api-client'
import UploadGuidance from './UploadGuidance'

export default function SlideshowManager({ data }: { data: any }) {
  const [slides, setSlides] = useState(() => {
    if (data?.slideshow && data.slideshow.length > 0) {
      return data.slideshow
    }
    return [
      { id: 'slide-1', title: 'Dedication to Service', image: '/images/slide1.jpg', caption: 'DEDICATED SERVANT OF THE PEOPLE', order: 1, isActive: true },
      { id: 'slide-2', title: 'Community Leadership', image: '/images/slide2.jpg', caption: 'COMMUNITY LEADERSHIP', order: 2, isActive: true },
      { id: 'slide-3', title: 'Public Service Commitment', image: '/images/slide3.jpg', caption: 'PUBLIC SERVICE COMMITMENT', order: 3, isActive: true },
      { id: 'slide-4', title: 'Vision for Development', image: '/images/slide4.jpg', caption: 'VISION FOR DEVELOPMENT', order: 4, isActive: true },
      { id: 'slide-5', title: 'Building Tomorrow', image: '/images/slide5.jpg', caption: 'BUILDING TOMORROW', order: 5, isActive: true }
    ]
  })
  
  const [showForm, setShowForm] = useState(false)
  const [editingSlide, setEditingSlide] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      let imageUrl = editingSlide?.image || '/images/slide1.jpg'

      // Upload image if one is selected
      if (selectedImage) {
        const uploadFormData = new FormData()
        uploadFormData.append('image', selectedImage)
        uploadFormData.append('type', 'slideshow')

        const uploadResponse = await apiFetch('/api/admin/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          imageUrl = uploadResult.url
        } else {
          const error = await uploadResponse.json()
          alert(`Image upload failed: ${error.error}`)
          setIsUploading(false)
          return
        }
      }

      // Save slide data
      const formData = new FormData(e.target as HTMLFormElement)
      const slideData = {
        title: formData.get('title') as string,
        caption: formData.get('caption') as string,
        order: parseInt(formData.get('order') as string),
        isActive: formData.get('status') === 'true',
        image: imageUrl
      }

      const response = await apiFetch('/api/admin/data', {
        method: editingSlide ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'slideshow',
          id: editingSlide?.id,
          data: slideData
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSlides(result.data.slideshow)
        setShowForm(false)
        setSelectedImage(null)
        setImagePreview(null)
        setEditingSlide(null)
        alert('Slide saved successfully!')
      } else {
        alert('Failed to save slide. Please try again.')
      }
    } catch (error) {
      console.error('Error saving slide:', error)
      alert('Error saving slide. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleEdit = (slide: any) => {
    setEditingSlide(slide)
    setShowForm(true)
  }

  const handleDelete = async (slideId: string) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      try {
        const response = await apiFetch('/api/admin/data', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'slideshow',
            id: slideId
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setSlides(result.data.slideshow)
          alert('Slide deleted successfully!')
        } else {
          alert('Failed to delete slide. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting slide:', error)
        alert('Error deleting slide. Please try again.')
      }
    }
  }

  // Drag and drop handlers
  const handleDragStart = (slideId: string) => {
    const index = slides.findIndex((s: any) => s.id === slideId)
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, slideId: string) => {
    e.preventDefault()
    const targetIndex = slides.findIndex((s: any) => s.id === slideId)
    if (draggedIndex === null || draggedIndex === targetIndex) return
    
    const newSlides = [...slides]
    const draggedItem = newSlides[draggedIndex]
    newSlides.splice(draggedIndex, 1)
    newSlides.splice(targetIndex, 0, draggedItem)
    
    // Update order values based on new positions
    newSlides.forEach((slide, idx) => {
      slide.order = idx + 1
    })
    
    setSlides(newSlides)
    setDraggedIndex(targetIndex)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return
    
    try {
      // Save all slides with updated order
      const updatePromises = slides.map((slide: any, idx: number) =>
        apiFetch('/api/admin/data', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'slideshow',
            id: slide.id,
            data: {
              ...slide,
              order: idx + 1
            }
          }),
        })
      )

      const results = await Promise.all(updatePromises)
      const allOk = results.every(r => r.ok)

      if (allOk) {
        // Refresh data to get updated slides
        const response = await apiFetch('/api/admin/data')
        const data = await response.json()
        if (data.slideshow) {
          setSlides(data.slideshow)
        }
        alert('Slide order updated successfully!')
      } else {
        alert('Some slides failed to update. Please refresh and try again.')
      }
    } catch (error) {
      console.error('Error updating slide order:', error)
      alert('Error updating slide order. Please try again.')
    } finally {
      setDraggedIndex(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Slideshow</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Eye className="h-5 w-5" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Slide
          </button>
        </div>
      </div>

      {/* Website Preview */}
      {showPreview && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Website Preview</h3>
          <PreviewCarousel slides={slides.filter((s: any) => s.isActive)} />
        </div>
      )}

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
                  {editingSlide ? 'Edit Slide' : 'Add New Slide'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingSlide(null)
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
                    Title <span className="text-xs text-gray-500 font-normal">(Optional - for admin reference only)</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    maxLength={100}
                    defaultValue={editingSlide?.title || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                    placeholder="Optional: Enter slide title (for admin reference only, not displayed on website)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image Upload
                  </label>

                  <UploadGuidance
                    dimensions="1920 × 1080 px"
                    format="JPEG, under 500 KB"
                    tip="Keep main subject in the center — edges may be cropped on smaller screens."
                  />

                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative h-48 rounded-lg border border-gray-200 overflow-hidden">
                        <Image 
                          src={imagePreview} 
                          alt="Preview" 
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
                    <div className="relative">
                      <input 
                        type="file" 
                        id="image-upload"
                        className="hidden" 
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageSelect}
                      />
                      <label 
                        htmlFor="image-upload"
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors block"
                      >
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">Recommended: 1920x1080 (max 5MB)</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP supported</p>
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Caption <span className="text-xs text-gray-500 font-normal">(Optional - leave blank to use edited image)</span>
                  </label>
                  <textarea
                    name="caption"
                    maxLength={200}
                    rows={3}
                    defaultValue={editingSlide?.caption || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                    placeholder="Optional: Enter caption text (if not provided, no caption will be displayed)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      required
                      defaultValue={editingSlide?.order || slides.length + 1}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select 
                      name="status" 
                      defaultValue={editingSlide?.isActive ? 'true' : 'false'}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {selectedImage ? 'Uploading & Saving...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {editingSlide ? 'Update Slide' : 'Save Slide'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingSlide(null)
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

      {/* Slides List with Drag and Drop */}
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-gray-400" />
          <span>Drag slides to reorder (order will be saved automatically)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((slide: any, displayIndex: number) => {
              const isDragging = draggedIndex !== null && slides[draggedIndex]?.id === slide.id
              return (
                <div
                  key={slide.id || displayIndex}
                  draggable
                  onDragStart={() => handleDragStart(slide.id)}
                  onDragOver={(e) => handleDragOver(e, slide.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-move transition-all ${
                    isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="relative h-48 bg-gray-100">
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
                      <GripVertical className="h-3 w-3" />
                      <span>Order: {slide.order || displayIndex + 1}</span>
                    </div>
                    <Image src={slide.image || '/images/placeholder.jpg'} alt={slide.title || slide.caption || `Slide ${displayIndex + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    {!slide.isActive && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
                        Inactive
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {slide.title ? slide.title : <span className="text-gray-400 italic">No title</span>}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {slide.caption ? slide.caption : <span className="text-gray-400 italic">No caption</span>}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Drag to reorder</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(slide)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(slide.id)
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

        {slides.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No slides added yet. Click "Add New Slide" to get started.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

function PreviewCarousel({ slides }: { slides: Array<{ id?: string; image: string; caption: string }> }) {
  const [current, setCurrent] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const scrollToIndex = (idx: number) => {
    const safeIndex = ((idx % slides.length) + slides.length) % slides.length
    setCurrent(safeIndex)
    const el = containerRef.current
    if (el) {
      el.scrollTo({ left: safeIndex * el.clientWidth, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-[420px] md:h-[520px] bg-black rounded-lg overflow-hidden snap-x snap-mandatory flex overflow-x-auto no-scrollbar"
      >
        {slides.map((slide, idx) => (
          <div key={slide.id || idx} className="min-w-full h-full relative snap-start">
            <Image src={slide.image} alt={slide.caption || slide.id || 'Slide'} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
            {/* Only show caption if it exists and has content */}
            {slide.caption && slide.caption.trim() !== '' && (
              <div className="absolute inset-0 flex items-start justify-end pt-8 pr-8">
                <div className="text-right">
                  <div className="text-orange-500 text-4xl leading-none font-extrabold">"</div>
                  <h2 className="text-orange-500 text-xl md:text-2xl font-extrabold leading-tight">
                    {slide.caption?.toUpperCase?.() || ''}
                  </h2>
                  <div className="text-orange-500 text-4xl leading-none font-extrabold">"</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => scrollToIndex(current - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            onClick={() => scrollToIndex(current + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow"
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-2 w-2 rounded-full ${i === current ? 'bg-orange-500' : 'bg-white/70'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}