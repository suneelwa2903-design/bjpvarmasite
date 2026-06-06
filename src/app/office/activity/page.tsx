import OfficeTicketForm from '@/components/office/OfficeTicketForm'
import Link from 'next/link'
import { BarChart3, List } from 'lucide-react'
import { getOfficeSessionUser } from '@/lib/officeAuth'
import { redirect } from 'next/navigation'

export default async function OfficeActivityPage() {
  const user = await getOfficeSessionUser()
  if (!user) {
    redirect('/office/login')
  }

  const isViewer = user.role === 'OFFICE_VIEWER'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Office Activity</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/office/analytics"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-orange-500 text-orange-700 font-semibold hover:bg-orange-50 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            Analytics
          </Link>
          <Link
            href="/office/tickets"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-orange-500 text-orange-700 font-semibold hover:bg-orange-50 transition-colors"
          >
            <List className="h-5 w-5" />
            Tickets List
          </Link>
        </div>
      </div>

      {isViewer ? (
        <div className="max-w-3xl mx-auto bg-white border border-yellow-200 rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">View-only access</h2>
          <p className="text-sm text-gray-600">
            Your role is configured with read-only permissions. Please contact an office administrator if you need to create internal tickets or update office activity.
          </p>
        </div>
      ) : (
        <OfficeTicketForm />
      )}
    </div>
  )
}

