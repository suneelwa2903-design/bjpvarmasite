'use client'

import { useLanguage } from '@/components/i18n/LanguageProvider'
import React, { useEffect, useRef } from 'react'
import { sanitizeEmbedCode } from '@/lib/security/sanitize'

interface SociableKitEmbed {
  id: string
  platform: 'instagram' | 'twitter' | 'youtube'
  embedCode: string
  height?: string
}

interface SociableKitEmbedsProps {
  embeds?: SociableKitEmbed[]
}

const PLATFORM_ICONS: Record<string, React.ReactElement> = {
  instagram: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
}

const PLATFORM_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
}

const PLATFORM_COLOR: Record<string, string> = {
  instagram: 'text-pink-500 dark:text-pink-400',
  twitter: 'text-gray-700 dark:text-gray-300',
  youtube: 'text-red-600 dark:text-red-400',
}

const SociableKitEmbeds = ({ embeds }: SociableKitEmbedsProps) => {
  const { t } = useLanguage()
  const scriptLoadedRef = useRef<{ [key: string]: boolean }>({})

  const defaultEmbeds: SociableKitEmbed[] = [
    {
      id: 'instagram',
      platform: 'instagram',
      height: '600px',
      embedCode:
        process.env.NEXT_PUBLIC_SOCIABLEKIT_INSTAGRAM_EMBED ||
        "<div class='sk-instagram-feed' data-embed-id='25621679'></div>",
    },
    {
      id: 'twitter',
      platform: 'twitter',
      height: '600px',
      embedCode:
        process.env.NEXT_PUBLIC_SOCIABLEKIT_TWITTER_EMBED ||
        "<iframe src='https://widgets.sociablekit.com/twitter-feed/iframe/25621680' frameborder='0' width='100%' height='600'></iframe>",
    },
    {
      id: 'youtube',
      platform: 'youtube',
      height: '600px',
      embedCode:
        process.env.NEXT_PUBLIC_SOCIABLEKIT_YOUTUBE_EMBED ||
        "<iframe src='https://widgets.sociablekit.com/youtube-channel-videos/iframe/25621691' frameborder='0' width='100%' height='600'></iframe>",
    },
  ]

  const activeEmbeds = embeds || defaultEmbeds

  useEffect(() => {
    activeEmbeds.forEach((embed) => {
      const isScriptEmbed =
        embed.embedCode.includes('data-embed-id') ||
        embed.embedCode.includes('widget.js')

      if (isScriptEmbed && !scriptLoadedRef.current[embed.id]) {
        const scriptMatch = embed.embedCode.match(/src=['"]([^'"]+widget\.js[^'"]*)['"]/)
        if (scriptMatch && scriptMatch[1]) {
          const scriptSrc = scriptMatch[1]
          if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
            const script = document.createElement('script')
            script.src = scriptSrc
            script.defer = true
            document.body.appendChild(script)
            scriptLoadedRef.current[embed.id] = true
          }
        } else if (embed.platform === 'instagram') {
          const scriptSrc = 'https://widgets.sociablekit.com/instagram-feed/widget.js'
          if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
            const script = document.createElement('script')
            script.src = scriptSrc
            script.defer = true
            document.body.appendChild(script)
            scriptLoadedRef.current[embed.id] = true
          }
        }
      }
    })
  }, [activeEmbeds])

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {t('home.follow')}
          </h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            {t('home.follow.sub')}
          </p>
        </div>

        {/* Embeds grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {activeEmbeds.map((embed) => (
            <div key={embed.id} className="flex flex-col">
              {/* Subtle platform label */}
              <div className={`flex items-center gap-2 mb-3 px-1 ${PLATFORM_COLOR[embed.platform]}`}>
                {PLATFORM_ICONS[embed.platform]}
                <span className="text-sm font-medium">{PLATFORM_LABEL[embed.platform]}</span>
              </div>
              {/* Borderless embed */}
              <div
                className="flex-1 overflow-hidden rounded-xl bg-white/60 dark:bg-gray-800/30"
                style={{ minHeight: embed.height || '600px' }}
              >
                <div
                  className="sociablekit-embed-wrapper w-full h-full"
                  style={{ height: embed.height || '600px' }}
                >
                  {embed.embedCode.includes('data-embed-id') ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: sanitizeEmbedCode(embed.embedCode.replace(/<script[^>]*>.*?<\/script>/gi, '')),
                      }}
                      style={{ height: '100%', width: '100%' }}
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{ __html: sanitizeEmbedCode(embed.embedCode) }}
                      style={{ height: '100%', width: '100%' }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SociableKitEmbeds
