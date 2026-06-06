'use client'

import React, { useState, useEffect } from 'react'

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0
  })

  useEffect(() => {
    const startTime = performance.now()
    
    // Monitor page load
    const handleLoad = () => {
      const loadTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, loadTime }))
    }

    // Monitor API calls
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      setMetrics(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }))
      return originalFetch(...args)
    }

    window.addEventListener('load', handleLoad)
    
    return () => {
      window.removeEventListener('load', handleLoad)
      window.fetch = originalFetch
    }
  }, [])

  return metrics
}

// Lazy loading wrapper
export function LazyWrapper({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('lazy-content')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div id="lazy-content">
      {isVisible ? children : (fallback || <div className="animate-pulse bg-gray-200 h-64 rounded"></div>)}
    </div>
  )
}

// Error boundary for better error handling
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600 text-sm mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
