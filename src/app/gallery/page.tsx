'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { GalleryItem } from '@/lib/types'
import { useLanguage } from '@/components/i18n/LanguageProvider'

const PAGE_SIZE = 12

export default function Gallery() {
  const { t } = useLanguage()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/data', { cache: 'no-store' })
        const data = await res.json()
        const list = Array.isArray(data.gallery) ? data.gallery : []
        list.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''))
        setItems(list)
      } catch {
        setItems([])
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((g) => [g.title, g.description].some((f) => (f || '').toLowerCase().includes(q)))
  }, [items, query])

  // Reset visible when query changes
  useEffect(() => { setVisible(PAGE_SIZE) }, [query])

  const pageItems = filtered.slice(0, visible)
  const hasMore = visible < filtered.length

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">{t('gallery.title')}</h1>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder={t('gallery.search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoComplete="off"
              suppressHydrationWarning={true}
            />
            <div className="md:col-span-2 flex items-center justify-end text-sm text-gray-600">
              {filtered.length} {t('gallery.results')}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pageItems.map((g) => (
            <div key={g.id} className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden group">
              <div className="relative w-full h-44 bg-gray-100">
                <Image src={g.image} alt={g.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" />
                <a
                  href={g.image}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Download image"
                  aria-label="Download image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </a>
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-1">{g.date}</div>
                <div className="text-sm font-semibold text-gray-900 line-clamp-2">{g.title}</div>
                <div className="text-xs text-gray-600 line-clamp-2 mt-1">{g.description}</div>
                <a
                  href={g.image}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow"
            >
              Load More ({filtered.length - visible} remaining)
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p>No gallery items found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
