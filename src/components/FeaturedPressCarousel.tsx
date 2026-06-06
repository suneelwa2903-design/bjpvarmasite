'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePageData } from '@/contexts/PageDataContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PressItem {
  id: string
  title: string
  date: string
  category: string
  source: string
  summary: string
  thumbnail?: string
  isFeatured?: boolean
}

export default function FeaturedPressCarousel() {
  const { data } = usePageData()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [modalItem, setModalItem] = useState<PressItem | null>(null)
  const dragStartX = useRef<number | null>(null)

  const featured: PressItem[] = Array.isArray((data as any)?.press)
    ? (data as any).press.filter((p: PressItem) => p.isFeatured === true).slice(0, 6)
    : []

  useEffect(() => {
    if (!modalItem) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalItem(null) }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [modalItem])

  useEffect(() => {
    if (isPaused || featured.length < 2) return
    const t = setInterval(() => {
      setActiveIndex((i) => (i + 1) % featured.length)
    }, 5000)
    return () => clearInterval(t)
  }, [isPaused, featured.length])

  if (featured.length === 0) return null

  const prev = () => setActiveIndex((i) => (i - 1 + featured.length) % featured.length)
  const next = () => setActiveIndex((i) => (i + 1) % featured.length)

  const handlePointerDown = (e: React.PointerEvent) => { dragStartX.current = e.clientX }
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    const diff = dragStartX.current - e.clientX
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev() }
    dragStartX.current = null
  }

  const item = featured[activeIndex]

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">In The News</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-2"></div>
          </div>
          <Link
            href="/press-release"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Carousel */}
        <div
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-2 cursor-pointer"
              onClick={() => setModalItem(item)}
            >
              {/* Thumbnail */}
              <div className="relative h-56 md:h-72 bg-gray-100 dark:bg-gray-800">
                {item.thumbnail ? (
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500" />
                )}
                {/* Category overlay */}
                <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold bg-orange-600 text-white rounded-full">
                  {item.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span>{item.date}</span>
                  <span>•</span>
                  <span>{item.source}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-3 group-hover:text-orange-600">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">{item.summary}</p>
                <span className="text-orange-600 font-semibold text-sm">Read More →</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows */}
          {featured.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full p-2 shadow transition"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full p-2 shadow transition"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {featured.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-orange-500 w-6' : 'bg-gray-300 dark:bg-gray-600 w-2 hover:bg-orange-300'}`}
                aria-label={`Go to item ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
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
                className="absolute top-4 right-4 z-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-full p-2 text-gray-600"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {modalItem.thumbnail && (
                <div className="relative w-full h-56 rounded-t-xl overflow-hidden bg-gray-100">
                  <Image src={modalItem.thumbnail} alt={modalItem.title} fill className="object-cover" sizes="672px" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold">{modalItem.category}</span>
                  <span>{modalItem.date}</span>
                  <span>•</span>
                  <span>{modalItem.source}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{modalItem.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{modalItem.summary}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
