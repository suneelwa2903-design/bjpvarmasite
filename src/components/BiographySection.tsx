'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePageData } from '@/contexts/PageDataContext'

const BiographySection = () => {
  const { data, loading } = usePageData()
  const biography = data?.biography || null

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (!biography || !biography.content) return null

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Biography
          </h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative h-96 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg mx-auto w-full"
          >
            <Image
              src={biography.image || '/images/slide1.jpg'}
              alt="Bhupathiraju Srinivasa Varma"
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed"
          >
            <div className="whitespace-pre-wrap">{biography.content}</div>

            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link
                href="/profile"
                target="_blank"
                className="inline-block border-2 border-orange-600 text-orange-600 dark:text-orange-400 dark:border-orange-400 px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white transition-colors duration-300"
              >
                ↓ Download Profile
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default BiographySection
