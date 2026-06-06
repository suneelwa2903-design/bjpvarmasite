import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOfficeSessionUser } from '@/lib/officeAuth'

export async function GET(req: Request) {
  const user = await getOfficeSessionUser()
  if (!user) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30', 10)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Build where clause - all office users see all tickets
    // Analytics data is filtered by date only, not by assignment
    const where: any = { createdAt: { gte: since } }
    // Note: Only admins can access this route, but if we allow others in future,
    // they would see all tickets (not just assigned)

    const allTickets = await prisma.mibTicket.findMany({
      where,
      include: { 
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    })

    // Status counts
    const statusCounts: Record<string, number> = {}
    allTickets.forEach(t => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1
    })

    // Source distribution (PUBLIC vs OFFICE)
    const sourceDistribution: Record<string, number> = {}
    allTickets.forEach(t => {
      const source = t.source || 'PUBLIC'
      sourceDistribution[source] = (sourceDistribution[source] || 0) + 1
    })

    // Assignee workload - by owner (assignedTo), including unassigned
    const assigneeWorkloadMap: Record<string, { count: number; name: string }> = {}
    let unassignedCount = 0

    allTickets.forEach(t => {
      if (t.assignedToId && t.assignedTo) {
        const key = t.assignedToId
        if (!assigneeWorkloadMap[key]) {
          assigneeWorkloadMap[key] = { count: 0, name: t.assignedTo.name || 'Unknown' }
        }
        assigneeWorkloadMap[key].count++
      } else {
        unassignedCount++
      }
    })

    // Add unassigned to workload array
    const assigneeWorkload = Object.values(assigneeWorkloadMap)
    if (unassignedCount > 0) {
      assigneeWorkload.push({ count: unassignedCount, name: 'Unassigned' })
    }

    // Category distribution
    const categoryDistribution: Record<string, number> = {}
    allTickets.forEach(t => {
      const category = t.category || 'Uncategorized'
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1
    })

    // SLA at risk (tickets older than 3 days with status not RESOLVED/CLOSED)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const slaAtRisk = allTickets.filter(t => 
      new Date(t.createdAt) < threeDaysAgo && 
      !['RESOLVED', 'CLOSED'].includes(t.status)
    ).length

    // Trends (by day) — fill all dates in the range so chart shows full timeline
    const ticketsByDate: Record<string, number> = {}
    allTickets.forEach(t => {
      const date = new Date(t.createdAt).toISOString().split('T')[0]
      ticketsByDate[date] = (ticketsByDate[date] || 0) + 1
    })
    const trends: { date: string; count: number }[] = []
    for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      trends.push({ date: dateStr, count: ticketsByDate[dateStr] || 0 })
    }

    // Priority distribution
    const priorityDistribution: Record<string, number> = { P1: 0, P2: 0, P3: 0, P4: 0 }
    allTickets.forEach(t => {
      const p = t.priority || 'P2'
      priorityDistribution[p] = (priorityDistribution[p] || 0) + 1
    })

    // Resolution time (avg/median hours for resolved/closed tickets)
    const resolvedTickets = allTickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status))
    const resolutionHours = resolvedTickets
      .map(t => (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60))
      .filter(h => h > 0)
      .sort((a, b) => a - b)
    const avgResolutionHours = resolutionHours.length > 0
      ? Math.round(resolutionHours.reduce((s, h) => s + h, 0) / resolutionHours.length)
      : 0
    const medianResolutionHours = resolutionHours.length > 0
      ? Math.round(resolutionHours[Math.floor(resolutionHours.length / 2)])
      : 0

    // Aging buckets for open tickets
    const openTickets = allTickets.filter(t => !['RESOLVED', 'CLOSED'].includes(t.status))
    const now = Date.now()
    const agingBuckets = { '0-3d': 0, '4-7d': 0, '8-14d': 0, '15-30d': 0, '30+d': 0 }
    openTickets.forEach(t => {
      const ageDays = (now - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      if (ageDays <= 3) agingBuckets['0-3d']++
      else if (ageDays <= 7) agingBuckets['4-7d']++
      else if (ageDays <= 14) agingBuckets['8-14d']++
      else if (ageDays <= 30) agingBuckets['15-30d']++
      else agingBuckets['30+d']++
    })

    // ETA compliance
    const withEta = allTickets.filter(t => t.eta && !['RESOLVED', 'CLOSED'].includes(t.status))
    const overdue = withEta.filter(t => new Date(t.eta!).getTime() < now).length
    const etaCompliance = { total: withEta.length, onTrack: withEta.length - overdue, overdue }

    return NextResponse.json({
      success: true,
      data: {
        statusCounts,
        sourceDistribution,
        assigneeWorkload,
        categoryDistribution,
        slaAtRisk,
        trends,
        total: allTickets.length,
        priorityDistribution,
        resolutionTime: { avg: avgResolutionHours, median: medianResolutionHours, resolved: resolvedTickets.length },
        agingBuckets,
        etaCompliance,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed' }, { status: 500 })
  }
}

