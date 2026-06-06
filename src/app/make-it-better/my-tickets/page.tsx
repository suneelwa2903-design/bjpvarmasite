'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api-client'

type Ticket = { ticketNo: string; subject: string | null; status: string; createdAt: string; category: string; categoryType: string; district: string | null }

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [userMobile, setUserMobile] = useState<string>('')
  const [dlgFor, setDlgFor] = useState<Ticket | null>(null)
  const [replyText, setReplyText] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    // localStorage is now used only for greeting/UI prefill. Identity comes from
    // the `mib-session` cookie set on login; the server reads the citizen from
    // that cookie and ignores any email/mobile we'd send.
    setUserEmail(localStorage.getItem('mibUserEmail') || '')
    setUserMobile(localStorage.getItem('mibUserMobile') || '')
    setUserName(localStorage.getItem('mibUserName') || '')
    fetch('/api/mib/tickets/mine').then(r => r.json()).then(json => {
      if (!json.success) {
        setError(json.error === 'Authentication required' ? 'Please login to view your tickets.' : (json.error || 'Failed to load'))
        setTickets([])
        return
      }
      setTickets(json.data as Ticket[])
    }).catch(() => { setError('Failed to load'); setTickets([]) })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        {userName && (
          <div className="text-sm text-gray-700 flex items-center gap-3">
            <span>Signed in as <span className="font-semibold">{userName}</span></span>
            <span>·</span>
            <button type="button" className="underline" onClick={() => { /* already on my tickets */ }}>View open tickets</button>
            <span>·</span>
            <button type="button" className="underline" onClick={async () => {
              try { await apiFetch('/api/mib/auth/logout', { method: 'POST' }) } catch {}
              try { localStorage.removeItem('mibUserName'); localStorage.removeItem('mibUserEmail'); localStorage.removeItem('mibUserMobile') } catch {}
              location.href = '/make-it-better'
            }}>Sign out</button>
          </div>
        )}
      </div>
      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
      {tickets === null ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : tickets.length === 0 ? (
        <div className="text-sm text-gray-600">No tickets</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Ticket</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">District</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.ticketNo} className="border-t">
                  <td className="px-4 py-3 font-medium">{t.ticketNo}</td>
                  <td className="px-4 py-3">{t.subject || '-'}</td>
                  <td className="px-4 py-3">{t.category} / {t.categoryType}</td>
                  <td className="px-4 py-3">{t.district || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 mr-3">{t.status}</span>
                    {t.status === 'NEED_INFO' && (
                      <button className="px-2 py-1 text-xs rounded bg-orange-600 text-white hover:bg-orange-700" onClick={()=>{ setDlgFor(t); setReplyText(''); setFile(null) }}>Add info</button>
                    )}
                  </td>
                  <td className="px-4 py-3">{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dlgFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">Provide additional details for {dlgFor.ticketNo}</div>
              <button className="p-1 hover:bg-gray-100 rounded" onClick={()=>setDlgFor(null)}>✕</button>
            </div>
            <div className="p-4 space-y-3">
              <textarea value={replyText} onChange={(e)=>setReplyText(e.target.value)} rows={5} className="w-full border rounded p-2" placeholder="Add details (required)" />
              <div className="flex items-center gap-3"><input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} /></div>
              <div className="text-xs text-gray-500">Your update will be shared with the admin and move the ticket back to OPEN.</div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={()=>setDlgFor(null)}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700" onClick={async()=>{
                if (!replyText.trim()) { alert('Please add details'); return }
                // optional upload
                let uploadedMeta: { key: string } | null = null
                if (file) {
                  const fd = new FormData(); fd.append('image', file)
                  const up = await apiFetch('/api/mib/upload', { method:'POST', body: fd })
                  const meta = await up.json(); if (up.ok) uploadedMeta = meta
                }
                await apiFetch(`/api/mib/tickets/${dlgFor.ticketNo}/citizen-comment`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: replyText.trim(), attachments: uploadedMeta && file ? [{ fileName: file.name, mimeType: file.type, sizeBytes: file.size, storageUrl: uploadedMeta.key }] : [] }) })
                setDlgFor(null)
                // refresh list — identity from session cookie, no query params
                const j = await apiFetch('/api/mib/tickets/mine').then(r=>r.json()); if (j.success) setTickets(j.data)
              }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
