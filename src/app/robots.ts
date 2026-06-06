import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bjpvarma.co.in'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/office/', '/api/', '/make-it-better/my-tickets'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
