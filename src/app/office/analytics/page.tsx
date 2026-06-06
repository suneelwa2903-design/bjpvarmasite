'use client'

import React, { useEffect, useState } from 'react'
import { BarChart3, AlertTriangle, Users, TrendingUp, List, Plus } from 'lucide-react'
import Link from 'next/link'

type AnalyticsData = {
  statusCounts: Record<string, number>
  sourceDistribution: Record<string, number>
  assigneeWorkload: Array<{ count: number; name: string }>
  categoryDistribution: Record<string, number>
  slaAtRisk: number
  trends: Array<{ date: string; count: number }>
  total: number
  priorityDistribution?: Record<string, number>
  resolutionTime?: { avg: number; median: number; resolved: number }
  agingBuckets?: Record<string, number>
  etaCompliance?: { total: number; onTrack: number; overdue: number }
}

export default function OfficeAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/office/analytics?days=${days}`)
        const j = await res.json()
        if (j.success) setData(j.data)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [days])

  useEffect(() => {
    const loadRole = async () => {
      try {
        const res = await fetch('/api/office/me', { credentials: 'include' })
        const j = await res.json()
        if (j.success && j.data) {
          setRole(j.data.role)
        }
      } catch {}
    }
    loadRole()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>
  if (!data) return <div className="p-8 text-center text-red-600">Failed to load analytics</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/office/tickets"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
          >
            <List className="h-5 w-5" />
            Tickets List
          </Link>
          {role !== 'OFFICE_VIEWER' && (
            <Link
              href="/office/activity"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-orange-500 text-orange-700 font-semibold hover:bg-orange-50 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Office Activity
            </Link>
          )}
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="border rounded px-3 py-2 focus:ring-orange-500 focus:border-orange-500">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last 1 year</option>
            <option value={9999}>All time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <span className="text-2xl font-bold">{data.total}</span>
          </div>
          <div className="text-sm text-gray-600">Total Tickets</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-2xl font-bold">{data.slaAtRisk}</span>
          </div>
          <div className="text-sm text-gray-600">SLA At Risk</div>
          <Link href={`/office/tickets`} className="text-xs text-orange-600 mt-1 hover:underline">View all</Link>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-orange-600" />
            <span className="text-2xl font-bold">{data.assigneeWorkload.length}</span>
          </div>
          <div className="text-sm text-gray-600">Active Assignees</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="text-2xl font-bold">{Object.keys(data.categoryDistribution).length}</span>
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Status Distribution</h3>
          <div className="space-y-2">
            {Object.entries(data.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm">{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded h-2">
                    <div className="bg-orange-500 h-2 rounded" style={{ width: `${(count / data.total) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Source Distribution</h3>
          <div className="space-y-2">
            {Object.entries(data.sourceDistribution).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-sm">{source}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded h-2">
                    <div className="bg-orange-500 h-2 rounded" style={{ width: `${(count / data.total) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Category Distribution</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(data.categoryDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded h-2">
                      <div className="bg-orange-500 h-2 rounded" style={{ width: `${(count / data.total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Assignee Workload</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.assigneeWorkload
              .sort((a, b) => {
                if (a.name === 'Unassigned') return 1
                if (b.name === 'Unassigned') return -1
                return b.count - a.count
              })
              .map((w, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className={`text-sm ${w.name === 'Unassigned' ? 'text-red-600 font-medium' : ''}`}>{w.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded h-2">
                      <div className={`h-2 rounded ${w.name === 'Unassigned' ? 'bg-red-600' : 'bg-orange-500'}`} style={{ width: `${(w.count / data.total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{w.count}</span>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-2 pt-2 border-t text-xs text-gray-500">
            Total: {data.assigneeWorkload.reduce((sum, w) => sum + w.count, 0)} tickets
          </div>
        </div>

        {/* Trends — CSS-only vertical bar chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Ticket Trends (Last {days} days)</h3>
          {(() => {
            // For 7 days show daily, for 30/90 days aggregate weekly
            let trendData = data.trends
            let dateFormat: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
            if (days > 14) {
              // Group into weekly buckets
              const weeks: { date: string; count: number }[] = []
              for (let i = 0; i < trendData.length; i += 7) {
                const chunk = trendData.slice(i, i + 7)
                const total = chunk.reduce((s, t) => s + t.count, 0)
                const label = chunk[0]?.date || ''
                weeks.push({ date: label, count: total })
              }
              trendData = weeks
              dateFormat = { day: '2-digit', month: 'short' }
            }
            const maxCount = Math.max(...trendData.map(t => t.count), 1)
            return (
              <div className="flex items-end gap-1 h-40">
                {trendData.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    {t.count > 0 && <span className="text-[9px] text-gray-500 mb-1">{t.count}</span>}
                    <div
                      className="w-full bg-orange-400 rounded-t min-h-[2px] transition-all"
                      style={{ height: `${(t.count / maxCount) * 100}%` }}
                    />
                    <span className="text-[8px] text-gray-400 mt-1 truncate w-full text-center">
                      {new Date(t.date).toLocaleDateString('en-IN', dateFormat)}
                    </span>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>

      {/* New Analytics Row: Priority, Resolution, Aging, ETA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3 text-sm">Priority Distribution</h3>
          {data.priorityDistribution ? (
            <div className="space-y-2">
              {(['P1', 'P2', 'P3', 'P4'] as const).map(p => {
                const count = data.priorityDistribution?.[p] || 0
                const color = p === 'P1' ? 'bg-red-500' : p === 'P2' ? 'bg-orange-500' : p === 'P3' ? 'bg-amber-400' : 'bg-gray-400'
                const label = p === 'P1' ? 'Critical' : p === 'P2' ? 'Moderate' : p === 'P3' ? 'Normal' : 'Low'
                return (
                  <div key={p} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{p} {label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded h-2">
                        <div className={`${color} h-2 rounded`} style={{ width: `${data.total ? (count / data.total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-xs text-gray-400">No data</p>}
        </div>

        {/* Resolution Time */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3 text-sm">Resolution Time</h3>
          {data.resolutionTime ? (
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-2xl font-bold text-orange-600">
                  {data.resolutionTime.avg < 24 ? `${data.resolutionTime.avg}h` : `${Math.round(data.resolutionTime.avg / 24)}d`}
                </span>
                <p className="text-xs text-gray-500">Avg Resolution</p>
              </div>
              <div className="flex justify-between text-center">
                <div>
                  <span className="text-lg font-semibold text-gray-700">
                    {data.resolutionTime.median < 24 ? `${data.resolutionTime.median}h` : `${Math.round(data.resolutionTime.median / 24)}d`}
                  </span>
                  <p className="text-[10px] text-gray-500">Median</p>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-700">{data.resolutionTime.resolved}</span>
                  <p className="text-[10px] text-gray-500">Resolved</p>
                </div>
              </div>
            </div>
          ) : <p className="text-xs text-gray-400">No data</p>}
        </div>

        {/* Open Ticket Aging */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3 text-sm">Open Ticket Aging</h3>
          {data.agingBuckets ? (
            <div className="space-y-2">
              {Object.entries(data.agingBuckets).map(([bucket, count]) => {
                const color = bucket === '0-3d' ? 'bg-green-500' : bucket === '4-7d' ? 'bg-amber-400' : bucket === '8-14d' ? 'bg-orange-500' : bucket === '15-30d' ? 'bg-red-400' : 'bg-red-600'
                const openTotal = Object.values(data.agingBuckets!).reduce((s, c) => s + c, 0) || 1
                return (
                  <div key={bucket} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 w-12">{bucket}</span>
                    <div className="flex items-center gap-2 flex-1 ml-2">
                      <div className="flex-1 bg-gray-200 rounded h-2">
                        <div className={`${color} h-2 rounded`} style={{ width: `${(count / openTotal) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-xs text-gray-400">No data</p>}
        </div>

        {/* ETA Compliance */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3 text-sm">ETA Compliance</h3>
          {data.etaCompliance ? (
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-2xl font-bold text-orange-600">{data.etaCompliance.total}</span>
                <p className="text-xs text-gray-500">Tickets with ETA</p>
              </div>
              <div className="flex justify-between text-center">
                <div>
                  <span className="text-lg font-semibold text-green-600">{data.etaCompliance.onTrack}</span>
                  <p className="text-[10px] text-gray-500">On Track</p>
                </div>
                <div>
                  <span className="text-lg font-semibold text-red-600">{data.etaCompliance.overdue}</span>
                  <p className="text-[10px] text-gray-500">Overdue</p>
                </div>
              </div>
            </div>
          ) : <p className="text-xs text-gray-400">No data</p>}
        </div>
      </div>
    </div>
  )
}

