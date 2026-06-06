'use client'

import { motion } from 'framer-motion'

export default function Biography() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Biography</h1>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            This page will contain the complete biography of BJP Varma, detailing his journey from grassroots politics to becoming a Union Minister and State President of BJP - Andhra Pradesh.
          </p>
          <p className="text-gray-600">
            Content coming soon...
          </p>
        </motion.div>
      </div>
    </div>
  )
}

