import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LanguageProvider from '@/components/i18n/LanguageProvider'
import PageDataProviderWrapper from '@/components/PageDataProviderWrapper'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import QuotesTicker from '@/components/QuotesTicker'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bjpvarma.co.in'

export const metadata: Metadata = {
  title: {
    default: 'Bhupathiraju Srinivasa Varma — BJP Varma | Official Website',
    template: '%s | BJP Varma',
  },
  description:
    'Official website of Bhupathiraju Srinivasa Varma (BJP Varma) — Union Minister of State for Heavy Industries & Steel, Member of Parliament from Narsapuram, Andhra Pradesh.',
  keywords: [
    'BJP Varma',
    'Bhupathiraju Srinivasa Varma',
    'Narsapuram MP',
    'Union Minister Heavy Industries',
    'BJP Andhra Pradesh',
    'Make It Better',
    'Narsapuram Lok Sabha',
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Bhupathiraju Srinivasa Varma — BJP Varma | Official Website',
    description:
      'Union Minister of State for Heavy Industries & Steel | MP — Narsapuram, Andhra Pradesh | BJP',
    url: siteUrl,
    siteName: 'BJP Varma',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bhupathiraju Srinivasa Varma — BJP Varma',
    description: 'Union Minister of State for Heavy Industries & Steel | MP — Narsapuram, AP',
    creator: '@BJPVarma',
  },
  robots: { index: true, follow: true },
}

const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Bhupathiraju Srinivasa Varma',
  alternateName: 'BJP Varma',
  jobTitle: 'Union Minister of State for Heavy Industries & Steel',
  description:
    'Member of Parliament from Narsapuram constituency, Andhra Pradesh. Union Minister of State for Heavy Industries & Steel in the Government of India.',
  url: siteUrl,
  image: `${siteUrl}/images/header-image.jpg`,
  birthPlace: {
    '@type': 'Place',
    name: 'Bhimavaram, Andhra Pradesh, India',
  },
  nationality: {
    '@type': 'Country',
    name: 'India',
  },
  memberOf: [
    {
      '@type': 'Organization',
      name: 'Bharatiya Janata Party',
      url: 'https://www.bjp.org',
    },
    {
      '@type': 'GovernmentOrganization',
      name: 'Parliament of India',
      url: 'https://www.sansad.in',
    },
  ],
  sameAs: [
    'https://x.com/BJPVarma',
    'https://facebook.com/BhupathirajuSrinivasaVarmaBjpVarma',
    'https://instagram.com/bjpvarma',
    'https://youtube.com/@BJPVarma',
  ],
}

import { headers } from 'next/headers'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isAdminOrOffice = pathname.startsWith('/admin') || pathname.startsWith('/office')

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Theme + font-scale initialiser — runs before paint to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t==='dark'){d.classList.add('dark')}var f=localStorage.getItem('font-scale');if(f==='large'){d.setAttribute('data-font','large')}}catch(e){}try{window.__splashSeen=!!sessionStorage.getItem('splash_seen')}catch(e){window.__splashSeen=true}`,
          }}
        />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={`${inter.className} bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-600 focus:text-white focus:rounded"
        >
          Skip to main content
        </a>
        {isAdminOrOffice ? (
          children
        ) : (
          <LanguageProvider>
            <PageDataProviderWrapper>
              <QuotesTicker />
              <Header />
              <main id="main-content" className="min-h-screen">
                {children}
              </main>
              <Footer />
              <FloatingWhatsApp />
            </PageDataProviderWrapper>
          </LanguageProvider>
        )}
      </body>
    </html>
  )
}
