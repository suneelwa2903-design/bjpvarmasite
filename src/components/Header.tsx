'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, Globe, Sparkles, Moon, SunMedium, Search, Building2, Users, Award, Settings, Type } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import UserMenu from '@/components/UserMenu'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/components/i18n/LanguageProvider'

const Header = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL, BEFORE ANY CONDITIONAL RETURNS
  const pathname = usePathname()
  const { t, lang, setLang } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [isLargeFont, setIsLargeFont] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    try {
      const t = localStorage.getItem('theme')
      const f = localStorage.getItem('font-scale')
      const isDarkMode = t === 'dark'
      const isLarge = f === 'large'
      setIsDark(isDarkMode)
      setIsLargeFont(isLarge)
      
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
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Early return AFTER all hooks are called
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/office')) return null

  const navigation = [
    { key: 'nav.home', href: '/' },
    { key: 'nav.impact', href: '/initiatives' },
    { key: 'nav.press', href: '/press-release' },
    { key: 'nav.gallery', href: '/gallery' },
    { key: 'nav.mib', href: '/make-it-better' },
    { key: 'nav.contact', href: '/contact' },
  ]

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  const toggleDark = () => {
    const root = document.documentElement
    const next = !isDark
    setIsDark(next)
    if (next) {
      root.classList.add('dark')
      localStorage.setItem('theme','dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme','light')
    }
  }

  const toggleFont = () => {
    const root = document.documentElement
    const next = !isLargeFont
    setIsLargeFont(next)
    if (next) {
      root.setAttribute('data-font','large')
      localStorage.setItem('font-scale','large')
    } else {
      root.removeAttribute('data-font')
      localStorage.setItem('font-scale','normal')
    }
  }
  
  const toggleLang = () => {
    const next = lang === 'en' ? 'te' : 'en'
    setLang(next)
    try { window.dispatchEvent(new CustomEvent('lang:change')) } catch {}
  }


  return (
    <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-lg sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 relative">
        <div className="flex justify-between items-center gap-4 min-h-[120px] md:min-h-[140px]">
          {/* Logo/Brand Section */}
          <div className="flex items-start gap-3 md:gap-4 min-w-0 flex-1">
            {/* Profile Image - BJP Varma */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 border-3 border-orange-100 hover:border-orange-300 transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
              <Image
                src="/images/header-image.jpg"
                alt="BJP Varma"
                fill
                className="object-cover transition-transform duration-300 hover:scale-110"
                priority={false}
                loading="lazy"
              />
            </div>

            {/* Name/Title */}
            <div className="min-w-0 flex-1 flex flex-col justify-center space-y-4 md:space-y-5">
              <Link href="/" className="block">
                <h1 className="text-xl md:text-2xl font-extrabold uppercase leading-tight">
                  <span className="animated-saffron-strong">{t('profile.name')}</span>
                  <span className="text-lg md:text-xl text-gray-500 font-medium normal-case"> {t('profile.alias')}</span>
                  <span className="text-lg md:text-xl text-black dark:text-gray-200 font-medium normal-case">, </span>
                  <span className="text-lg md:text-xl text-gray-500 font-medium normal-case">{t('profile.degrees')}</span>
                </h1>
              </Link>
              {/* Role lines with natural spacing (no forced height) */}
              <div className="text-base md:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed space-y-4 md:space-y-5">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 md:h-7 md:w-7 text-orange-600 inline-block align-middle" aria-label="Minister icon" />
                  <span>{t('profile.minister')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 md:h-7 md:w-7 text-orange-600 inline-block align-middle" aria-label="MP icon" />
                  <span>{t('profile.mp')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Modi Image with Link */}
          <div className="flex items-start gap-3 flex-shrink-0">
            <a
              href="https://www.narendramodi.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 border-3 border-orange-100 hover:border-orange-300 transition-all hover:shadow-lg hover:scale-105"
              aria-label="Visit Prime Minister Narendra Modi's website"
            >
              <Image
                src="/images/modi.jpg"
                alt="Prime Minister Narendra Modi"
                fill
                className="object-cover transition-transform duration-300 hover:scale-110"
                priority
                onError={(e) => {
                  // Fallback if image doesn't exist
                  const target = e.target as HTMLImageElement
                  target.src = '/images/slide1.jpg'
                }}
              />
            </a>
          </div>
          
          {/* Settings Dropdown - Top Right Corner */}
          <div className="absolute top-4 right-0 md:top-6 md:right-0 z-[200]" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="group relative inline-flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Settings"
              aria-expanded={isSettingsOpen}
              suppressHydrationWarning
            >
              <Settings className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-[200]">
                <div className="py-1">
                  {/* Language Toggle */}
                  <button
                    onClick={() => {
                      toggleLang()
                      setIsSettingsOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span>
                      <span className="font-english">Language: </span>
                      {lang === 'en' ? (
                        <span className="font-english">English</span>
                      ) : (
                        <span className="font-telugu">తెలుగు</span>
                      )}
                    </span>
                  </button>
                  
                  {/* Font Size Toggle */}
                  <button
                    onClick={() => {
                      toggleFont()
                      setIsSettingsOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    <span>Font Size: {isLargeFont ? 'Large' : 'Normal'}</span>
                  </button>
                  
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={() => {
                      toggleDark()
                      setIsSettingsOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    {isDark ? (
                      <SunMedium className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    <span>Theme: {isDark ? 'Dark' : 'Light'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Utilities: Mobile Menu (floating controls handle font/theme/lang) */}
          <div className="flex items-start gap-3 flex-shrink-0">

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-orange-600"
              suppressHydrationWarning
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Decorative double underline in brand orange across container */}
        <div className="mt-3 space-y-1">
          <div className="h-0.5 bg-orange-600 w-full"></div>
          <div className="h-0.5 bg-orange-600 w-full"></div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 mt-0 pt-3 pb-3">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <div key={item.key} className="relative">
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md text-base font-medium transition-colors"
                    onClick={handleLinkClick}
                  >
                    {t(item.key)}
                  </Link>
                  {item.key === 'nav.mib' && (
                    <Sparkles className="h-4 w-4 text-amber-500 absolute top-1 right-2 animate-pulse" />
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="bg-white py-3 mt-4 dark:bg-gray-900">
          <nav className="flex items-center justify-between w-full">
            <div className="flex items-center gap-8 md:gap-12">
            {/* Regular Links */}
            <Link
              href="/"
              className="group relative text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 px-2.5 md:px-3 py-1.5 text-base md:text-lg font-semibold transition-colors duration-200 whitespace-nowrap"
            >
              {t('nav.home')}
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-0.5 w-0 bg-gradient-to-r from-orange-500 to-orange-700 transition-all duration-300 group-hover:w-10" />
            </Link>

            {/* Rest of Navigation */}
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

            {/* Right actions aligned to container edge */}
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
    </header>
  )
}

export default Header
