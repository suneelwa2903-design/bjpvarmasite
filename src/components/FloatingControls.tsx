'use client'

import { useEffect, useRef, useState } from 'react'
import { Moon, SunMedium, Type } from 'lucide-react'

export default function FloatingControls() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [isDark, setIsDark] = useState(false)
  const [isLargeFont, setIsLargeFont] = useState(false)
  const [lang, setLang] = useState<'en' | 'te'>('en')
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 16, y: 120 })
  const dragging = useRef(false)
  const start = useRef<{ mx: number; my: number; x: number; y: number } | null>(null)
  const posRef = useRef<{ x: number; y: number }>({ x: 16, y: 120 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const t = localStorage.getItem('theme')
      const f = localStorage.getItem('font-scale')
      const l = (localStorage.getItem('lang') as 'en' | 'te') || 'en'
      const p = localStorage.getItem('fc-pos')
      const isDarkMode = t === 'dark'
      const isLarge = f === 'large'
      setIsDark(isDarkMode)
      setIsLargeFont(isLarge)
      setLang(l)
      if (p) {
        const { x, y } = JSON.parse(p)
        setPos({ x, y })
        posRef.current = { x, y }
      }
      // Apply initial theme and font settings
      const root = document.documentElement
      if (isDarkMode) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      if (isLarge) {
        root.setAttribute('data-font', 'large')
      } else {
        root.removeAttribute('data-font')
      }
    } catch {}
  }, [])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current || !start.current) return
      e.preventDefault()
      const dx = e.clientX - start.current.mx
      const dy = e.clientY - start.current.my
      const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 60) - 8
      const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 200) - 8
      const nx = Math.max(8, Math.min(maxX, start.current.x + dx))
      const ny = Math.max(8, Math.min(maxY, start.current.y + dy))
      posRef.current = { x: nx, y: ny }
      setPos({ x: nx, y: ny })
    }
    const up = () => {
      if (dragging.current) {
        dragging.current = false
        try { 
          localStorage.setItem('fc-pos', JSON.stringify(posRef.current)) 
        } catch {}
        start.current = null
      }
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('pointercancel', up, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [])

  if (!mounted) return null

  const beginDrag = (e: React.PointerEvent) => {
    // Don't start drag if clicking on a button
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    e.preventDefault()
    dragging.current = true
    start.current = { mx: e.clientX, my: e.clientY, x: posRef.current.x, y: posRef.current.y }
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId)
    }
  }

  const toggleDark = () => {
    const root = document.documentElement
    const next = !isDark
    setIsDark(next)
    if (next) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleFont = () => {
    const root = document.documentElement
    const next = !isLargeFont
    setIsLargeFont(next)
    if (next) {
      root.setAttribute('data-font', 'large')
      localStorage.setItem('font-scale', 'large')
    } else {
      root.removeAttribute('data-font')
      localStorage.setItem('font-scale', 'normal')
    }
  }

  const toggleLang = () => {
    const next = lang === 'en' ? 'te' : 'en'
    setLang(next)
    localStorage.setItem('lang', next)
    try { window.dispatchEvent(new CustomEvent('lang:change')) } catch {}
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-[150] transition-none"
      style={{ left: pos.x, top: pos.y, willChange: dragging.current ? 'transform' : 'auto' }}
      role="group"
      aria-label="Floating controls"
      suppressHydrationWarning
    >
      <div className="flex flex-col gap-2 p-1.5 rounded-2xl shadow-xl ring-1 ring-orange-500/60 dark:ring-orange-400/40 bg-gray-900/95 dark:bg-gray-800/95 text-white backdrop-blur-md select-none">
        {/* Drag handle */}
        <div onPointerDown={beginDrag} className="h-2 cursor-move rounded bg-white/20 hover:bg-white/30 transition-colors" title="Drag" />
        <div className="cursor-default">
          <button
            onPointerDown={(e) => { e.stopPropagation() }}
            onClick={(e) => { e.stopPropagation(); toggleLang() }}
            className="w-7 h-7 rounded-full bg-orange-600 hover:bg-orange-500 flex items-center justify-center text-[10px] font-bold transition-colors"
            title="Toggle language"
            aria-label="Toggle language"
          >
            {lang.toUpperCase()}
          </button>
          <button
            onPointerDown={(e) => { e.stopPropagation() }}
            onClick={(e) => { e.stopPropagation(); toggleFont() }}
            className="w-7 h-7 mt-2 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center transition-colors"
            title="Toggle font size"
            aria-label="Toggle font size"
          >
            <Type className="h-3.5 w-3.5 text-white" />
          </button>
          <button
            onPointerDown={(e) => { e.stopPropagation() }}
            onClick={(e) => { e.stopPropagation(); toggleDark() }}
            className="w-7 h-7 mt-2 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center transition-colors"
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            {isDark ? <SunMedium className="h-3.5 w-3.5 text-white" /> : <Moon className="h-3.5 w-3.5 text-white" />}
          </button>
        </div>
      </div>
    </div>
  )
}



