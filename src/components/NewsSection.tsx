'use client'

import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { usePageData } from '@/contexts/PageDataContext'
import { useLanguage } from '@/components/i18n/LanguageProvider'

interface NewsItem {
  id: string
  title: string
  date: string
  excerpt: string
  image: string
  category: string
  type: 'press' | 'event'
  slug?: string
}

const NewsSection = () => {
  const { data, loading: dataLoading } = usePageData()
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 4

  const newsItems = useMemo(() => {
    if (!data?.press) return []
    const allItems: NewsItem[] = []
    if (Array.isArray(data.press)) {
      data.press.forEach((item: any) => {
        allItems.push({
          id: item.id || `press-${Date.now()}`,
          title: item.title || '',
          date: item.date || item.createdAt || '',
          excerpt: item.summary || '',
          image: item.thumbnail || '/images/slide1.jpg',
          category: item.category || 'Release',
          type: 'press',
          slug: item.slug || undefined,
        })
      })
    }
    allItems.sort((a, b) => {
      const getTime = (item: any) => {
        if (item.createdAt) return new Date(item.createdAt).getTime()
        if (item.date) return new Date(item.date).getTime()
        return 0
      }
      return getTime(b) - getTime(a)
    })
    return allItems
  }, [data?.press])

  const totalPages = Math.ceil(newsItems.length / itemsPerPage)
  const currentItems = newsItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  // Swipe support
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

  const loading = dataLoading
  const { t } = useLanguage()

  return (
    <section className="relative py-20 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.news')}</h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </motion.div>

        <div className="relative max-w-[1600px] mx-auto">
          {/* Prev / Next arrows */}
          {totalPages > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full p-3 shadow-xl transition-all z-30 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
                aria-label="Previous page"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full p-3 shadow-xl transition-all z-30 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No news items available. Check back soon!</p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-6 cursor-grab active:cursor-grabbing touch-pan-y ${
                currentItems.length <= 3 ? 'lg:grid-cols-3 max-w-5xl mx-auto' : 'lg:grid-cols-4'
              }`}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              {currentItems.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="flex flex-col border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="relative h-56 bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title || 'News article image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {item.date
                          ? new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Date not available'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 flex-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-4 line-clamp-2">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                      <Link
                        href={item.slug ? `/press-release/${item.slug}` : '/press-release'}
                        className="text-orange-600 hover:text-orange-700 font-medium text-xs"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </motion.article>
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
                    currentPage === i ? 'bg-orange-500 w-6' : 'bg-gray-300 dark:bg-gray-600 w-2 hover:bg-orange-300'
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link
            href="/press-release"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-300"
          >
            View All News
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NewsSection
