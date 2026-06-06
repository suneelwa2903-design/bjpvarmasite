'use client'

import { Twitter, Facebook, Instagram, Youtube, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import ClientOnly from './ClientOnly'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { useState } from 'react'

const Footer = () => {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  if (pathname?.startsWith('/admin')) return null

  const quickLinks = [
    { name: t('footer.quick.home'), href: '/' },
    { name: t('footer.quick.about'), href: '/biography' },
    { name: t('footer.quick.gallery'), href: '/gallery' },
    { name: t('footer.quick.press'), href: '/press-release' },
    { name: t('footer.quick.impact'), href: '/initiatives' },
    { name: 'Download Profile', href: '/profile' },
    { name: 'Reports', href: '/#reports' },
    { name: t('footer.quick.contact'), href: '/contact' },
  ]

  const socialLinks = [
    { name: 'Twitter', href: 'https://x.com/BJPVarma', icon: Twitter },
    { name: 'Facebook', href: 'https://facebook.com/BJPVarma', icon: Facebook },
    { name: 'Instagram', href: 'https://instagram.com/BJPVarma', icon: Instagram },
    { name: 'YouTube', href: 'https://youtube.com/@BJPVarma', icon: Youtube },
  ]

  const donationLinks = [
    { name: 'PM Cares', href: 'https://pmcares.gov.in/en/', target: '_blank' },
    { name: 'Bharat Ke Veer', href: 'https://bharatkeveer.gov.in/', target: '_blank' },
    { name: 'BJP', href: 'https://www.bjp.org/home', target: '_blank' },
  ]

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
    // Reset after 4s
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand + Get Updates */}
          <div>
            <h3 className="text-2xl font-bold mb-4">BJP Varma</h3>
            <p className="text-gray-300 mb-6">{t('footer.brand.tagline')}</p>
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">{t('footer.getUpdates')}</h4>
              <p className="text-gray-300 mb-3 text-sm">{t('footer.subscribe')}</p>
              <ClientOnly
                fallback={
                  <div className="flex">
                    <div className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-l-md text-sm text-gray-400">
                      {t('footer.email.placeholder')}
                    </div>
                    <div className="px-4 py-2 bg-orange-600 text-white rounded-r-md">
                      <Mail className="h-4 w-4" />
                    </div>
                  </div>
                }
              >
                {status === 'success' ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm py-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Subscribed! Thank you.</span>
                  </div>
                ) : status === 'error' ? (
                  <div className="flex items-center gap-2 text-red-400 text-sm py-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Something went wrong. Try again.</span>
                  </div>
                ) : (
                  <div className="flex">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                      placeholder={t('footer.email.placeholder')}
                      className="flex-1 px-3 py-2 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleSubscribe}
                      disabled={status === 'loading'}
                      className="px-4 py-2 bg-orange-600 text-white rounded-r-md hover:bg-orange-500 transition-colors duration-200 disabled:opacity-60"
                      aria-label="Subscribe"
                    >
                      {status === 'loading' ? (
                        <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </ClientOnly>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quick')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.donate')}</h4>
            <ul className="space-y-2">
              {donationLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target={link.target || '_self'}
                    rel={link.target ? 'noopener noreferrer' : undefined}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit Us — Map */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Visit Us</h4>
            <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d956.134822965501!2d81.5341477096081!3d16.549340505414477!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37d3003112f8cf%3A0x1eec40af0279fb77!2sBJP%20PARTY%20OFFICE%2Cnarasayyaagraharam!5e0!3m2!1sen!2sin!4v1766800597145!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="BJP Party Office Location"
              />
            </div>
          </div>
        </div>

        {/* Legal links row */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-400">
            <li><Link href="/privacy-policy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
            <li aria-hidden className="text-gray-600">·</li>
            <li><Link href="/terms-of-use" className="hover:text-white transition-colors duration-200">Terms of Use</Link></li>
            <li aria-hidden className="text-gray-600">·</li>
            <li><Link href="/disclaimer" className="hover:text-white transition-colors duration-200">Disclaimer</Link></li>
            <li aria-hidden className="text-gray-600">·</li>
            <li><Link href="/cookie-policy" className="hover:text-white transition-colors duration-200">Cookie Policy</Link></li>
            <li aria-hidden className="text-gray-600">·</li>
            <li><Link href="/accessibility-statement" className="hover:text-white transition-colors duration-200">Accessibility</Link></li>
          </ul>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-300 text-sm">
              Copyright © {new Date().getFullYear()}. {t('footer.copyright')}
            </p>
            <Link
              href="/profile"
              target="_blank"
              className="text-gray-400 hover:text-orange-400 text-xs transition-colors"
            >
              ↓ Download Official Profile
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
