'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useMemo } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { usePageData } from '@/contexts/PageDataContext'

interface Testimonial {
  id: string
  authorName: string
  authorTitle: string
  content: string
}

const TestimonialsSection = () => {
  // Hooks must be called at the top level, before any conditional returns
  const { t } = useLanguage()
  const { data, loading: dataLoading } = usePageData()
  
  // Get testimonials from shared data
  const testimonials = useMemo(() => {
    if (!data?.testimonials) return []
    return Array.isArray(data.testimonials)
      ? data.testimonials.filter((t: any) => t.isActive !== false)
      : []
  }, [data?.testimonials])
  
  const loading = dataLoading

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null // Don't show section if no testimonials
  }
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{t('home.testimonials')}</h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
          <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">{t('home.testimonials.sub')}</p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <Quote className="h-8 w-8 text-orange-500 mb-4" />
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">{testimonial.authorName}</p>
                <p className="text-sm text-gray-600">{testimonial.authorTitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection

