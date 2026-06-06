'use client'

import dynamic from 'next/dynamic'
import TopSlideshow from '@/components/TopSlideshow'
import BiographySection from '@/components/BiographySection'
const WelcomeSplash = dynamic(() => import('@/components/WelcomeSplash'), {
  ssr: true,
  loading: () => (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
    </div>
  ),
})

// Lazy-load below-the-fold components for performance
const JourneySection = dynamic(() => import('@/components/JourneySection'), {
  loading: () => <div className="py-20 bg-black"><div className="animate-pulse bg-gray-800 h-64 max-w-7xl mx-auto rounded" /></div>,
  ssr: true,
})

const NewsSection = dynamic(() => import('@/components/NewsSection'), {
  loading: () => <div className="py-20 bg-white dark:bg-gray-900"><div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 max-w-7xl mx-auto rounded" /></div>,
  ssr: true,
})

const VoicesOfSupport = dynamic(() => import('@/components/VoicesOfSupport'), {
  loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 max-w-7xl mx-auto rounded" /></div>,
  ssr: true,
})

const SociableKitEmbeds = dynamic(() => import('@/components/SociableKitEmbeds'), {
  loading: () => <div className="py-16 bg-gray-50 dark:bg-gray-950"><div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 max-w-7xl mx-auto rounded" /></div>,
  ssr: false, // uses useEffect for scripts
})


const FoundationSection = dynamic(() => import('@/components/FoundationSection'), {
  loading: () => <div className="py-20 bg-green-50 dark:bg-gray-900"><div className="animate-pulse bg-green-100 dark:bg-gray-700 h-64 max-w-7xl mx-auto rounded" /></div>,
  ssr: true,
})

const YearlyReportsSection = dynamic(() => import('@/components/YearlyReportsSection'), {
  loading: () => <div className="py-20 bg-white dark:bg-gray-900"><div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 max-w-7xl mx-auto rounded" /></div>,
  ssr: true,
})

const FeaturedPressCarousel = dynamic(() => import('@/components/FeaturedPressCarousel'), {
  loading: () => <div className="py-16 bg-gray-50 dark:bg-gray-950"><div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-72 max-w-7xl mx-auto rounded-2xl" /></div>,
  ssr: true,
})

export default function Home() {
  return (
    <div className="min-h-screen">
      <WelcomeSplash />
      <TopSlideshow />
      <BiographySection />
      <JourneySection />
      <NewsSection />
      <FeaturedPressCarousel />
      <VoicesOfSupport />
      <FoundationSection />
      <SociableKitEmbeds />
      <YearlyReportsSection />
    </div>
  )
}
