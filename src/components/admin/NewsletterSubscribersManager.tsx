'use client'

import { useState } from 'react'
import { Trash2, Download, Users } from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

interface Subscriber {
  email: string
  subscribedAt: string
}

export default function NewsletterSubscribersManager({ data }: { data: any }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() =>
    Array.isArray(data?.subscribers)
      ? [...data.subscribers].sort((a: any, b: any) => b.subscribedAt?.localeCompare(a.subscribedAt || '') || 0)
      : []
  )

  const handleDelete = async (email: string) => {
    if (!confirm(`Unsubscribe ${email}?`)) return
    // Using email as the id for subscribers
    const res = await apiFetch('/api/admin/data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'subscriber', id: email }),
    })
    if (res.ok) {
      const j = await res.json()
      setSubscribers(
        [...(j.data.subscribers || [])].sort((a: any, b: any) =>
          b.subscribedAt?.localeCompare(a.subscribedAt || '') || 0
        )
      )
    } else {
      alert('Failed to remove subscriber')
    }
  }

  const exportCsv = () => {
    const header = 'Email,Subscribed At\n'
    const rows = subscribers.map((s) => `${s.email},${s.subscribedAt}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Newsletter Subscribers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
        </div>
        {subscribers.length > 0 && (
          <button
            onClick={exportCsv}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        )}
      </div>

      {subscribers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p>No subscribers yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Subscribed</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((s, i) => (
                <tr key={s.email} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(s.email)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Remove subscriber"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
