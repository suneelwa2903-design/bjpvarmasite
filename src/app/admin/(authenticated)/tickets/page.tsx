import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth'

// Force dynamic rendering - don't pre-render this page at build time
export const dynamic = 'force-dynamic'
export const revalidate = 0

function daysOpen(createdAt: Date) {
  const ms = Date.now() - new Date(createdAt).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export default async function AdminTicketsPage() {
  const adminUsername = await getCurrentSession()
  if (!adminUsername) {
    redirect('/admin')
  }

  // During build, Next.js may try to pre-render this page even with dynamic='force-dynamic'
  // We need to handle the case where the database table doesn't exist yet
  let tickets: any[] = []
  
  // Check if we can safely query the database
  const canQueryDB = process.env.DATABASE_URL && !process.env.SKIP_DB_QUERIES
  
  if (canQueryDB) {
    try {
      tickets = await prisma.mibTicket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    } catch (error: any) {
      // P2021 is "Table does not exist" - this is expected during initial build
      // P1001 is "Can't reach database server" - also expected if DB isn't set up yet
      if (error?.code === 'P2021' || error?.code === 'P1001') {
        // Silently return empty array - this is expected during build
        tickets = []
      } else {
        console.error('Error fetching tickets:', error)
        tickets = []
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4 p-3 rounded bg-orange-50 text-orange-800 border border-orange-200">
        Tickets have moved to the Office portal. Please use <a className="underline font-semibold" href="/office">/office</a> for viewing and actions.
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/mib/tickets/export" className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200">Export CSV</a>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Ticket</th>
              <th className="px-4 py-3 text-left">Applicant</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">District</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aging</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3 text-blue-600 underline"><Link href={`/admin/tickets/${t.ticketNo}`}>{t.ticketNo}</Link></td>
                <td className="px-4 py-3">{t.applicantName}</td>
                <td className="px-4 py-3">{t.category} / {t.categoryType}</td>
                <td className="px-4 py-3">{t.district}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{t.status}</span></td>
                <td className="px-4 py-3">{daysOpen(t.createdAt)}d</td>
                <td className="px-4 py-3">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
