'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search as SearchIcon, Calendar } from 'lucide-react'

type Initiative = {
  id: string
  title: string
  summary?: string
  description?: string
  type: 'constituency' | 'ministry'
  date?: string
  images?: string[]
}

type PressItem = { id: string; title: string; summary?: string; date?: string }
type EventItem = { id: string; title: string; summary?: string; date?: string }

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [data, setData] = useState<{ initiatives: Initiative[]; press: PressItem[]; events: EventItem[] }>({ initiatives: [], press: [], events: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/data', { credentials: 'include' })
        const db = await res.json()
        setData({ initiatives: db.initiatives || [], press: db.press || [], events: db.events || [] })
      } catch (e) {
        console.error('Search preload failed', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const results = useMemo(() => {
    if (!q) return { initiatives: [] as Initiative[], press: [] as PressItem[], events: [] as EventItem[] }
    const needle = q.toLowerCase()
    const initiatives = (data.initiatives || []).filter((i) => {
      const hay = [i.title, i.summary, i.description, i.type].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(needle)
    })
    const press = (data.press || []).filter((p) => {
      const hay = [p.title, p.summary].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(needle)
    })
    const events = (data.events || []).filter((e) => {
      const hay = [e.title, e.summary].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(needle)
    })
    return { initiatives, press, events }
  }, [q, data])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Search</h1>
          <p className="text-orange-100 mt-1">Find impact and content across the site</p>
          <div className="mt-6 relative">
            <SearchIcon className="h-5 w-5 text-orange-200 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type to search…"
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 dark:text-gray-100 border border-orange-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              autoFocus
            />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading…</div>
          ) : q && (results.initiatives.length + results.press.length + results.events.length === 0) ? (
            <div className="text-gray-600 dark:text-gray-300">No results for "{q}"</div>
          ) : (
            <div className="space-y-10">
              {results.initiatives.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Initiatives ({results.initiatives.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.initiatives.map((i) => (
                      <Link key={i.id} href={`/impact`} className="block bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-800 p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${i.type === 'ministry' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{i.type}</span>
                          {i.date && (<span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Calendar className="h-3 w-3" />{i.date}</span>)}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{i.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{i.summary || i.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.press.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Press ({results.press.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.press.map((p) => (
                      <Link key={p.id} href={`/press-release`} className="block bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-800 p-5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{p.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{p.summary}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.events.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Events ({results.events.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.events.map((e) => (
                      <Link key={e.id} href={`/events`} className="block bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-100 dark:border-gray-800 p-5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{e.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{e.summary}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}


