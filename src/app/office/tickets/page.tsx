'use client'

import GrievancesManager from '@/components/admin/GrievancesManager'
import Link from 'next/link'
import { BarChart3, Plus } from 'lucide-react'

export default function OfficeTicketsPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tickets List</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/office/analytics"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
          >
            <BarChart3 className="h-5 w-5" />
            Analytics
          </Link>
          <Link
            href="/office/activity"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-orange-500 text-orange-700 font-semibold hover:bg-orange-50 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Office Activity
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <GrievancesManager />
      </div>
    </div>
  )
}

