'use client'

import { motion } from 'framer-motion'
import { useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { usePageData } from '@/contexts/PageDataContext'

const JourneySection = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const { data, loading: dataLoading } = usePageData()
  const itemsPerPage = 4

  const journeyEvents = useMemo(() => {
    if (!data?.journey) return []
    const items = Array.isArray(data.journey)
      ? data.journey.filter((item: any) => item.isActive !== false)
      : []
    items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    return items
  }, [data?.journey])

  const loading = dataLoading
  const { t } = useLanguage()

  const totalPages = Math.ceil(journeyEvents.length / itemsPerPage)
  const currentItems = journeyEvents.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  // Swipe / drag support
  const dragStartX = useRef<number | null>(null)
  const handlePointerDown = (e: React.PointerEvent) => { dragStartX.current = e.clientX }
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    const diff = dragStartX.current - e.clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrentPage(p => Math.min(totalPages - 1, p + 1))
      else setCurrentPage(p => Math.max(0, p - 1))
    }
    dragStartX.current = null
  }

  return (
    <section className="relative py-20 bg-black text-white overflow-hidden">
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('home.journey')}</h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Content */}
        <div className="relative max-w-[1600px] mx-auto">
          {/* Prev/Next arrows — only show when multiple pages */}
          {totalPages > 1 && (
            <>
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-black rounded-full p-3 shadow-xl transition-all z-30 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-black rounded-full p-3 shadow-xl transition-all z-30 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : journeyEvents.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <p>Journey content coming soon.</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 cursor-grab active:cursor-grabbing touch-pan-y"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              {currentItems.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="flex flex-col group"
                >
                  {/* Photo */}
                  <div className="relative h-64 bg-gray-800 overflow-hidden rounded-sm">
                    <Image
                      src={event.image}
                      alt={event.title || event.description || 'Journey event'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover grayscale brightness-90 contrast-110 group-hover:grayscale-0 transition-all duration-500"
                      loading="lazy"
                    />
                    {/* Subtle overlay fades on hover */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-500" />
                  </div>
                  {/* Caption */}
                  <div className="mt-4 text-center px-2">
                    <p className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
                      {event.descriptionTe || event.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Page dots */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentPage === i ? 'bg-orange-500 w-6' : 'bg-white/30 w-2 hover:bg-white/50'
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default JourneySection
