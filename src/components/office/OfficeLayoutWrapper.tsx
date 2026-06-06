'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

export default function OfficeLayoutWrapper({ children, user }: { children: React.ReactNode; user: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/office/login'
  const isOfficeRoot = pathname === '/office'
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  
  // Redirect logged-in users from /office to /office/analytics
  useEffect(() => {
    if (user && isOfficeRoot) {
      router.replace('/office/analytics')
    }
    // Redirect logged-in users away from login page
    if (user && isLoginPage) {
      router.replace('/office/analytics')
    }
  }, [user, isOfficeRoot, isLoginPage, router])
  
  // If on login page, always render children (the login form) without header
  if (isLoginPage) {
    return <>{children}</>
  }
  
  // If user is logged in, show the dashboard layout
  if (user) {
    const roleDisplay = user.role.replace('OFFICE_', '').replace('_', ' ')
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 shadow-sm relative">
          <div className="w-full px-4 sm:px-6 lg:px-10 py-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-orange-200 shadow-sm">
                  <Image
                    src="/images/header-image.jpg"
                    alt="BJP Varma"
                    fill
                    className="object-cover"
                    priority={false}
                  />
                </div>
              </div>
              <div className="flex-1 text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-600 animated-saffron-strong">
                  BJPVarma Office Portal
                </h1>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="relative">
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                    suppressHydrationWarning
                  >
                    <span>Welcome, {user.name || user.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showRoleDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-semibold">Role</div>
                        <div className="text-gray-600">{roleDisplay}</div>
                      </div>
                      <button
                        onClick={async () => {
                          setShowRoleDropdown(false)
                          try {
                            await apiFetch('/api/office/auth/logout', { method: 'POST' })
                            window.location.href = '/office'
                          } catch (error) {
                            console.error('Logout error:', error)
                            window.location.href = '/office'
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Close dropdown when clicking outside */}
          {showRoleDropdown && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowRoleDropdown(false)}
            />
          )}
        </div>
        <main>{children}</main>
      </div>
    )
  }
  
  // If not logged in and on office root, show landing page
  if (isOfficeRoot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">BJP Varma's Office Portal</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Manage day-to-day activities, ticketing, prioritization, and analytics for distributed teams with transparency and quick decision-making
            </p>
            <Link 
              href="/office/login" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Go to Login
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-900 mb-2">Ticket Management</h3>
              <p className="text-sm text-gray-600">Handle public grievances and internal office tickets with unified tracking</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Prioritization</h3>
              <p className="text-sm text-gray-600">Smart prioritization and SLA tracking for efficient resolution</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-sm text-gray-600">Support multiple distributed teams with role-based access</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Real-time analytics and insights for data-driven decisions</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Decisions</h3>
              <p className="text-sm text-gray-600">Fast-track decision making with comprehensive dashboards</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Transparency</h3>
              <p className="text-sm text-gray-600">Full visibility into both grievance and office workflows</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Default: render children
  return <>{children}</>
}

