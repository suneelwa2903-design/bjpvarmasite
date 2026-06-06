'use client'

import Image from 'next/image'
import { useEffect, useState, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TOP_SLIDES, type TopSlide } from '../lib/slides'

export default function TopSlideshow() {
  const [index, setIndex] = useState(0)
  const [slides, setSlides] = useState<TopSlide[]>(() => [...TOP_SLIDES])
  const [loading, setLoading] = useState(false)
  const slideshowRef = useRef<HTMLDivElement>(null)

  // Minimum distance for swipe detection
  const minSwipeDistance = 50
  const touchStartRef = useRef<number | null>(null)
  const touchEndRef = useRef<number | null>(null)

  // Navigation functions
  const goToNext = useCallback(() => {
    setIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }, [slides.length])

  const goToPrevious = useCallback(() => {
    setIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Throttle ref for wheel events to prevent rapid navigation
  const wheelThrottleRef = useRef<number | null>(null)

  // Use localStorage cache for slideshow (works independently, doesn't need context)
  useEffect(() => {
    // Try localStorage cache first for immediate display
    try {
      const cached = localStorage.getItem('slideshowCache')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.expires > Date.now() && parsed.slides?.length > 0) {
          setSlides(parsed.slides)
          setLoading(false)
          // Fetch in background to update cache (only one fetch for slideshow)
          fetch('/api/admin/data').then(r => r.json()).then(data => {
            if (data.slideshow && data.slideshow.length > 0) {
              const adminSlides = data.slideshow
                .filter((slide: any) => slide.isActive)
                .sort((a: any, b: any) => a.order - b.order)
                .map((slide: any) => ({
                  src: slide.image || slide.src,
                  caption: slide.caption || ''
                }))
              if (adminSlides.length > 0) {
                setSlides(adminSlides)
                localStorage.setItem('slideshowCache', JSON.stringify({
                  slides: adminSlides,
                  expires: Date.now() + (30 * 60 * 1000)
                }))
              }
            }
          }).catch(() => {})
          return
        }
      }
    } catch (e) {
      // Ignore cache errors
    }
    
    // If no cache, fetch once
    fetch('/api/admin/data').then(r => r.json()).then(data => {
      if (data.slideshow && data.slideshow.length > 0) {
        const adminSlides = data.slideshow
          .filter((slide: any) => slide.isActive)
          .sort((a: any, b: any) => a.order - b.order)
          .map((slide: any) => ({
            src: slide.image || slide.src,
            caption: slide.caption || ''
          }))
        if (adminSlides.length > 0) {
          setSlides(adminSlides)
          try {
            localStorage.setItem('slideshowCache', JSON.stringify({
              slides: adminSlides,
              expires: Date.now() + (30 * 60 * 1000)
            }))
          } catch (e) {}
        }
      }
    }).catch(() => {
      // Fall back to static slides on error
      setSlides([...TOP_SLIDES])
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  // Auto-rotate slides
  useEffect(() => {
    if (slides.length > 0) {
      const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
      return () => clearInterval(id)
    }
  }, [slides.length])

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  // Set up wheel event listener with non-passive option to allow preventDefault
  useEffect(() => {
    const ref = slideshowRef.current
    if (!ref || slides.length === 0) return

    const handleWheelNative = (e: WheelEvent) => {
      // Throttle: ignore if called within last 500ms
      const now = Date.now()
      if (wheelThrottleRef.current && now - wheelThrottleRef.current < 500) {
        return
      }
      wheelThrottleRef.current = now

      // Prevent default scrolling behavior
      e.preventDefault()
      
      // Navigate based on scroll direction
      if (e.deltaY > 0) {
        // Scroll down = next slide
        goToNext()
      } else if (e.deltaY < 0) {
        // Scroll up = previous slide
        goToPrevious()
      }
    }

    // Add non-passive wheel listener to allow preventDefault
    ref.addEventListener('wheel', handleWheelNative, { passive: false })

    return () => {
      ref.removeEventListener('wheel', handleWheelNative)
    }
  }, [slides.length, goToNext, goToPrevious])

  // Set up touch event listeners with non-passive option to allow preventDefault
  useEffect(() => {
    const ref = slideshowRef.current
    if (!ref) return

    const handleTouchStartPassive = (e: TouchEvent) => {
      touchEndRef.current = null
      touchStartRef.current = e.touches[0].clientX
    }

    const handleTouchMovePassive = (e: TouchEvent) => {
      touchEndRef.current = e.touches[0].clientX
    }

    const handleTouchEndPassive = (e: TouchEvent) => {
      if (touchStartRef.current === null || touchEndRef.current === null) return
      
      const distance = touchStartRef.current - touchEndRef.current
      const isLeftSwipe = distance > minSwipeDistance
      const isRightSwipe = distance < -minSwipeDistance

      if (isLeftSwipe && slides.length > 0) {
        e.preventDefault()
        setIndex((prevIndex) => (prevIndex + 1) % slides.length)
      }
      if (isRightSwipe && slides.length > 0) {
        e.preventDefault()
        setIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length)
      }
      
      touchStartRef.current = null
      touchEndRef.current = null
    }

    // Add non-passive listeners - touchend needs to be non-passive to allow preventDefault
    ref.addEventListener('touchstart', handleTouchStartPassive, { passive: true })
    ref.addEventListener('touchmove', handleTouchMovePassive, { passive: true })
    ref.addEventListener('touchend', handleTouchEndPassive, { passive: false })

    return () => {
      ref.removeEventListener('touchstart', handleTouchStartPassive)
      ref.removeEventListener('touchmove', handleTouchMovePassive)
      ref.removeEventListener('touchend', handleTouchEndPassive)
    }
  }, [slides.length, minSwipeDistance])

  return (
    <section 
      ref={slideshowRef}
      className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-black z-0"
      style={{ touchAction: 'pan-y' }}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <>
          {/* Slides - Only render current + next slide for performance */}
          {/* Current slide */}
          {slides[index] && (
            <div className="absolute inset-0 opacity-100 transition-opacity duration-700">
              <Image
                src={slides[index].src}
                alt={slides[index].caption || `Slideshow image ${index + 1}`}
                fill
                sizes="100vw"
                priority={index === 0}
                quality={index === 0 ? 90 : 75}
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              {/* subtle vignette for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
            </div>
          )}
          {/* Next slide - preload for smooth transition */}
          {slides.length > 1 && (
            <div className="absolute inset-0 opacity-0 pointer-events-none">
              <Image
                src={slides[(index + 1) % slides.length].src}
                alt={slides[(index + 1) % slides.length].caption || `Slideshow image ${(index + 1) % slides.length + 1}`}
                fill
                sizes="100vw"
                priority={false}
                quality={75}
                className="object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
            </div>
          )}

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all opacity-70 hover:opacity-100 z-20 pointer-events-auto"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all opacity-70 hover:opacity-100 z-20 pointer-events-auto"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}

          {/* Dots navigation - consistent for all slides */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-center pb-8">
              <div className="flex items-center gap-2">
                {slides.map((_: TopSlide, i: number) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 cursor-pointer pointer-events-auto ${
                      i === index
                        ? 'bg-brand-orange border-brand-orange w-6 h-2.5'
                        : 'bg-white/70 border-white/70 hover:bg-white/90 hover:border-white/90'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
