'use client'

import { useState, useEffect } from 'react'
import { Save, Upload, X } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { apiFetch } from '@/lib/api-client'
import UploadGuidance from './UploadGuidance'

export default function BiographyManager({ data }: { data: any }) {
  const [biography, setBiography] = useState(() => data?.biography || { image: '', content: '' })
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (data?.biography) {
      setBiography(data.biography)
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
      let imageUrl = biography.image || '/images/slide1.jpg'

      if (selectedImage) {
        const uploadFormData = new FormData()
        uploadFormData.append('image', selectedImage)
        uploadFormData.append('type', 'biography')

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
      const biographyData = {
        image: imageUrl,
        content: formData.get('content') as string,
      }

      const response = await apiFetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'biography',
          data: biographyData
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setBiography(result.data.biography || {})
        setShowForm(false)
        setSelectedImage(null)
        setImagePreview(null)
        alert('Biography updated successfully!')
      } else {
        alert('Failed to update biography')
      }
    } catch (error) {
      console.error('Error saving biography:', error)
      alert('Error saving biography')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Biography</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Save className="h-5 w-5" />
          {biography?.content ? 'Edit Biography' : 'Add Biography'}
        </button>
      </div>

      {biography?.content && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={biography.image || '/images/slide1.jpg'}
                alt="Biography"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{biography.content}</p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Biography</h3>
                <button
                  onClick={() => {
                    setShowForm(false)
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
                    Biography Image
                  </label>
                  <UploadGuidance
                    dimensions="1200 × 1200 px (square)"
                    format="JPEG, under 500 KB"
                    tip="Center the subject — corners may be slightly cropped. Head-and-shoulders portrait works best."
                  />
                  {imagePreview ? (
                    /* User has selected a new file — show preview + remove */
                    <div className="space-y-4">
                      <div className="relative h-64 rounded-lg border border-gray-200 overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null)
                            setImagePreview(null)
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          aria-label="Remove selected image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-green-600">✓ New image selected: {selectedImage?.name}</p>
                    </div>
                  ) : (
                    /* No new file selected — show current (if any) AND always show an upload control */
                    <div className="space-y-3">
                      {biography?.image && (
                        <div>
                          <div className="relative h-64 rounded-lg border border-gray-200 overflow-hidden">
                            <Image
                              src={biography.image}
                              alt="Current biography image"
                              fill
                              sizes="100vw"
                              className="object-cover"
                              loading="lazy"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Current image — upload a new file below to replace it.
                          </p>
                        </div>
                      )}

                      <input
                        type="file"
                        id="biography-image-upload"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageSelect}
                      />
                      <label
                        htmlFor="biography-image-upload"
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors block"
                      >
                        <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                        <p className="text-sm text-gray-700 mb-1 font-medium">
                          {biography?.image ? 'Click to upload a replacement image' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500">JPG, PNG or WebP — max 5MB</p>
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Biography Content
                  </label>
                  <textarea
                    name="content"
                    required
                    rows={12}
                    defaultValue={biography?.content || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                    placeholder="Enter biography content (supports line breaks)"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    You can use multiple paragraphs. Line breaks will be preserved.
                  </p>
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
                        Save Biography
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
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

      {!biography?.content && !showForm && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          <p className="mb-4">No biography content has been added yet.</p>
          <p className="text-sm">Click &quot;Add Biography&quot; to get started.</p>
        </div>
      )}
    </div>
  )
}

