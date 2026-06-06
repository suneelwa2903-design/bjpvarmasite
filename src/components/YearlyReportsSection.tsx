'use client'

import { motion } from 'framer-motion'
import { FileText, Download, ChevronRight, Clock } from 'lucide-react'
import { usePageData } from '@/contexts/PageDataContext'

interface Report {
  id: string
  year: string
  title: string
  highlights: string[]
  available: boolean
  pdfPath?: string
}

export default function YearlyReportsSection() {
  const { data } = usePageData()

  const settings = (data as any)?.siteSettings
  if (settings && settings.yearlyReports === false) return null

  const reports: Report[] = Array.isArray((data as any)?.yearlyReports) ? (data as any).yearlyReports : []
  if (reports.length === 0) return null

  return (
    <section id="reports" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Report to the People
          </h2>
          <div className="w-28 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 mx-auto rounded-full"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Accountability and transparency — a year-by-year account of service to Narsapuram and India.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-xl overflow-hidden border transition-shadow ${
                report.available
                  ? 'bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800 shadow-md hover:shadow-xl'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Top accent */}
              <div className={`h-1.5 w-full ${report.available
                ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-500'
                : 'bg-gray-300 dark:bg-gray-600'
              }`} />

              <div className="p-6">
                {/* Year badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    report.available
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {report.year}
                  </span>
                  {report.available ? (
                    <FileText className="h-5 w-5 text-orange-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                <h3 className={`font-bold text-lg mb-4 ${
                  report.available
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {report.title}
                </h3>

                <ul className="space-y-2 mb-6">
                  {report.highlights?.map((h, i) => (
                    <li key={i} className={`flex items-start gap-2 text-sm ${
                      report.available
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      <ChevronRight className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        report.available ? 'text-orange-500' : 'text-gray-300'
                      }`} />
                      {h}
                    </li>
                  ))}
                </ul>

                {report.available && report.pdfPath ? (
                  <a
                    href={report.pdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors w-full justify-center"
                  >
                    <Download className="h-4 w-4" />
                    View Full Report
                  </a>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-sm font-semibold px-4 py-2.5 rounded-lg w-full justify-center cursor-not-allowed">
                    <Clock className="h-4 w-4" />
                    Coming Soon
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-sm text-gray-500 dark:text-gray-500 mt-10"
        >
          Reports are published annually. For media enquiries, contact the Parliamentary Office.
        </motion.p>
      </div>
    </section>
  )
}
