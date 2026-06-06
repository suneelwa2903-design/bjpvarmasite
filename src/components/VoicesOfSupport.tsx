'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useEffect, useState, useMemo, useRef } from 'react'
import { usePageData } from '@/contexts/PageDataContext'

interface Voice {
  id: string
  author: string
  title: string
  content: string
  avatar?: string
  party?: string
}

const partyColor: Record<string, string> = {
  BJP: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  TDP: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Jana Sena': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'JD(S)': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

export default function VoicesOfSupport() {
  const { data } = usePageData()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const dragStartX = useRef<number | null>(null)

  const allVoices = useMemo<Voice[]>(() => {
    if (!Array.isArray((data as any)?.testimonials)) return []
    return (data as any).testimonials
      .filter((t: any) => t.isActive !== false)
      .map((t: any) => ({
        id: t.id,
        author: t.authorName || t.author,
        title: t.authorTitle || t.title,
        content: t.content,
        party: t.party,
      }))
  }, [data])

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused || allVoices.length <= 4) return
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 4) % allVoices.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, allVoices.length])

  const settings = (data as any)?.siteSettings
  if (settings && settings.voicesOfSupport === false) return null
  if (allVoices.length === 0) return null

  // Show 4 cards desktop, 2 tablet, 1 mobile
  const visibleCount = typeof window !== 'undefined'
    ? window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1
    : 4

  const visibleCards = Array.from({ length: Math.min(visibleCount, allVoices.length) }, (_, i) =>
    allVoices[(activeIndex + i) % allVoices.length]
  )

  // Swipe support
  const handlePointerDown = (e: React.PointerEvent) => { dragStartX.current = e.clientX }
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    const diff = dragStartX.current - e.clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) setActiveIndex(i => Math.min(allVoices.length - visibleCount, i + visibleCount))
      else setActiveIndex(i => Math.max(0, i - visibleCount))
    }
    dragStartX.current = null
  }

  return (
    <section
      className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Voices of Support
          </h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Leaders, allies, and constituents speak
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-[1600px] mx-auto">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 cursor-grab active:cursor-grabbing touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <AnimatePresence mode="popLayout">
              {visibleCards.map((voice, i) => (
                <motion.div
                  key={voice.id + activeIndex}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col border border-gray-100 dark:border-gray-700"
                >
                  <Quote className="h-7 w-7 text-orange-500 mb-4 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed mb-6 flex-1">
                    &ldquo;{voice.content}&rdquo;
                  </p>
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{voice.author}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{voice.title}</p>
                      </div>
                      {voice.party && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${partyColor[voice.party] || 'bg-gray-100 text-gray-600'}`}>
                          {voice.party}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Dot navigation */}
          <div className="flex justify-center gap-2 mt-10">
            {allVoices.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                suppressHydrationWarning
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'bg-orange-500 w-6' : 'bg-gray-300 dark:bg-gray-600 w-2 hover:bg-orange-300'
                }`}
                aria-label={`Go to voice ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
