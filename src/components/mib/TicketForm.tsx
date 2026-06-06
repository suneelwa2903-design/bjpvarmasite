"use client"

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { apiFetch } from '@/lib/api-client'

type Taxonomy = Record<string, string[]>

enum EditorMode { Plain = 'plain', Rich = 'rich' }

function RichEditor({ name, initial, onChange }: { name: string; initial?: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => { if (ref.current && initial) ref.current.innerHTML = initial }, [initial])
  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val) }
  const onInput = () => { if (ref.current) onChange(ref.current.innerHTML) }
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="flex gap-2 p-2 border-b bg-gray-50 text-sm">
        <button type="button" onClick={() => exec('bold')} className="px-3 py-1.5 hover:bg-gray-100 rounded transition-colors font-bold">B</button>
        <button type="button" onClick={() => exec('italic')} className="px-3 py-1.5 hover:bg-gray-100 rounded transition-colors italic">I</button>
        <button type="button" onClick={() => exec('underline')} className="px-3 py-1.5 hover:bg-gray-100 rounded transition-colors underline">U</button>
        <button type="button" onClick={() => exec('justifyLeft')} className="px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">⟸</button>
        <button type="button" onClick={() => exec('justifyCenter')} className="px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">━</button>
        <button type="button" onClick={() => exec('justifyRight')} className="px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">⟹</button>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="px-3 py-1.5 hover:bg-gray-100 rounded transition-colors">• List</button>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={onInput}
        className="min-h-[12rem] p-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
        suppressContentEditableWarning
      />
      <input type="hidden" name={name} />
    </div>
  )
}

