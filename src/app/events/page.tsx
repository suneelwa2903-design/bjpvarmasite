'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { EventItem } from '@/lib/types'

const PAGE_SIZE = 9

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'All' | 'Upcoming' | 'Past'>('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/data', { cache: 'no-store' })
        const data = await res.json()
        const list = Array.isArray(data.events) ? data.events : []
        list.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''))
        setEvents(list)
      } catch (e) {
        setEvents([])
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let items = events
    if (status !== 'All') items = items.filter((e) => e.status === status)
    if (query.trim()) {
      const q = query.toLowerCase()
      items = items.filter((e) => [e.title, e.summary, e.location].some((f) => (f || '').toLowerCase().includes(q)))
    }
    return items
  }, [events, status, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  useEffect(() => { setPage(1) }, [status, query])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Events</h1>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder="Search events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoComplete="off"
              suppressHydrationWarning={true}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>All</option>
              <option>Upcoming</option>
              <option>Past</option>
            </select>
            <div className="md:col-span-2 flex items-center justify-end text-sm text-gray-600">
              {filtered.length} results
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-5 flex flex-col">
              {item.thumbnail && (
                <div className="relative w-full h-40 rounded mb-3 overflow-hidden">
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className={`px-2 py-0.5 rounded-full font-semibold ${item.status === 'Upcoming' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                <span>{item.date}</span>
                {item.location && (
                  <>
                    <span>•</span>
                    <span>{item.location}</span>
                  </>
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.summary}</p>
              <div className="mt-auto flex items-center justify-between">
                <Link href={`/events/${item.slug}`} className="text-orange-600 hover:text-orange-700 font-semibold text-sm">View details</Link>
                {item.link && <a href={item.link} target="_blank" className="text-sm text-gray-500 hover:text-gray-700">External</a>}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border rounded disabled:opacity-50">Prev</button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 border rounded disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}

