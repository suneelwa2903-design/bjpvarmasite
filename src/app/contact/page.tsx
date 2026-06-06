'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram, Youtube, MessageCircle, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/components/i18n/LanguageProvider'

export default function Contact() {
  const { t } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const form = e.currentTarget
    const data = {
      category: (form.elements.namedItem('category') as HTMLSelectElement)?.value,
      name: (form.elements.namedItem('name') as HTMLInputElement)?.value,
      email: (form.elements.namedItem('email') as HTMLInputElement)?.value,
      subject: (form.elements.namedItem('subject') as HTMLInputElement)?.value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement)?.value,
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
        form.reset()
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">{t('contact.title')}</h1>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Top: Contact Info + Social */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('contact.ministry')}</h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                  <p>
                    Ministry of Steel and Heavy Industries, North Block, New Delhi - 110001, India
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-orange-600 mt-0.5" />
                  <p>
                    011-23092462, 011-23094686
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-orange-600 mt-0.5" />
                  <p>
                    office@bjpvarma.co.in
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('contact.follow')}</h3>
              <div className="flex flex-wrap gap-3">
                <a href="https://x.com/BJPVarma" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#1DA1F2] hover:brightness-90 transition">
                  <Twitter className="h-4 w-4" /> X (Twitter)
                </a>
                <a href="https://facebook.com/BJPVarma" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#1877F2] hover:brightness-90 transition">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
                <a href="https://instagram.com/BJPVarma" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#E4405F] hover:brightness-90 transition">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
                <a href="https://youtube.com/@BJPVarma" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#FF0000] hover:brightness-90 transition">
                  <Youtube className="h-4 w-4" /> YouTube
                </a>
                <a href="https://wa.me/919014509403" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#25D366] hover:brightness-90 transition">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Write to Us */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('contact.write')}</h2>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <CheckCircle className="h-14 w-14 text-green-500" />
                <p className="text-lg font-semibold text-gray-800">Message Received!</p>
                <p className="text-sm text-gray-500">Thank you for reaching out. Our team will get back to you shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 border border-orange-500 text-orange-600 rounded-lg text-sm font-semibold hover:bg-orange-50 transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.category')}</label>
                  <select name="category" suppressHydrationWarning className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>{t('contact.category.general')}</option>
                    <option>{t('contact.category.feedback')}</option>
                    <option>{t('contact.category.concern')}</option>
                    <option>{t('contact.category.thanks')}</option>
                    <option>{t('contact.category.support')}</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.name')}</label>
                    <input name="name" required suppressHydrationWarning className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')}</label>
                    <input name="email" type="email" required suppressHydrationWarning className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.subject')}</label>
                  <input name="subject" required suppressHydrationWarning className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.message')}</label>
                  <textarea name="message" rows={4} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  suppressHydrationWarning
                  className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white py-2.5 rounded-lg font-semibold shadow hover:from-orange-700 hover:via-amber-700 hover:to-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {submitting ? 'Sending…' : t('contact.submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

