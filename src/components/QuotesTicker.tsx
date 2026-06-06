'use client'

import { useState, useEffect } from 'react'
import { usePageData } from '@/contexts/PageDataContext'

interface Quote {
  id: string
  en: string
  te?: string
  isActive: boolean
}

export default function QuotesTicker() {
  const { data } = usePageData()
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const quotes: Quote[] = (data?.quotes as Quote[] | undefined)?.filter((q) => q.isActive !== false) ?? []
  const settings = (data as any)?.siteSettings

  useEffect(() => {
    if (quotes.length < 2) return
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % quotes.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(t)
  }, [quotes.length])

  // Hidden when siteSettings.quotesTicker is explicitly false
  if (settings && settings.quotesTicker === false) return null
  if (quotes.length === 0) return null

  const q = quotes[index] || quotes[0]

  return (
    <div className="bg-orange-600 text-white py-1.5 px-4 overflow-hidden">
      <div
        className="flex items-center justify-center gap-6 transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <span className="text-[0.72rem] font-normal text-right flex-1 hidden sm:block" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {q.en}
        </span>
        {q.te && <span className="text-white/40 hidden sm:block">|</span>}
        {q.te && (
          <span className="text-[0.72rem] font-normal text-left flex-1 hidden sm:block" style={{ fontFamily: "'Noto Sans Telugu', 'Inter', sans-serif" }}>
            {q.te}
          </span>
        )}
        {/* Mobile: show only English */}
        <span className="text-[0.72rem] font-normal text-center sm:hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {q.en}
        </span>
      </div>
    </div>
  )
}
