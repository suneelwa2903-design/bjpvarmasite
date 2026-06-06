'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { EventItem } from '@/lib/types'

export default function EventDetailPage() {
  const params = useParams()
  const slug = Array.isArray(params?.slug) ? params?.slug[0] : (params?.slug as string)
  const [item, setItem] = useState<EventItem | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/data', { cache: 'no-store' })
        const data = await res.json()
        const found = (data.events || []).find((e: EventItem) => e.slug === slug)
        if (found) setItem(found)
        else setNotFound(true)
      } catch (e) {
        setNotFound(true)
      }
    }
    if (slug) load()
  }, [slug])

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-gray-600">Event not found.</p>
          <Link href="/events" className="text-orange-600 font-semibold">Back to Events</Link>
        </div>
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/events" className="text-orange-600 font-semibold">← Back to Events</Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
          {item.thumbnail && (
            <div className="relative w-full h-64 rounded mb-5 overflow-hidden">
              <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
            </div>
          )}
          <p className="text-gray-700 leading-relaxed mb-6">{item.summary}</p>
          <div className="flex items-center gap-4">
            {item.link && (
              <a href={item.link} target="_blank" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Open Link</a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


