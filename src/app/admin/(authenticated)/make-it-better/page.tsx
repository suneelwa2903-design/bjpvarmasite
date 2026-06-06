'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Image as ImageIcon, FileText, Settings } from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

type Taxonomy = Record<string, string[]>
type TaxonomyWithHidden = Taxonomy & { _hidden?: { categories?: string[]; subcategories?: Record<string, string[]> } }

function TaxonomyEditor({ scope }: { scope: 'public' | 'office' }) {
  const [data, setData] = useState<TaxonomyWithHidden>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cat, setCat] = useState('')
  const [sub, setSub] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      // Add cache-busting and includeHidden to show all items in admin panel
      const res = await apiFetch(`/api/mib/settings/taxonomy?scope=${scope}&includeHidden=true&t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.error || 'Failed')
      setData(j.data || {})
    } catch (e:any) { setError(e.message) } finally { setLoading(false) }
  }, [scope])

  useEffect(() => { load() }, [load])

  const save = async (next: TaxonomyWithHidden) => {
    setLoading(true); setError(null)
    try {
      console.log(`[TaxonomyEditor] Saving taxonomy for scope: ${scope}`, next)
      const res = await apiFetch(`/api/mib/settings/taxonomy?scope=${scope}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(next) })
      const j = await res.json()
      console.log(`[TaxonomyEditor] Save response:`, j)
      if (!j.success) throw new Error(j.error || 'Failed')
      setData(j.data)
    } catch (e:any) { 
      console.error(`[TaxonomyEditor] Save error:`, e)
      setError(e.message) 
    } finally { setLoading(false) }
  }

  const getVisibleCategories = () => {
    const hidden = data._hidden?.categories || []
    return Object.keys(data).filter(k => k !== '_hidden' && !hidden.includes(k))
  }

  // Coerce defensively. If a corrupted MibSetting row has a non-array value
  // under any key (e.g. someone PUTs `{taxonomy: {}}` in a smoke test and the
  // server stores it verbatim), this prevents the whole admin page from
  // crashing with `.filter is not a function`. Treats the bad value as empty.
  const safeList = (v: unknown): string[] => Array.isArray(v) ? (v as string[]) : []

  const getVisibleSubcategories = (category: string) => {
    const hidden = data._hidden?.subcategories?.[category] || []
    return safeList(data[category]).filter(s => !hidden.includes(s))
  }

  const addCategory = async () => {
    const name = cat.trim(); if (!name) return
    if (data[name]) {
      alert('Category already exists')
      return
    }
    console.log(`[TaxonomyEditor] Adding category: ${name}`)
    await save({ ...data, [name]: [] } as TaxonomyWithHidden)
    setCat('')
  }
  const addSub = async (category: string) => {
    const name = sub.trim(); if (!name) return
    // Check if subcategory already exists
    if (safeList(data[category]).includes(name)) {
      alert('Subcategory already exists')
      return
    }
    console.log(`[TaxonomyEditor] Adding subcategory "${name}" to category "${category}"`)
    const list = Array.from(new Set([...safeList(data[category]), name]))
    // Remove from hidden if it was hidden
    const hidden = { ...(data._hidden?.subcategories || {}) }
    if (hidden[category]) {
      hidden[category] = hidden[category].filter(s => s !== name)
    }
    await save({ 
      ...data, 
      [category]: list,
      _hidden: { ...data._hidden, subcategories: hidden }
    } as TaxonomyWithHidden)
    setSub('')
  }
  const hideCategory = async (category: string) => {
    console.log(`[TaxonomyEditor] Hiding category "${category}" and all its subcategories`)
    const hidden = { ...(data._hidden || {}) }
    hidden.categories = [...(hidden.categories || []), category]
    // When hiding a category, automatically hide all its subcategories
    hidden.subcategories = { ...(hidden.subcategories || {}) }
    const subcategories = safeList(data[category])
    if (subcategories.length > 0) {
      hidden.subcategories[category] = [...(hidden.subcategories[category] || []), ...subcategories]
      // Remove duplicates
      hidden.subcategories[category] = Array.from(new Set(hidden.subcategories[category]))
    }
    console.log(`[TaxonomyEditor] Updated hidden structure:`, hidden)
    await save({ ...data, _hidden: hidden } as TaxonomyWithHidden)
  }
  const unhideCategory = async (category: string) => {
    console.log(`[TaxonomyEditor] Unhiding category "${category}"`)
    const hidden = { ...(data._hidden || {}) }
    hidden.categories = (hidden.categories || []).filter(c => c !== category)
    // When unhiding a category, we keep subcategories hidden (admin can unhide them individually if needed)
    // Or optionally, we could unhide all subcategories too - but keeping them hidden gives more control
    await save({ ...data, _hidden: hidden } as TaxonomyWithHidden)
  }
  const hideSub = async (category: string, item: string) => {
    console.log(`[TaxonomyEditor] Hiding subcategory "${item}" from category "${category}"`)
    const hidden = { ...(data._hidden || {}) }
    hidden.subcategories = { ...(hidden.subcategories || {}) }
    // Ensure we don't add duplicates
    const existingHidden = hidden.subcategories[category] || []
    if (!existingHidden.includes(item)) {
      hidden.subcategories[category] = [...existingHidden, item]
    }
    console.log(`[TaxonomyEditor] Updated hidden subcategories:`, hidden.subcategories)
    await save({ ...data, _hidden: hidden } as TaxonomyWithHidden)
  }
  const unhideSub = async (category: string, item: string) => {
    console.log(`[TaxonomyEditor] Unhiding subcategory "${item}" from category "${category}"`)
    const hidden = { ...(data._hidden || {}) }
    hidden.subcategories = { ...(hidden.subcategories || {}) }
    hidden.subcategories[category] = (hidden.subcategories[category] || []).filter(s => s !== item)
    // Clean up empty arrays
    if (hidden.subcategories[category] && hidden.subcategories[category].length === 0) {
      delete hidden.subcategories[category]
    }
    console.log(`[TaxonomyEditor] Updated hidden subcategories:`, hidden.subcategories)
    await save({ ...data, _hidden: hidden } as TaxonomyWithHidden)
  }

  const visibleCategories = getVisibleCategories()
  const hiddenCategories = data._hidden?.categories || []

  return (
    <div className="space-y-6">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 shadow-sm">{error}</div>}
      
      {/* Add Category Section */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200 shadow-md">
        <div className="flex gap-2">
          <input 
            value={cat} 
            onChange={e=>setCat(e.target.value)} 
            placeholder="New category name" 
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            suppressHydrationWarning 
          />
          <button 
            onClick={addCategory} 
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors" 
            suppressHydrationWarning
          >
            Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading taxonomy data…</div>
      ) : (
        <>
          {/* Visible Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleCategories.map((category) => {
              const visibleSubs = getVisibleSubcategories(category)
              const hiddenSubs = data._hidden?.subcategories?.[category] || []
              return (
                <div key={category} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                    <div className="font-bold text-lg text-gray-800">{category}</div>
                    <button 
                      onClick={()=>hideCategory(category)} 
                      className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-medium hover:bg-yellow-200 transition-colors shadow-sm"
                    >
                      Hide
                    </button>
                  </div>
                  <ul className="text-sm mb-4 space-y-1">
                    {visibleSubs.map(s => (
                      <li key={s} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50">
                        <span className="text-gray-700">{s}</span>
                        <button 
                          onClick={()=>hideSub(category, s)} 
                          className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-medium hover:bg-yellow-200 transition-colors"
                        >
                          Hide
                        </button>
                      </li>
                    ))}
                    {visibleSubs.length === 0 && hiddenSubs.length === 0 && <li className="text-gray-400 italic py-2">No subcategories</li>}
                    {/* Hidden Subcategories for this category */}
                    {hiddenSubs.length > 0 && (
                      <li className="pt-2 mt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500 mb-1 font-medium">Hidden Subcategories:</div>
                        <div className="flex flex-wrap gap-1">
                          {hiddenSubs.map(s => (
                            <div key={s} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs">
                              <span className="text-gray-600 line-through">{s}</span>
                              <button 
                                onClick={()=>unhideSub(category, s)} 
                                className="px-1 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium"
                              >
                                Unhide
                              </button>
                            </div>
                          ))}
                        </div>
                      </li>
                    )}
                  </ul>
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <input 
                      value={sub} 
                      onChange={e=>setSub(e.target.value)} 
                      placeholder="Add subcategory" 
                      className="border border-gray-300 rounded-lg px-3 py-2 flex-1 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                    <button 
                      onClick={()=>addSub(category)} 
                      className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hidden Categories Section */}
          {hiddenCategories.length > 0 && (
            <div className="mt-8 bg-gray-50 rounded-xl p-5 border border-gray-300">
              <h3 className="font-semibold text-gray-700 mb-3">Hidden Categories</h3>
              <div className="flex flex-wrap gap-2">
                {hiddenCategories.map(category => (
                  <div key={category} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
                    <span className="text-sm text-gray-600">{category}</span>
                    <button 
                      onClick={()=>unhideCategory(category)} 
                      className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors"
                    >
                      Unhide
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function UsersManager() {
  const [officeUsers, setOfficeUsers] = useState<any[]>([])
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([])
  const [loadingOffice, setLoadingOffice] = useState(true)
  const [loadingRegistered, setLoadingRegistered] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registeredError, setRegisteredError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', mobile: '', role: 'OFFICE_AGENT', active: true })
  const [editingId, setEditingId] = useState<string | null>(null)

  const loadOfficeUsers = async () => {
    setLoadingOffice(true); setError(null)
    try {
      const res = await apiFetch('/api/office/admin/users')
      const j = await res.json()
      if (!j.success) throw new Error(j.error || 'Failed')
      setOfficeUsers(j.data)
    } catch (e:any) { setError(e.message) } finally { setLoadingOffice(false) }
  }

  const loadRegisteredUsers = async () => {
    setLoadingRegistered(true); setRegisteredError(null)
    try {
      const res = await apiFetch('/api/mib/admin/users')
      const j = await res.json()
      if (!j.success) throw new Error(j.error || 'Failed')
      setRegisteredUsers(j.data)
    } catch (e:any) { setRegisteredError(e.message) } finally { setLoadingRegistered(false) }
  }

  useEffect(() => {
    loadOfficeUsers()
    loadRegisteredUsers()
  }, [])

  const resetForm = () => {
    setForm({ name: '', email: '', mobile: '', role: 'OFFICE_AGENT', active: true })
    setEditingId(null)
  }

  const save = async () => {
    try {
      if (editingId) {
        const res = await apiFetch('/api/office/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: form.name,
            email: form.email,
            mobile: form.mobile,
            role: form.role,
            active: form.active,
          }),
        })
        const j = await res.json(); if (!j.success) throw new Error(j.error || 'Failed')
      } else {
        const res = await apiFetch('/api/office/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const j = await res.json(); if (!j.success) throw new Error(j.error || 'Failed')
      }
      resetForm()
      loadOfficeUsers()
      loadRegisteredUsers()
    } catch (e:any) { setError(e.message) }
  }

  const handleEdit = (user: any) => {
    setForm({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      role: user.role || 'OFFICE_AGENT',
      active: user.active ?? true,
    })
    setEditingId(user.id)
  }

  const handleDelete = async (user: any) => {
    if (!window.confirm(`Remove ${user.email}?`)) return
    try {
      const res = await apiFetch(`/api/office/admin/users?id=${user.id}`, { method: 'DELETE' })
      const j = await res.json(); if (!j.success) throw new Error(j.error || 'Failed')
      if (editingId === user.id) resetForm()
      loadOfficeUsers()
      loadRegisteredUsers()
    } catch (e:any) {
      setError(e.message)
    }
  }

  const toggleActive = async (u:any) => {
    try {
      const res = await apiFetch('/api/office/admin/users', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: u.id, active: !u.active }) })
      const j = await res.json(); if (!j.success) throw new Error(j.error||'Failed')
      loadOfficeUsers()
    } catch (e:any) { setError(e.message) }
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 shadow-sm">{error}</div>}

      {/* Registered Citizens Card */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">Registered Citizens</div>
        {registeredError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{registeredError}</div>}
        {loadingRegistered ? (
          <div className="text-center py-8 text-gray-500">Loading registered users…</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Mobile</th>
                  <th className="px-3 py-2 text-left">Role</th>
                  <th className="px-3 py-2 text-left">Verified</th>
                  <th className="px-3 py-2 text-left">Registered</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.map(u => (
                  <tr key={u.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.name || '-'}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.mobile || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 font-medium">{u.role || 'CITIZEN'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${u.emailVerifiedAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {u.emailVerifiedAt ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setForm({
                              name: u.name || '',
                              email: u.email || '',
                              mobile: u.mobile || '',
                              role: u.role || 'CITIZEN',
                              active: u.active ?? true,
                            })
                            setEditingId(u.id)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors shadow-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Delete ${u.email}?`)) return
                            try {
                              const res = await apiFetch(`/api/mib/admin/users?id=${u.id}`, { method: 'DELETE' })
                              const j = await res.json(); if (!j.success) throw new Error(j.error || 'Failed')
                              loadRegisteredUsers()
                            } catch (e:any) {
                              setRegisteredError(e.message)
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {registeredUsers.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">No registered users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Office User Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
        <div className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-green-300">{editingId ? 'Update Office User' : 'Add Office User'}</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input 
            value={form.name} 
            onChange={e=>setForm({...form, name:e.target.value})} 
            placeholder="Name" 
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            suppressHydrationWarning 
          />
          <input 
            value={form.email} 
            onChange={e=>setForm({...form, email:e.target.value})} 
            placeholder="Email" 
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed" 
            suppressHydrationWarning 
            disabled={!!editingId} 
          />
          <input 
            value={form.mobile} 
            onChange={e=>setForm({...form, mobile:e.target.value})} 
            placeholder="Mobile" 
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            suppressHydrationWarning 
          />
          <select 
            value={form.role} 
            onChange={e=>setForm({...form, role:e.target.value})} 
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            suppressHydrationWarning
          >
            <option value="OFFICE_ADMIN">Office Admin</option>
            <option value="OFFICE_AGENT">Office Agent</option>
            <option value="OFFICE_VIEWER">Viewer</option>
          </select>
        </div>
        <label className="mb-4 inline-flex items-center gap-2 text-sm text-gray-700 font-medium">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <span>Active</span>
        </label>
        <div className="flex gap-3">
          <button 
            onClick={save} 
            className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-md" 
            suppressHydrationWarning
          >
            {editingId ? 'Save Changes' : 'Add User'}
          </button>
          {editingId && (
            <button 
              onClick={resetForm} 
              className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors shadow-sm" 
              suppressHydrationWarning
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Office Users Card */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg overflow-x-auto">
        <div className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">Office Users</div>
        {loadingOffice ? (
          <div className="text-center py-8 text-gray-500">Loading office users…</div>
        ) : (
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Mobile</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Active</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {officeUsers.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name || '-'}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.mobile || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 font-medium">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={()=>toggleActive(u)} 
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shadow-sm ${
                        u.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {u.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(u.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={()=>handleEdit(u)} 
                        className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={()=>handleDelete(u)} 
                        className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {officeUsers.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">No office users yet.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MakeItBetterSettingsPage() {
  const [tab, setTab] = useState<'public'|'office'|'users'>('public')
  const [loading, setLoading] = useState(false)
  const [embedded, setEmbedded] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('embedded') === 'true') setEmbedded(true)
  }, [])

  const handleLogout = async () => {
    try {
      await apiFetch('/api/admin/auth', { 
        method: 'DELETE',
        credentials: 'include'
      })
      window.location.href = '/admin'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/admin'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* Header & Nav - hidden when embedded in dashboard iframe */}
      {!embedded && (
        <>
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <a href="/admin/dashboard" className="text-sm text-orange-600 hover:text-orange-700 font-medium">← Back to Dashboard</a>
                  <h1 className="text-2xl font-bold text-gray-900">Make It Better</h1>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  suppressHydrationWarning
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${embedded ? 'py-4' : 'py-8'}`}>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Make it Better</h2>
            <p className="text-gray-600 mb-8">Manage schemas and office access</p>
            
            {/* Beautified Tab Buttons */}
            <div className="flex gap-3 mb-8 border-b border-gray-200 pb-2">
              <button 
                onClick={()=>setTab('public')} 
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                  tab==='public'
                    ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-lg border-b-2 border-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm'
                }`} 
                suppressHydrationWarning
              >
                Public Form Settings
              </button>
              <button 
                onClick={()=>setTab('office')} 
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                  tab==='office'
                    ? 'bg-gradient-to-b from-purple-600 to-purple-700 text-white shadow-lg border-b-2 border-purple-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm'
                }`} 
                suppressHydrationWarning
              >
                Office Form Settings
              </button>
              <button 
                onClick={()=>setTab('users')} 
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                  tab==='users'
                    ? 'bg-gradient-to-b from-green-600 to-green-700 text-white shadow-lg border-b-2 border-green-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm'
                }`} 
                suppressHydrationWarning
              >
                Office Access
              </button>
            </div>
            
            {/* Tab Content with Card Styling */}
            <div className={`rounded-xl p-6 border-2 shadow-md ${
              tab === 'public' ? 'bg-gradient-to-br from-blue-50 to-blue-100/30 border-blue-300' :
              tab === 'office' ? 'bg-gradient-to-br from-purple-50 to-purple-100/30 border-purple-300' :
              'bg-gradient-to-br from-green-50 to-green-100/30 border-green-300'
            }`}>
              {tab === 'public' && <TaxonomyEditor scope="public" />}
              {tab === 'office' && <TaxonomyEditor scope="office" />}
              {tab === 'users' && <UsersManager />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


