'use client'

import { useState, useEffect } from 'react'
import {
  Images, FileText, Image as ImageIcon, BookOpen, BarChart2,
  MessageSquare, Users, Settings, ChevronDown, ChevronRight,
  Layers, Quote, Star, Menu, X, LogOut, ExternalLink
} from 'lucide-react'
import SlideshowManager from '@/components/admin/SlideshowManager'
import InitiativesManager from '@/components/admin/InitiativesManager'
import GalleryManager from '@/components/admin/GalleryManager'
import TestimonialsManager from '@/components/admin/TestimonialsManager'
import JourneyManager from '@/components/admin/JourneyManager'
import BiographyManager from '@/components/admin/BiographyManager'
import PressManager from '@/components/admin/PressManager'
import QuotesManager from '@/components/admin/QuotesManager'
import YearlyReportsManager from '@/components/admin/YearlyReportsManager'
import ContactMessagesManager from '@/components/admin/ContactMessagesManager'
import NewsletterSubscribersManager from '@/components/admin/NewsletterSubscribersManager'
import SiteSettingsPanel from '@/components/admin/SiteSettingsPanel'
import FoundationManager from '@/components/admin/FoundationManager'

type Section =
  | 'slideshow' | 'biography' | 'journey' | 'testimonials' | 'quotes'
  | 'impact'
  | 'press'
  | 'gallery'
  | 'yearlyReports'
  | 'foundation'
  | 'makeItBetter'
  | 'contactMessages' | 'subscribers'
  | 'settings'

interface NavGroup {
  label: string
  icon: React.ElementType
  key?: Section
  children?: { label: string; key: Section; icon: React.ElementType }[]
  href?: string
}

const NAV: NavGroup[] = [
  {
    label: 'Home',
    icon: Layers,
    children: [
      { label: 'Main Slideshow', key: 'slideshow', icon: Images },
      { label: 'Biography', key: 'biography', icon: BookOpen },
      { label: 'Journey', key: 'journey', icon: BarChart2 },
      { label: 'Voices of Support', key: 'testimonials', icon: MessageSquare },
      { label: 'Quotes Ticker', key: 'quotes', icon: Quote },
    ],
  },
  { label: 'Impact', icon: Star, key: 'impact' },
  { label: 'Press Release', icon: FileText, key: 'press' },
  { label: 'Gallery', icon: ImageIcon, key: 'gallery' },
  { label: 'Yearly Reports', icon: BarChart2, key: 'yearlyReports' },
  { label: 'Foundation / CSR', icon: Star, key: 'foundation' as Section },
  { label: 'Make It Better', icon: ExternalLink, key: 'makeItBetter' as Section },
  {
    label: 'Contact',
    icon: MessageSquare,
    children: [
      { label: 'Messages', key: 'contactMessages', icon: MessageSquare },
      { label: 'Newsletter', key: 'subscribers', icon: Users },
    ],
  },
  { label: 'Settings', icon: Settings, key: 'settings' },
]

const SECTION_TITLES: Record<Section, string> = {
  slideshow: 'Main Slideshow',
  biography: 'Biography',
  journey: 'Journey',
  testimonials: 'Voices of Support',
  quotes: 'Quotes Ticker',
  impact: 'Impact',
  press: 'Press Release',
  gallery: 'Gallery',
  yearlyReports: 'Yearly Reports',
  foundation: 'Foundation / CSR',
  makeItBetter: 'Make It Better',
  contactMessages: 'Contact Messages',
  subscribers: 'Newsletter Subscribers',
  settings: 'Settings',
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('slideshow')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['Home', 'Contact']))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/data', { credentials: 'include' })
        const db = await response.json()
        setData(db)
      } catch {
        setData({ slideshow: [], initiatives: [], press: [], gallery: [], testimonials: [], journey: [], biography: null, quotes: [], yearlyReports: [], siteSettings: {}, contactMessages: [], subscribers: [] })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'include' })
    } catch { /* ignore */ }
    window.location.href = '/admin'
  }

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const navigate = (key: Section) => {
    setActiveSection(key)
    setSidebarOpen(false)
  }

  // Count unread messages for badge
  const unreadCount = Array.isArray(data?.contactMessages)
    ? data.contactMessages.filter((m: any) => m.status === 'unread').length
    : 0

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Panel</p>
      </div>
      <div className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {NAV.map((group) => {
          if (group.href) {
            return (
              <a
                key={group.label}
                href={group.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-700 transition-colors text-sm font-medium"
              >
                <group.icon className="h-4 w-4 flex-shrink-0" />
                <span>{group.label}</span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
              </a>
            )
          }

          if (group.key) {
            const isActive = activeSection === group.key
            return (
              <button
                key={group.label}
                onClick={() => navigate(group.key!)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                <group.icon className="h-4 w-4 flex-shrink-0" />
                <span>{group.label}</span>
              </button>
            )
          }

          // Grouped
          const isOpen = openGroups.has(group.label)
          const isAnyChildActive = group.children?.some((c) => c.key === activeSection)
          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isAnyChildActive ? 'text-orange-700 bg-orange-50' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <group.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                {isOpen ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronRight className="h-4 w-4 opacity-50" />}
              </button>
              {isOpen && group.children && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-3">
                  {group.children.map((child) => {
                    const isActive = activeSection === child.key
                    const badge = child.key === 'contactMessages' && unreadCount > 0 ? unreadCount : null
                    return (
                      <button
                        key={child.key}
                        onClick={() => navigate(child.key)}
                        className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors text-sm ${
                          isActive ? 'bg-orange-600 text-white font-semibold' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                        }`}
                      >
                        <child.icon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="flex-1 text-left">{child.label}</span>
                        {badge && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}>
                            {badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </nav>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-white h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">{SECTION_TITLES[activeSection]}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="lg:hidden px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <>
              {activeSection === 'slideshow' && <SlideshowManager data={data} />}
              {activeSection === 'biography' && <BiographyManager data={data} />}
              {activeSection === 'journey' && <JourneyManager data={data} />}
              {activeSection === 'testimonials' && <TestimonialsManager data={data} />}
              {activeSection === 'quotes' && <QuotesManager data={data} />}
              {activeSection === 'impact' && <InitiativesManager data={data} />}
              {activeSection === 'press' && <PressManager data={data} />}
              {activeSection === 'gallery' && <GalleryManager data={data} />}
              {activeSection === 'yearlyReports' && <YearlyReportsManager data={data} />}
              {activeSection === 'foundation' && <FoundationManager data={data} />}
              {activeSection === 'makeItBetter' && (
                <div className="bg-white rounded-lg shadow -m-4 sm:-m-6 lg:-m-8">
                  <iframe
                    src="/admin/make-it-better?embedded=true"
                    className="w-full border-0 rounded-lg"
                    style={{ height: 'calc(100vh - 80px)' }}
                    title="Make It Better Management"
                  />
                </div>
              )}
              {activeSection === 'contactMessages' && <ContactMessagesManager data={data} />}
              {activeSection === 'subscribers' && <NewsletterSubscribersManager data={data} />}
              {activeSection === 'settings' && <SiteSettingsPanel data={data} />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
