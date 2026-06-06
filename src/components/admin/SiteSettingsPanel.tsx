'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

interface SiteSettings {
  quotesTicker: boolean
  voicesOfSupport: boolean
  yearlyReports: boolean
  foundation: boolean
}

const SETTING_META: { key: keyof SiteSettings; label: string; description: string }[] = [
  {
    key: 'quotesTicker',
    label: 'Quotes Ticker',
    description: 'The scrolling inspirational quotes bar shown at the top of every page.',
  },
  {
    key: 'voicesOfSupport',
    label: 'Voices of Support',
    description: 'The testimonials/endorsements carousel shown on the homepage.',
  },
  {
    key: 'yearlyReports',
    label: 'Yearly Reports',
    description: 'The "Report to the People" annual report cards section on the homepage.',
  },
  {
    key: 'foundation',
    label: 'Foundation / CSR',
    description: 'The Foundation & CSR section on the homepage. (Shown only when toggled ON and entries exist.)',
  },
]

export default function SiteSettingsPanel({ data }: { data: any }) {
  const defaults: SiteSettings = {
    quotesTicker: true,
    voicesOfSupport: true,
    yearlyReports: true,
    foundation: false,
  }
  const [settings, setSettings] = useState<SiteSettings>({
    ...defaults,
    ...(data?.siteSettings || {}),
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const res = await apiFetch('/api/admin/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'siteSettings', data: settings }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Site Section Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
        {SETTING_META.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between p-5">
            <div className="flex-1 mr-6">
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
            <button
              onClick={() => setSettings((prev) => ({ ...prev, [key]: !prev[key] }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                settings[key] ? 'bg-orange-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={settings[key]}
              aria-label={label}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ${
                  settings[key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Changes take effect immediately after saving. The site will read the updated settings on the next page load.
      </p>
    </div>
  )
}
