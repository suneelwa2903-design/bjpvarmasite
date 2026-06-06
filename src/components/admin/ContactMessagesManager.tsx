'use client'

import { useState } from 'react'
import { Trash2, Mail, MailOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

interface ContactMessage {
  id: string
  category: string
  name: string
  email: string
  subject: string
  message: string
  status: 'read' | 'unread'
  createdAt: string
}

export default function ContactMessagesManager({ data }: { data: any }) {
  const [messages, setMessages] = useState<ContactMessage[]>(() =>
    Array.isArray(data?.contactMessages)
      ? [...data.contactMessages].sort((a: any, b: any) => b.createdAt?.localeCompare(a.createdAt || '') || 0)
      : []
  )
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const markRead = async (id: string, status: 'read' | 'unread') => {
    const res = await apiFetch('/api/admin/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'contactMessage', id, data: { status } }),
    })
    if (res.status === 401) {
      alert('Session expired. Please log in again.')
      window.location.href = '/admin'
      return
    }
    if (res.ok) {
      const j = await res.json()
      setMessages(
        [...(j.data.contactMessages || [])].sort((a: any, b: any) =>
          b.createdAt?.localeCompare(a.createdAt || '') || 0
        )
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return
    const res = await apiFetch('/api/admin/data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'contactMessage', id }),
    })
    if (res.ok) {
      const j = await res.json()
      setMessages(
        [...(j.data.contactMessages || [])].sort((a: any, b: any) =>
          b.createdAt?.localeCompare(a.createdAt || '') || 0
        )
      )
    } else {
      alert('Failed to delete')
    }
  }

  const filtered = messages.filter((m) => filter === 'all' || m.status === filter)
  const unreadCount = messages.filter((m) => m.status === 'unread').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Contact Messages</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-orange-600 mt-0.5">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                filter === f ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className={`bg-white rounded-lg shadow border-l-4 ${m.status === 'unread' ? 'border-orange-500' : 'border-gray-200'}`}>
            <div
              className="p-4 cursor-pointer flex items-start justify-between gap-4"
              onClick={() => {
                setExpanded(expanded === m.id ? null : m.id)
                if (m.status === 'unread') markRead(m.id, 'read')
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {m.status === 'unread'
                    ? <Mail className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    : <MailOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  }
                  <span className={`text-sm font-semibold ${m.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                    {m.name}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{m.email}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium">{m.category}</span>
                </div>
                <p className={`text-sm truncate ${m.status === 'unread' ? 'font-medium text-gray-800' : 'text-gray-600'}`}>{m.subject}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.createdAt ? new Date(m.createdAt).toLocaleString('en-IN') : ''}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); markRead(m.id, m.status === 'read' ? 'unread' : 'read') }}
                  className="text-xs text-blue-600 hover:underline"
                  title={m.status === 'read' ? 'Mark unread' : 'Mark read'}
                >
                  {m.status === 'read' ? 'Mark unread' : 'Mark read'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(m.id) }}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {expanded === m.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </div>
            </div>
            {expanded === m.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.message}</p>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <Mail className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p>No messages{filter !== 'all' ? ` (${filter})` : ''} yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
