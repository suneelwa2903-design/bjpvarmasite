'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Sparkles, Search, Building2, Award } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import UserMenu from '@/components/UserMenu'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/components/i18n/LanguageProvider'

const Header = () => {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Lock body scroll when drawer is open (P1.3)
  useEffect(() => {
    if (isMenuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isMenuOpen])

  // Close drawer on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Hide header entirely on admin/office portals
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/office')) return null

  // P2.6 — Impact route renamed from /initiatives to /impact (301 redirect added in next.config.js)
  const navigation = [
    { key: 'nav.home', href: '/' },
    { key: 'nav.impact', href: '/impact' },
    { key: 'nav.press', href: '/press-release' },
    { key: 'nav.gallery', href: '/gallery' },
    { key: 'nav.mib', href: '/make-it-better' },
    { key: 'nav.contact', href: '/contact' },
  ]

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-lg sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 relative">

        {/* ============================================================
            HAMBURGER (mobile only) — anchored top-right, easy to reach.
            P1.4: Settings dropdown removed — FloatingControls already
            handles lang/theme/font as a separate dock.
            ============================================================ */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden absolute top-3 right-3 z-[150] p-3 text-gray-700 hover:text-orange-600 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          suppressHydrationWarning
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* ============================================================
            HEADER LAYOUT
            Mobile (<md): vertical stack — photo (centered) → name → title
              Modi photo is hidden on mobile to declutter (still visible md+)
            Desktop (md+): photo-left, text-middle, modi-right (original)
            ============================================================ */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 md:min-h-[140px] text-center md:text-left">

          {/* Profile + Name block */}
          <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4 min-w-0 md:flex-1 items-center">
            {/* Profile Image */}
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 border-[3px] border-orange-200 hover:border-orange-300 transition-all hover:shadow-lg cursor-pointer">
              <Image
                src="/images/header-image.jpg"
                alt="BJP Varma"
                fill
                sizes="(max-width: 768px) 112px, 128px"
                className="object-cover"
                priority
              />
            </div>

            {/* Name / Degrees / Roles */}
            <div className="min-w-0 md:flex-1 flex flex-col md:justify-center space-y-2 md:space-y-4 w-full">
              <Link href="/" className="block">
                {/* Name on mobile fits 2 lines max; desktop keeps original treatment */}
                <h1 className="text-base sm:text-lg md:text-2xl font-extrabold uppercase leading-tight">
                  <span className="animated-saffron-strong block md:inline">{t('profile.name')}</span>
                  <span className="block md:inline text-sm md:text-xl text-gray-500 font-medium normal-case md:ml-2">
                    {t('profile.alias')}
                  </span>
                  <span className="block md:inline text-sm md:text-xl text-gray-500 font-medium normal-case md:ml-1">
                    , {t('profile.degrees')}
                  </span>
                </h1>
              </Link>

              {/* Role lines */}
              <div className="text-sm md:text-2xl text-gray-700 dark:text-gray-200 leading-snug md:leading-relaxed space-y-1.5 md:space-y-4">
                <div className="flex items-center md:items-start justify-center md:justify-start gap-2 md:gap-3">
                  <Award className="h-5 w-5 md:h-7 md:w-7 text-orange-600 flex-shrink-0" aria-label="Minister icon" />
                  <span className="text-left">{t('profile.minister')}</span>
                </div>
                <div className="flex items-center md:items-start justify-center md:justify-start gap-2 md:gap-3">
                  <Building2 className="h-5 w-5 md:h-7 md:w-7 text-orange-600 flex-shrink-0" aria-label="MP icon" />
                  <span className="text-left">{t('profile.mp')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modi photo — hidden on mobile to remove crowding (P1.1) */}
          <div className="hidden md:flex items-start gap-3 flex-shrink-0">
            <a
              href="https://www.narendramodi.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 border-[3px] border-orange-200 hover:border-orange-300 transition-all hover:shadow-lg"
              aria-label="Visit Prime Minister Narendra Modi's website"
            >
              <Image
                src="/images/modi.jpg"
                alt="Prime Minister Narendra Modi"
                fill
                sizes="128px"
                className="object-cover"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/slide1.jpg'
                }}
              />
            </a>
          </div>
        </div>

        {/* Decorative double underline */}
        <div className="mt-3 space-y-1">
          <div className="h-0.5 bg-orange-600 w-full"></div>
          <div className="h-0.5 bg-orange-600 w-full"></div>
        </div>

        {/* ============================================================
            DESKTOP NAVIGATION (P1.2: hidden md:block — mobile gets drawer)
            ============================================================ */}
        <div className="hidden md:block bg-white py-3 mt-4 dark:bg-gray-900">
          <nav className="flex items-center justify-between w-full">
            <div className="flex items-center gap-8 md:gap-12">
              <Link
                href="/"
                className="group relative text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 px-2.5 md:px-3 py-1.5 text-base md:text-lg font-semibold transition-colors duration-200 whitespace-nowrap"
              >
                {t('nav.home')}
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-0.5 w-0 bg-gradient-to-r from-orange-500 to-orange-700 transition-all duration-300 group-hover:w-10" />
              </Link>

              {navigation.slice(1).map((item) => (
                <div key={item.key} className="relative">
                  <Link
                    href={item.href}
                    className="group relative text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 px-2.5 md:px-3 py-1.5 text-base md:text-lg font-semibold transition-colors duration-200 whitespace-nowrap"
                  >
                    {t(item.key)}
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-0.5 w-0 bg-gradient-to-r from-orange-500 to-orange-700 transition-all duration-300 group-hover:w-10" />
                  </Link>
                  {pathname === '/make-it-better' && item.key === 'nav.mib' && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs md:text-[13px] text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      Grievance / Feedback Portal
                    </div>
                  )}
                  {item.key === 'nav.mib' && (
                    <Sparkles className="h-4 w-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/search"
                className="group relative inline-flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 px-2 py-1.5 text-base md:text-lg font-semibold transition-colors duration-200"
                aria-label="Search"
              >
                <Search className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
              <UserMenu />
            </div>
          </nav>
        </div>
      </div>

      {/* ============================================================
          MOBILE DRAWER (P1.3)
          Full-screen overlay with backdrop + solid panel + body-scroll lock.
          Rendered OUTSIDE the header container (still inside the <header>)
          so it takes the full viewport.
          ============================================================ */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[140]" role="dialog" aria-modal="true" aria-label="Site navigation">
          {/* Backdrop */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            aria-label="Close menu"
          />
          {/* Panel — slides in from right, solid white */}
          <nav className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-base font-bold text-gray-900 dark:text-white">Menu</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-700 hover:text-orange-600"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <ul className="px-3 py-3 space-y-1">
              {navigation.map((item) => (
                <li key={item.key} className="relative">
                  <Link
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-gray-800 dark:text-gray-100 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-600 transition-colors min-h-[44px]"
                    onClick={handleLinkClick}
                  >
                    <span>{t(item.key)}</span>
                    {item.key === 'nav.mib' && (
                      <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                    )}
                  </Link>
                </li>
              ))}
              <li className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <Link
                  href="/search"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-gray-800 dark:text-gray-100 hover:bg-orange-50 hover:text-orange-600 transition-colors min-h-[44px]"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
