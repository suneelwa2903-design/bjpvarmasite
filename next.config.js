/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    // Configure image qualities for Next.js 15/16 compatibility
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    qualities: [75, 90, 100], // Required for Next.js 16 when using quality prop
    minimumCacheTTL: 60,
    // Disable optimization in development for faster builds (images already compressed manually)
    // Production will automatically optimize images
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false, // Security: Remove X-Powered-By header
  reactStrictMode: true,
  // Security: Additional headers (backup to middleware)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
