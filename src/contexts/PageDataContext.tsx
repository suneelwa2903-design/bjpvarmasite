'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface PageData {
  slideshow?: any[]
  journey?: any[]
  biography?: any
  press?: any[]
  events?: any[]
  initiatives?: any[]
  testimonials?: any[]
  gallery?: any[]
  quotes?: any[]
  yearlyReports?: any[]
  siteSettings?: Record<string, boolean>
  contactMessages?: any[]
  subscribers?: any[]
}

interface PageDataContextType {
  data: PageData | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

const PageDataContext = createContext<PageDataContextType | undefined>(undefined)

export function PageDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/data', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      console.error('Error fetching page data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <PageDataContext.Provider value={{ data, loading, error, refetch: fetchData }}>
      {children}
    </PageDataContext.Provider>
  )
}

export function usePageData() {
  const context = useContext(PageDataContext)
  if (context === undefined) {
    throw new Error('usePageData must be used within a PageDataProvider')
  }
  return context
}




