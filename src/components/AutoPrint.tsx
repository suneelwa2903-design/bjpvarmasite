'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function AutoPrint() {
  const params = useSearchParams()
  useEffect(() => {
    if (params?.get('autoprint') === '1') {
      const t = setTimeout(() => window.print(), 600)
      return () => clearTimeout(t)
    }
  }, [params])
  return null
}
