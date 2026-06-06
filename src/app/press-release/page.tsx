'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { PressItem } from '@/lib/types'

const PAGE_SIZE = 9

export default function PressRelease() {
  const { t } = useLanguage()
  const [press, setPress] = useState<PressItem[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'All' | 'Release' | 'Statement' | 'Article'>('All')
  const [year, setYear] = useState<'All' | string>('All')
  const [month, setMonth] = useState<'All' | string>('All')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [modalItem, setModalItem] = useState<PressItem | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/data', { cache: 'no-store' })
        const data = await res.json()
        const list = Array.isArray(data.press) ? data.press : []
        list.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''))
        setPress(list)
      } catch {
        setPress([])
      }
    }
    load()
  }, [])

  // Modal keyboard + scroll lock
  useEffect(() => {
    if (!modalItem) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalItem(null) }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [modalItem])

  const years = useMemo(() => {
    const ys = new Set<string>()
    for (const p of press) {
      if (p.date) ys.add((p.date as string).slice(0, 4))
    }
    return Array.from(ys).sort((a, b) => b.localeCompare(a))
  }, [press])

  const months = useMemo(() => {
    if (year === 'All') return []
    const ms = new Set<string>()
    for (const p of press) {
      if (p.date && (p.date as string).startsWith(year)) {
        ms.add((p.date as string).slice(5, 7))
      }
    }
    return Array.from(ms).sort()
  }, [press, year])

  const MONTH_NAMES: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
    '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
  }

  const filtered = useMemo(() => {
    let items = press
    if (category !== 'All') items = items.filter((p) => p.category === category)
    if (year !== 'All') items = items.filter((p) => (p.date || '').startsWith(year as string))
    if (month !== 'All') items = items.filter((p) => (p.date || '').slice(5, 7) === month)
    if (query.trim()) {
      const q = query.toLowerCase()
      items = items.filter((p) =>
        [p.title, p.summary, p.source].some((f) => (f || '').toLowerCase().includes(q))
      )
    }
    return items
  }, [press, category, year, month, query])

  // Reset month when year changes
  useEffect(() => { setMonth('All') }, [year])
  // Reset visible count when filters change
  useEffect(() => { setVisible(PAGE_SIZE) }, [category, year, month, query])

  const pageItems = filtered.slice(0, visible)
  const hasMore = visible < filtered.length

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">{t('press.title')}</h1>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              placeholder={t('press.search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoComplete="off"
              suppressHydrationWarning={true}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="All">{t('press.filter.all')}</option>
              <option value="Release">{t('press.filter.release')}</option>
              <option value="Statement">{t('press.filter.statement')}</option>
              <option value="Article">{t('press.filter.article')}</option>
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="All">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={year === 'All'}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="All">All Months</option>
              {months.map((m) => (
                <option key={m} value={m}>{MONTH_NAMES[m] || m}</option>
              ))}
            </select>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">{filtered.length} results</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {pageItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-5 flex flex-col cursor-pointer group"
                onClick={() => setModalItem(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setModalItem(item) }}
                aria-label={`Read: ${item.title}`}
              >
                {item.thumbnail && (
                  <div className="relative w-full h-40 rounded mb-3 overflow-hidden">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold">{item.category}</span>
                  <span>{item.date}</span>
                  <span>•</span>
                  <span>{item.source}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.summary}</p>
                <div className="mt-auto">
                  <span className="text-orange-600 font-semibold text-sm">Read More →</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
            <p>No press releases found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Press Item Modal */}
      <AnimatePresence>
        {modalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setModalItem(null) }}
            role="dialog"
            aria-modal="true"
            aria-label={modalItem.title}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl relative"
            >
              <button
                onClick={() => setModalItem(null)}
                className="absolute top-4 right-4 z-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2 text-gray-600 dark:text-gray-300"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {modalItem.thumbnail && (
                <div className="relative w-full h-56 rounded-t-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image src={modalItem.thumbnail} alt={modalItem.title} fill className="object-cover" sizes="672px" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold">{modalItem.category}</span>
                  <span>{modalItem.date}</span>
                  <span>•</span>
                  <span className="font-medium">{modalItem.source}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{modalItem.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{modalItem.summary}</p>
                {(modalItem as any).link && (
                  <a
                    href={(modalItem as any).link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-orange-600 hover:underline font-semibold"
                  >
                    Read full article →
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