export default function TicketForm() {
  const { t } = useLanguage()
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({})
  const [category, setCategory] = useState('')
  const [categoryType, setCategoryType] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [hasRef, setHasRef] = useState(false)
  const [mode, setMode] = useState<EditorMode>(EditorMode.Plain)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userMobile, setUserMobile] = useState<string | null>(null)
  // Controlled input state so autofill updates after useEffect
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [mobileInput, setMobileInput] = useState('')
  const [altMobileInput, setAltMobileInput] = useState('')
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null)
  const richHtmlRef = useRef<string>('')
  const [files, setFiles] = useState<FileList | null>(null)
  // isAuthenticated drives the attachment UI: anonymous citizens can still
  // submit a ticket, but uploads now require a `mib-session` cookie. We check
  // the actual server-side session (not just localStorage) so a stale
  // localStorage with no cookie doesn't show the file picker and then 401.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    // Add cache-busting to ensure fresh taxonomy data
    fetch(`/api/mib/taxonomy?t=${Date.now()}`, {
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
          console.warn('No taxonomy data found or empty.')
          setTaxonomy({})
        }
      })
      .catch((err) => {
        console.error('Error loading taxonomy:', err)
        setTaxonomy({})
      })
    try {
      setUserName(localStorage.getItem('mibUserName') || null)
      setUserEmail(localStorage.getItem('mibUserEmail') || null)
      setUserMobile(localStorage.getItem('mibUserMobile') || null)
      setNameInput(localStorage.getItem('mibUserName') || '')
      setEmailInput(localStorage.getItem('mibUserEmail') || '')
      setMobileInput(localStorage.getItem('mibUserMobile') || '')
    } catch {}
    // Check the real server-side session for the attachment-UI gate.
    fetch('/api/mib/me')
      .then(r => r.ok ? r.json() : { authenticated: false })
      .then(j => setIsAuthenticated(Boolean(j?.authenticated)))
      .catch(() => setIsAuthenticated(false))
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)

    const descriptionPlain = (fd.get('description') as string) || ''
    const descriptionHtml = mode === EditorMode.Rich ? (richHtmlRef.current || descriptionPlain) : descriptionPlain

    const payload: any = {
      applicantName: fd.get('applicantName') as string,
      mobile: fd.get('mobile') as string,
      email: fd.get('email') as string,
      category,
      categoryType,
      state: fd.get('state') as string,
      district: fd.get('district') as string,
      mandal: fd.get('mandal') as string,
      ward: fd.get('ward') as string,
      pincode: fd.get('pincode') as string,
      subject: fd.get('subject') as string,
      descriptionHtml,
      descriptionPlain,
      hasReference: hasRef,
      refName: fd.get('refName') as string,
      refPhone: fd.get('refPhone') as string,
      refLocation: fd.get('refLocation') as string,
    }

    // Optional attachments upload
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

    const res = await apiFetch('/api/mib/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const json = await res.json()
    if (json.success) {
      const tno = json.data.ticketNo as string
      setSubmittedTicket(tno)
      setMessage(null)
      // store simple my-tickets list
      try {
        const key = `mibMyTickets:${payload.email || payload.mobile || 'anon'}`
        const list = JSON.parse(localStorage.getItem(key) || '[]')
        list.unshift({ ticketNo: tno, createdAt: new Date().toISOString(), subject: payload.subject })
        localStorage.setItem(key, JSON.stringify(list.slice(0, 20)))
      } catch {}
      // clear form
      setCategory('')
      setCategoryType('')
      setAltMobileInput('')
      richHtmlRef.current = ''
    } else {
      setMessage(json.error || 'Failed to submit')
    }
    setLoading(false)
  }

  const categories = Object.keys(taxonomy)
  const types = category ? taxonomy[category] || [] : []

  if (submittedTicket) {
    const userKey = `mibMyTickets:${userEmail || userMobile || 'anon'}`
    const myTickets = (() => { try { return JSON.parse(localStorage.getItem(userKey) || '[]') } catch { return [] } })() as Array<{ticketNo:string; createdAt:string; subject?:string}>
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">{t('mib.submitted')}</h2>
          <div className="text-gray-700 mb-6">{t('mib.ticketNumberIs')} <span className="font-semibold">{submittedTicket}</span>.</div>
          <div className="flex items-center justify-center gap-3">
            <button className="bg-orange-600 text-white px-4 py-2 rounded" onClick={()=>{ setSubmittedTicket(null) }}>{t('mib.raiseNew')}</button>
            <button className="px-4 py-2 rounded border" onClick={()=>{ window.location.href = '/make-it-better/my-tickets' }}>{t('mib.viewOpenTickets')}</button>
          </div>
        </div>
        <div id="myTickets" className="mt-10">
          <h3 className="text-lg font-semibold mb-3">{t('mib.recentTickets')}</h3>
          {myTickets.length === 0 ? (
            <div className="text-sm text-gray-600">{t('mib.noTickets')}</div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">{t('mib.ticketNo')}</th>
                    <th className="px-4 py-2 text-left">{t('mib.subject')}</th>
                    <th className="px-4 py-2 text-left">{t('mib.created')}</th>
                  </tr>
                </thead>
                <tbody>
                  {myTickets.map((t,i)=> (
                    <tr key={t.ticketNo + i} className="border-t">
                      <td className="px-4 py-2 font-medium">{t.ticketNo}</td>
                      <td className="px-4 py-2">{t.subject || '-'}</td>
                      <td className="px-4 py-2">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">{t('mib.title')}</h2>
          {userName && (
            <div className="text-sm text-gray-700 flex items-center gap-3">
              <span>{t('mib.signedInAs')} <span className="font-semibold">{userName}</span></span>
              <span>·</span>
              <button type="button" className="underline hover:text-orange-600" onClick={() => {
                window.location.href = '/make-it-better/my-tickets'
              }}>{t('mib.viewOpen')}</button>
              <span>·</span>
              <button type="button" className="underline hover:text-orange-600" onClick={async () => {
                try { await fetch('/api/mib/auth/logout', { method: 'POST' }) } catch {}
                try { localStorage.removeItem('mibUserName'); localStorage.removeItem('mibUserEmail'); localStorage.removeItem('mibUserMobile') } catch {}
                location.reload()
              }}>{t('mib.signOut')}</button>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Section A: Applicant Details */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-5 text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
              Applicant Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('mib.fullName')} <span className="text-red-500">*</span></label>
                <input 
                  name="applicantName" 
                  placeholder={t('mib.fullName')} 
                  required 
                  value={nameInput} 
                  onChange={(e)=>setNameInput(e.target.value)} 
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('mib.mobile')} <span className="text-red-500">*</span></label>
                <input 
                  name="mobile" 
                  placeholder={t('mib.mobile')} 
                  required 
                  value={mobileInput} 
                  onChange={(e)=>setMobileInput(e.target.value)} 
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('mib.emailOptional')}</label>
                <input 
                  name="email" 
                  placeholder={t('mib.emailOptional')} 
                  value={emailInput} 
                  onChange={(e)=>setEmailInput(e.target.value)} 
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('mib.altMobileOptional')}</label>
                <input 
                  name="altMobile" 
                  placeholder={t('mib.altMobileOptional')} 
                  value={altMobileInput} 
                  onChange={(e)=>setAltMobileInput(e.target.value)} 
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Section B: Classification */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-5 text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
              Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('mib.selectCategory')} <span className="text-red-500">*</span></label>
                <select 
                  value={category} 
                  onChange={(e) => { setCategory(e.target.value); setCategoryType('') }} 
                  required 
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                >
                  <option value="">{t('mib.selectCategory')}</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('mib.selectType')} <span className="text-red-500">*</span></label>
                <select 
                  value={categoryType} 
                  onChange={(e) => setCategoryType(e.target.value)} 
                  required 
                  disabled={!category}
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{t('mib.selectType')}</option>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section C: Location Details */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-5 text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
              Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('mib.state')} <span className="text-red-500">*</span></label>
                <input 
                  name="state" 
                  placeholder={t('mib.state')} 
                  required 
                  defaultValue="AP" 
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('mib.district')} <span className="text-red-500">*</span></label>
                <input 
                  name="district" 
                  placeholder={t('mib.district')} 
                  required 
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('mib.mandal')}</label>
                <input 
                  name="mandal" 
                  placeholder={t('mib.mandal')} 
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t('mib.ward')}</label>
                <input 
                  name="ward" 
                  placeholder={t('mib.ward')} 
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('mib.pincode')}</label>
                <input 
                  name="pincode" 
                  placeholder={t('mib.pincode')} 
                  className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Section D: Subject & Description */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-5 text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
              Subject & Description
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t('mib.subject')} <span className="text-red-500">*</span></label>
              <input 
                name="subject" 
                placeholder={t('mib.subject')} 
                required 
                className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label className="font-medium">{t('mib.description')} <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2">
                  <span className={mode === EditorMode.Plain ? 'font-semibold' : ''}>{t('mib.plain')}</span>
                  <label className="inline-flex items-center gap-1">
                    <input type="checkbox" checked={mode === EditorMode.Rich} onChange={e => setMode(e.target.checked ? EditorMode.Rich : EditorMode.Plain)} />
                    <span>{t('mib.rich')}</span>
                  </label>
                </div>
              </div>
              {mode === EditorMode.Rich ? (
                <RichEditor name="descriptionHtml" onChange={(html) => { richHtmlRef.current = html }} />
              ) : (
                <textarea 
                  name="description" 
                  placeholder={t('mib.describePlaceholder')} 
                  required 
                  className="border border-gray-300 p-4 rounded-lg w-full h-56 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none" 
                />
              )}
            </div>
          </div>

          {/* Section E: Reference (Optional) */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-5 text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
              Reference (Optional)
            </h3>
            <div>
              <label className="flex items-center gap-2 text-sm mb-4">
                <input type="checkbox" checked={hasRef} onChange={(e) => setHasRef(e.target.checked)} /> {t('mib.hasReference')}
              </label>
              {hasRef && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('mib.refName')}</label>
                    <input 
                      name="refName" 
                      placeholder={t('mib.refName')} 
                      className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('mib.refPhone')}</label>
                    <input 
                      name="refPhone" 
                      placeholder={t('mib.refPhone')} 
                      className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('mib.refLocation')}</label>
                    <input 
                      name="refLocation" 
                      placeholder={t('mib.refLocation')} 
                      className="border border-gray-300 p-3 rounded-lg w-full bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section F: Attachments */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-5 text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
              Attachments
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1">{t('mib.attachments')}</label>
              {isAuthenticated ? (
                <input type="file" multiple className="block w-full text-sm" onChange={(e)=>setFiles(e.target.files)} />
              ) : (
                <div className="text-sm border border-dashed border-gray-300 rounded-lg p-4 bg-white">
                  <p className="text-gray-700">
                    <a href="/make-it-better" className="font-semibold text-orange-700 underline hover:text-orange-800">Log in</a>
                    {' '}to attach evidence files (images, PDFs, documents).
                  </p>
                  <p className="text-gray-500 mt-1 text-xs">
                    You can still file this grievance without attachments — just submit below.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button 
              disabled={loading} 
              className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-[1.02] disabled:transform-none"
            >
              {loading ? 'Submitting…' : t('mib.submit')}
            </button>
            {message && <div className="text-sm mt-2 text-red-600">{message}</div>}
          </div>
        </form>
      </div>

      <div id="ticketsPreview" className="mt-10">
        {/* simple preview section of stored tickets if any */}
                {(() => { try { return JSON.parse(localStorage.getItem(`mibMyTickets:${userEmail || userMobile || 'anon'}`) || '[]') } catch { return [] } })().length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm font-semibold mb-2">Your recent tickets</div>
            <ul className="text-sm list-disc pl-5">
              {(() => { try { return JSON.parse(localStorage.getItem(`mibMyTickets:${userEmail || userMobile || 'anon'}`) || '[]') } catch { return [] } })().slice(0,5).map((t:any, i:number)=> (
                <li key={i}>{t.ticketNo} · {new Date(t.createdAt).toLocaleString()} · {t.subject || '-'}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
