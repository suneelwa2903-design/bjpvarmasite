'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { translate, type Lang } from '@/i18n/dictionary'

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<Ctx | null>(null)

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem('lang', l) } catch {}
    try { document.documentElement.setAttribute('lang', l) } catch {}
  }, [])

  useEffect(() => {
    try {
      const stored = (localStorage.getItem('lang') as Lang) || 'en'
      setLangState(stored)
      document.documentElement.setAttribute('lang', stored)
    } catch {}

    const onBroadcast = (e: Event) => {
      try {
        const l = (localStorage.getItem('lang') as Lang) || 'en'
        setLangState(l)
        document.documentElement.setAttribute('lang', l)
      } catch {}
    }
    window.addEventListener('lang:change', onBroadcast as any)
    window.addEventListener('storage', onBroadcast as any)
    return () => {
      window.removeEventListener('lang:change', onBroadcast as any)
      window.removeEventListener('storage', onBroadcast as any)
    }
  }, [])

  const t = useMemo(() => (key: string) => translate(lang, key), [lang])
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}


