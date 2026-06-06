'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiFetch } from '@/lib/api-client'

export default function TestimonialsManager({ data }: { data: any }) {
  const [testimonials, setTestimonials] = useState(() => Array.isArray(data?.testimonials) ? data.testimonials : [])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (data?.testimonials) {
      setTestimonials(Array.isArray(data.testimonials) ? data.testimonials : [])
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const testimonialData = {
        authorName: formData.get('authorName') as string,
        authorTitle: formData.get('authorTitle') as string,
        content: formData.get('content') as string,
        isActive: formData.get('isActive') === 'true',
      }

      const response = await apiFetch('/api/admin/data', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'testimonial',
          id: editing?.id,
          data: testimonialData
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setTestimonials(result.data.testimonials || [])
        setShowForm(false)
        setEditing(null)
        alert('Testimonial saved successfully!')
      } else {
        alert('Failed to save testimonial')
      }
    } catch (error) {
      console.error('Error saving testimonial:', error)
      alert('Error saving testimonial')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const response = await apiFetch('/api/admin/data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'testimonial', id }),
      })

      if (response.ok) {
        const result = await response.json()
        setTestimonials(result.data.testimonials || [])
        alert('Testimonial deleted successfully!')
      } else {
        alert('Failed to delete testimonial')
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      alert('Error deleting testimonial')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Testimonials</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Testimonial
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
                  {editing ? 'Edit Testimonial' : 'Add Testimonial'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Author Name
                  </label>
                  <input
                    type="text"
                    name="authorName"
                    required
                    maxLength={100}
                    defaultValue={editing?.authorName || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                    placeholder="Enter author name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Author Title/Position
                  </label>
                  <input
                    type="text"
                    name="authorTitle"
                    required
                    maxLength={150}
                    defaultValue={editing?.authorTitle || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                    placeholder="Enter author title or position"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Testimonial Content
                  </label>
                  <textarea
                    name="content"
                    required
                    rows={6}
                    maxLength={500}
                    defaultValue={editing?.content || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                    placeholder="Enter testimonial text"
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {editing ? 'Update Testimonial' : 'Save Testimonial'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditing(null)
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial: any) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <p className="text-gray-700 italic mb-4">&quot;{testimonial.content}&quot;</p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">{testimonial.authorName}</p>
                <p className="text-sm text-gray-600">{testimonial.authorTitle}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className={`px-2 py-1 rounded text-xs ${testimonial.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {testimonial.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(testimonial)
                    setShowForm(true)
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {testimonials.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No testimonials added yet. Click &quot;Add Testimonial&quot; to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

