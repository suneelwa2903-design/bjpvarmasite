'use client'

import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api-client'

type Taxonomy = Record<string, string[]>
type OfficeUser = { id: string; name: string; email: string; mobile: string | null; role: string }

enum EditorMode { Plain = 'plain', Rich = 'rich' }

function RichEditor({ name, initial, onChange }: { name: string; initial?: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => { if (ref.current && initial) ref.current.innerHTML = initial }, [initial])
  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val) }
  const onInput = () => { if (ref.current) onChange(ref.current.innerHTML) }
  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="flex gap-2 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm">
        <button type="button" onClick={() => exec('bold')} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">B</button>
        <button type="button" onClick={() => exec('italic')} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"><i>I</i></button>
        <button type="button" onClick={() => exec('underline')} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"><u>U</u></button>
        <button type="button" onClick={() => exec('justifyLeft')} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">⟸</button>
        <button type="button" onClick={() => exec('justifyCenter')} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">━</button>
        <button type="button" onClick={() => exec('justifyRight')} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">⟹</button>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">• List</button>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={onInput}
        className="min-h-[12rem] p-3 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        suppressContentEditableWarning
      />
      <input type="hidden" name={name} />
    </div>
  )
}

export default function OfficeTicketForm() {
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({})
  const [category, setCategory] = useState('')
  const [categoryType, setCategoryType] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [hasRef, setHasRef] = useState(false)
  const [mode, setMode] = useState<EditorMode>(EditorMode.Plain)
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null)
  const richHtmlRef = useRef<string>('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [officeUsers, setOfficeUsers] = useState<OfficeUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserInfo, setCurrentUserInfo] = useState<{ name: string; email: string; mobile: string | null } | null>(null)
  const [priority, setPriority] = useState('P2')
  const [eta, setEta] = useState('')
  const [assignedToId, setAssignedToId] = useState<string>('')
  const [raisedByName, setRaisedByName] = useState('')
  const [raisedByMobile, setRaisedByMobile] = useState('')
  const [raisedByEmail, setRaisedByEmail] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    // Add cache-busting to ensure fresh taxonomy data
    fetch(`/api/mib/settings/taxonomy?scope=office&t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(({ data }) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          console.log('Loaded taxonomy:', Object.keys(data).length, 'categories')
          setTaxonomy(data)
        } else {
          console.warn('No taxonomy data found or empty. Please update taxonomy in admin panel.')
          setTaxonomy({})
        }
      })
      .catch((err) => {
        console.error('Error loading taxonomy:', err)
        setTaxonomy({})
      })
    Promise.all([
      fetch('/api/office/users').then(r => r.json()),
      fetch('/api/office/me').then(r => r.json())
    ]).then(([usersRes, meRes]) => {
      if (usersRes.data && Array.isArray(usersRes.data)) {
        setOfficeUsers(usersRes.data)
      }
      if (meRes.success && meRes.data?.id) {
        setCurrentUserId(meRes.data.id)
        // Default assignedToId to current user (creator)
        setAssignedToId(meRes.data.id)
        // Auto-populate "Raised by" fields from current user
        if (meRes.data.name) {
          setCurrentUserInfo({
            name: meRes.data.name,
            email: meRes.data.email || '',
            mobile: meRes.data.mobile || null
          })
          setRaisedByName(meRes.data.name)
          if (meRes.data.mobile) setRaisedByMobile(meRes.data.mobile)
          if (meRes.data.email) setRaisedByEmail(meRes.data.email)
        }
      }
    })
  }, [])

  const validateMobile = (mobile: string): boolean => {
    return /^\d{10}$/.test(mobile)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)

    const mobileValue = raisedByMobile || (fd.get('mobile') as string)?.trim()
    if (!validateMobile(mobileValue)) {
      setMessage('Mobile number must be exactly 10 digits')
      setLoading(false)
      return
    }

    const descriptionPlain = (fd.get('description') as string) || ''
    const descriptionHtml = mode === EditorMode.Rich ? (richHtmlRef.current || descriptionPlain) : descriptionPlain

    const payload: any = {
      applicantName: raisedByName || (fd.get('raisedByName') as string),
      mobile: mobileValue,
      email: raisedByEmail || ((fd.get('email') as string)?.trim() || undefined),
      category,
      categoryType,
      state: fd.get('state') as string,
      district: fd.get('district') as string,
      mandal: (fd.get('mandal') as string)?.trim() || undefined,
      ward: (fd.get('ward') as string)?.trim() || undefined,
      pincode: (fd.get('pincode') as string)?.trim() || undefined,
      subject: fd.get('subject') as string,
      descriptionHtml,
      descriptionPlain,
      hasReference: hasRef,
      refName: (fd.get('refName') as string)?.trim() || undefined,
      refPhone: (fd.get('refPhone') as string)?.trim() || undefined,
      refLocation: (fd.get('refLocation') as string)?.trim() || undefined,
      priority,
      eta: eta ? new Date(eta).toISOString() : null,
      assignedToId: assignedToId === '__unassign__' ? null : (assignedToId || undefined), // Send null if explicitly unassigned, undefined if not set (backend defaults to creator)
    }

    if (files && files.length > 0) {
      const attachments: Array<{ fileName: string; mimeType: string; sizeBytes: number; storageUrl: string }> = []
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        try {
          const ufd = new FormData(); ufd.append('image', f)
          const up = await apiFetch('/api/mib/upload', { method:'POST', body: ufd })
          const meta = await up.json()
          if (up.ok && meta?.key) attachments.push({ fileName: f.name, mimeType: f.type, sizeBytes: f.size, storageUrl: meta.key })
        } catch {}
      }
      if (attachments.length > 0) payload.attachments = attachments
    }

    const res = await apiFetch('/api/office/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const json = await res.json()
    if (json.success) {
      const tno = json.data.ticketNo as string
      setSubmittedTicket(tno)
      setMessage(null)
      // Reset form
      if (formRef.current) formRef.current.reset()
      setCategory('')
      setCategoryType('')
      setPriority('P2')
      setEta('')
      // Reset to current user (creator) after successful submission
      if (currentUserId) {
        setAssignedToId(currentUserId)
      } else {
        setAssignedToId('')
      }
      setHasRef(false)
      setMode(EditorMode.Plain)
      richHtmlRef.current = ''
      setFiles(null)
      // Reset raised by fields to current user
      if (currentUserInfo) {
        setRaisedByName(currentUserInfo.name)
        setRaisedByMobile(currentUserInfo.mobile || '')
        setRaisedByEmail(currentUserInfo.email || '')
      } else {
        setRaisedByName('')
        setRaisedByMobile('')
        setRaisedByEmail('')
      }
    } else {
      setMessage(json.error || 'Failed to submit')
    }
    setLoading(false)
  }

  const categories = Object.keys(taxonomy)
  const types = category ? taxonomy[category] || [] : []

  if (submittedTicket) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">Office ticket created successfully</h2>
        <div className="text-gray-700 mb-6">Ticket number: <span className="font-semibold">{submittedTicket}</span></div>
        <button className="bg-orange-600 text-white px-4 py-2 rounded" onClick={()=>{ setSubmittedTicket(null) }}>Create another</button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">Create Office Ticket</h2>
      <form ref={formRef} onSubmit={onSubmit} className="space-y-8">
        {/* Section A: Raised By Details */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-6 border border-gray-200 dark:border-blue-700/50 shadow-sm">
          <h3 className="text-lg font-bold mb-5 text-gray-800 dark:text-blue-100 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 dark:bg-blue-400 rounded-full"></span>
            Raised By
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Raised by <span className="text-red-500 dark:text-red-400">*</span></label>
              <input 
                name="raisedByName" 
                value={raisedByName}
                onChange={(e) => setRaisedByName(e.target.value)}
                placeholder="Name" 
                required 
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-blue-400 focus:border-orange-500 dark:focus:border-blue-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Mobile Number <span className="text-red-500 dark:text-red-400">*</span></label>
              <input 
                name="mobile" 
                type="tel" 
                value={raisedByMobile}
                onChange={(e) => setRaisedByMobile(e.target.value)}
                placeholder="10-digit mobile number" 
                required 
                maxLength={10} 
                pattern="[0-9]{10}" 
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-blue-400 focus:border-orange-500 dark:focus:border-blue-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Email (optional)</label>
              <input 
                name="email" 
                type="email" 
                value={raisedByEmail}
                onChange={(e) => setRaisedByEmail(e.target.value)}
                placeholder="Email" 
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-blue-400 focus:border-orange-500 dark:focus:border-blue-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                suppressHydrationWarning
              />
            </div>
          </div>
        </div>

        {/* Section B: Classification (Taxonomy + Internal Controls) */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-6 border border-gray-200 dark:border-purple-700/50 shadow-sm">
          <h3 className="text-lg font-bold mb-5 text-gray-800 dark:text-purple-100 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 dark:bg-purple-400 rounded-full"></span>
            Classification & Internal Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Category <span className="text-red-500 dark:text-red-400">*</span></label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setCategoryType('') }} required className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-purple-400 focus:border-orange-500 dark:focus:border-purple-400 transition-all" suppressHydrationWarning>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Type <span className="text-red-500 dark:text-red-400">*</span></label>
              <select value={categoryType} onChange={(e) => setCategoryType(e.target.value)} required disabled={!category} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-purple-400 focus:border-orange-500 dark:focus:border-purple-400 transition-all disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-gray-500" suppressHydrationWarning>
                <option value="">Select Type</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Priority <span className="text-red-500 dark:text-red-400">*</span></label>
              <select 
                value={priority} 
                onChange={(e) => {
                  const newPriority = e.target.value
                  setPriority(newPriority)
                  // Auto-populate ETA based on priority (user can still edit)
                  const today = new Date()
                  let daysToAdd = 7 // Default P2
                  if (newPriority === 'P1') daysToAdd = 3
                  else if (newPriority === 'P2') daysToAdd = 7
                  else if (newPriority === 'P3') daysToAdd = 15
                  else if (newPriority === 'P4') daysToAdd = 30
                  const autoEta = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
                  const autoEtaStr = autoEta.toISOString().split('T')[0]
                  setEta(autoEtaStr)
                }} 
                required 
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-purple-400 focus:border-orange-500 dark:focus:border-purple-400 transition-all"
                suppressHydrationWarning
              >
                <option value="P1">P1 – Critical</option>
                <option value="P2">P2 – Moderate</option>
                <option value="P3">P3 – Normal</option>
                <option value="P4">P4 – Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Target Date (ETA)</label>
              <input 
                type="date" 
                value={eta} 
                onChange={(e) => setEta(e.target.value)} 
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-purple-400 focus:border-orange-500 dark:focus:border-purple-400 transition-all"
                suppressHydrationWarning
              />
              {eta && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Auto-set based on priority (P1=3 days, P2=7 days, P3=15 days, P4=30 days). You can edit this date.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Owner / Assignee</label>
              <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-purple-400 focus:border-orange-500 dark:focus:border-purple-400 transition-all" suppressHydrationWarning>
                <option value="__unassign__">Unassigned</option>
                {officeUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section C: Location Details */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-6 border border-gray-200 dark:border-green-700/50 shadow-sm">
          <h3 className="text-lg font-bold mb-5 text-gray-800 dark:text-green-100 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 dark:bg-green-400 rounded-full"></span>
            Location Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">State <span className="text-red-500 dark:text-red-400">*</span></label>
              <input name="state" placeholder="State" required defaultValue="AP" className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-green-400 focus:border-orange-500 dark:focus:border-green-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" suppressHydrationWarning />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">District <span className="text-red-500 dark:text-red-400">*</span></label>
              <input name="district" placeholder="District" required className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-green-400 focus:border-orange-500 dark:focus:border-green-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" suppressHydrationWarning />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Mandal / Block</label>
              <input name="mandal" placeholder="Mandal/Block" className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-green-400 focus:border-orange-500 dark:focus:border-green-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" suppressHydrationWarning />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Village / Ward</label>
              <input name="ward" placeholder="Village/Ward" className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-green-400 focus:border-orange-500 dark:focus:border-green-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" suppressHydrationWarning />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Pincode</label>
              <input name="pincode" placeholder="Pincode" className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-green-400 focus:border-orange-500 dark:focus:border-green-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" suppressHydrationWarning />
            </div>
          </div>
        </div>

        {/* Section D: Subject & Description */}
        <div className="bg-gradient-to-br from-orange-50/30 to-orange-100/20 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700/50 shadow-sm">
          <h3 className="text-lg font-bold mb-5 text-orange-900 dark:text-orange-100 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-600 dark:bg-orange-400 rounded-full"></span>
            Subject & Description
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Subject <span className="text-red-500 dark:text-red-400">*</span></label>
            <input name="subject" placeholder="Subject" required className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" suppressHydrationWarning />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label className="font-semibold text-gray-900 dark:text-gray-100">Description <span className="text-red-500 dark:text-red-400">*</span></label>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className={mode === EditorMode.Plain ? 'font-semibold' : ''}>Plain</span>
                <label className="inline-flex items-center gap-1">
                  <input type="checkbox" checked={mode === EditorMode.Rich} onChange={e => setMode(e.target.checked ? EditorMode.Rich : EditorMode.Plain)} className="dark:accent-orange-500" />
                  <span>Rich</span>
                </label>
              </div>
            </div>
            {mode === EditorMode.Rich ? (
              <RichEditor name="descriptionHtml" onChange={(html) => { richHtmlRef.current = html }} />
            ) : (
              <textarea name="description" placeholder="Describe the issue..." required className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg w-full h-56 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500" suppressHydrationWarning />
            )}
          </div>
        </div>

        {/* Section E: Reference (Optional) */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-xl p-6 border border-gray-200 dark:border-yellow-700/50 shadow-sm">
          <h3 className="text-lg font-bold mb-5 text-gray-800 dark:text-yellow-100 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 dark:bg-yellow-400 rounded-full"></span>
            Reference (Optional)
          </h3>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
              <input type="checkbox" checked={hasRef} onChange={(e) => setHasRef(e.target.checked)} className="dark:accent-yellow-500" /> Has reference
            </label>
            {hasRef && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Reference Name</label>
                  <input name="refName" placeholder="Reference Name" className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-yellow-400 focus:border-orange-500 dark:focus:border-yellow-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" suppressHydrationWarning />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Reference Phone</label>
                  <input name="refPhone" placeholder="Reference Phone" className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-yellow-400 focus:border-orange-500 dark:focus:border-yellow-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" suppressHydrationWarning />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Reference Location</label>
                  <input name="refLocation" placeholder="Reference Location" className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 dark:focus:ring-yellow-400 focus:border-orange-500 dark:focus:border-yellow-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" suppressHydrationWarning />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section F: Attachments */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl p-6 border border-gray-200 dark:border-indigo-700/50 shadow-sm">
          <h3 className="text-lg font-bold mb-5 text-gray-800 dark:text-indigo-100 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 dark:bg-indigo-400 rounded-full"></span>
            Attachments
          </h3>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Attachments</label>
            <input type="file" multiple className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 dark:file:bg-indigo-900/50 file:text-orange-700 dark:file:text-indigo-300 hover:file:bg-orange-100 dark:hover:file:bg-indigo-900/70 cursor-pointer" onChange={(e)=>setFiles(e.target.files)} />
          </div>
        </div>

        <div className="pt-4">
          <button disabled={loading} className="bg-orange-600 dark:bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 hover:bg-orange-700 dark:hover:bg-orange-600 transition-all transform hover:scale-[1.02] disabled:transform-none" suppressHydrationWarning>
            {loading ? 'Submitting…' : 'Create Ticket'}
          </button>
          {message && <div className="text-sm mt-2 text-red-600 dark:text-red-400">{message}</div>}
        </div>
      </form>
    </div>
  )
}

