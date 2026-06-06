'use client'

import { useSearchParams } from 'next/navigation'
import { Calendar, ChevronLeft, ChevronRight, ExternalLink, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/components/i18n/LanguageProvider'

function InitiativesContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const typeParam = searchParams?.get('type') || null

  const [selectedType, setSelectedType] = useState<'all' | 'constituency' | 'ministry'>(
    typeParam === 'constituency' || typeParam === 'ministry' ? typeParam : 'all'
  )

  const [impactItems, setImpactItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeImages, setActiveImages] = useState<string[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTitle, setActiveTitle] = useState('')
  const [modalItem, setModalItem] = useState<any | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/data')
        const db = await res.json()
        setImpactItems(db.initiatives || [])
      } catch (e) {
        console.error('Failed to fetch impact items', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Lightbox keyboard + scroll lock
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      else if (e.key === 'ArrowLeft') setActiveImageIndex((i) => (i - 1 + activeImages.length) % activeImages.length)
      else if (e.key === 'ArrowRight') setActiveImageIndex((i) => (i + 1) % activeImages.length)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [lightboxOpen, activeImages.length])

  // Modal keyboard + scroll lock
  useEffect(() => {
    if (!modalItem) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalItem(null) }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [modalItem])

  const filteredImpact = selectedType === 'all'
    ? impactItems
    : impactItems.filter(i => i.type === selectedType)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16 dark:from-orange-700 dark:to-orange-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{t('impact.title')}</h1>
          <div className="w-28 h-1.5 bg-white mx-auto rounded-full mb-2"></div>
          <p className="text-xl text-orange-100 max-w-3xl mx-auto">{t('impact.subtitle')}</p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 justify-center flex-wrap">
            {([['all', t('impact.filter.all')], ['constituency', t('impact.filter.constituency')], ['ministry', t('impact.filter.ministry')]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSelectedType(val)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${selectedType === val ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImpact.map((initiative, index) => {
              const firstImage = initiative.images?.[0]
                || initiative.newsArticles?.[0]?.image
                || null

              return (
                <motion.div
                  key={initiative.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden border border-gray-100 dark:border-gray-800 cursor-pointer"
                  onClick={() => setModalItem(initiative)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setModalItem(initiative) }}
                  aria-label={`View details for ${initiative.title}`}
                >
                  <div className="p-5">
                    {/* Type Badge, Date, and Funding */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${initiative.type === 'ministry' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {initiative.type === 'ministry' ? 'Ministry' : 'Constituency'}
                        </span>
                        {initiative.fundingAmount && (
                          <span className="text-xs font-bold px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full">
                            {initiative.fundingAmount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{initiative.date}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {initiative.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {initiative.summary || initiative.description}
                    </p>

                    {/* Thumbnail */}
                    {firstImage && (
                      <div className="w-full mb-3">
                        <div className="relative h-40 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                          <Image src={firstImage} alt={initiative.title || 'Initiative image'} fill className="object-cover" />
                          {initiative.images?.length > 1 && (
                            <div className="absolute bottom-1 right-2 bg-black/50 text-white text-[0.65rem] px-1.5 py-0.5 rounded">
                              {initiative.images.length} photos
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    <div className="space-y-1">
                      {initiative.achievements?.slice(0, 2).map((achievement: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0"></div>
                          <span className="line-clamp-1">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {filteredImpact.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p>No impact items found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Initiative Modal */}
      {modalItem && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalItem(null) }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl relative">
            <button
              onClick={() => setModalItem(null)}
              className="absolute top-4 right-4 z-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2 text-gray-600 dark:text-gray-300"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {(modalItem.images?.[0] || modalItem.newsArticles?.[0]?.image) && (
              <div className="relative w-full h-56 rounded-t-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image src={modalItem.images?.[0] || modalItem.newsArticles[0].image} alt={modalItem.title} fill className="object-cover" />
              </div>
            )}

            <div className="p-6">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${modalItem.type === 'ministry' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {modalItem.type === 'ministry' ? 'Ministry' : 'Constituency'}
                </span>
                {modalItem.fundingAmount && (
                  <span className="text-xs font-bold px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                    {modalItem.fundingAmount}
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">{modalItem.date}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{modalItem.title}</h2>

              {(modalItem.summary || modalItem.description) && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
                  {modalItem.summary || modalItem.description}
                </p>
              )}

              {/* Official Letter Download */}
              {modalItem.officialLetterUrl && (
                <a
                  href={modalItem.officialLetterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mb-5 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-semibold hover:bg-orange-100 transition-colors"
                >
                  <Download className="h-4 w-4" /> View Official Order / Letter
                </a>
              )}

              {/* Achievements */}
              {modalItem.achievements?.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-2">Key Achievements</h3>
                  <ul className="space-y-1.5">
                    {modalItem.achievements.map((a: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Image gallery strip */}
              {modalItem.images?.length > 1 && (
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-2">Photos</h3>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {modalItem.images.map((img: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveImages(modalItem.images)
                          setActiveImageIndex(i)
                          setActiveTitle(modalItem.title)
                          setLightboxOpen(true)
                        }}
                        className="flex-shrink-0 relative w-24 h-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 hover:ring-2 ring-orange-500"
                      >
                        <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* News articles */}
              {modalItem.newsArticles?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-2">In The News</h3>
                  <div className="space-y-3">
                    {modalItem.newsArticles.map((article: any, i: number) => (
                      <div key={i} className="flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        {article.image && (
                          <div className="relative w-16 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                            <Image src={article.image} alt={article.title || ''} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{article.title}</p>
                          {article.source && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{article.source}</p>}
                          {article.url && (
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline mt-1 inline-flex items-center gap-1">
                              Read article <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false) }}
          role="dialog"
          aria-modal="true"
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2" onClick={() => setLightboxOpen(false)} aria-label="Close lightbox">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-[92vw] max-w-5xl h-[76vh]">
            {activeImages[activeImageIndex] && (
              <Image src={activeImages[activeImageIndex]} alt={activeTitle || 'image'} fill className="object-contain" />
            )}
            {activeImages.length > 1 && (
              <>
                <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white rounded-full p-3" onClick={() => setActiveImageIndex((i) => (i - 1 + activeImages.length) % activeImages.length)} aria-label="Previous">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/25 text-white rounded-full p-3" onClick={() => setActiveImageIndex((i) => (i + 1) % activeImages.length)} aria-label="Next">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <div className="absolute -bottom-8 left-0 right-0 text-center text-white/70 text-xs">{activeImageIndex + 1} / {activeImages.length}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function InitiativesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div></div>}>
      <InitiativesContent />
    </Suspense>
  )
}
