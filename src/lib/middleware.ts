/**
 * Middleware utilities for consistent permission checking across routes
 * 
 * These helper functions provide a consistent way to check permissions
 * and throw errors that can be caught and returned as proper HTTP responses.
 */

import { getOfficeSessionUser } from './officeAuth'
import { getCurrentSession } from './auth'
import { 
  canEditTicket, 
  canViewTicket, 
  canAssignTickets, 
  canChangeStatus, 
  canChangePriority, 
  canSetETA,
  isAdmin,
  type UserRole 
} from './permissions'
import { NextResponse } from 'next/server'

/**
 * Require office authentication - throws if user is not authenticated
 * Returns the authenticated office user
 */
export async function requireOfficeAuth() {
  const user = await getOfficeSessionUser()
  if (!user) {
    throw new Error('Unauthorized: Office session required')
  }
  return user
}

/**
 * Require admin role - throws if user is not an admin
 * Returns the authenticated admin user
 */
export async function requireAdmin() {
  const user = await requireOfficeAuth()
  if (!isAdmin(user.role as UserRole)) {
    throw new Error('Forbidden: Admin access required')
  }
  return user
}

/**
 * Require ability to edit a specific ticket
 * Throws if user cannot edit the ticket
 * Returns the authenticated user
 */
export async function requireCanEditTicket(ticketAssignedToId: string | null, userId: string) {
  const user = await requireOfficeAuth()
  if (!canEditTicket(user.role as UserRole, ticketAssignedToId, userId)) {
    throw new Error('Forbidden: Insufficient permissions to edit this ticket')
  }
  return user
}

/**
 * Require ability to view a specific ticket
 * Throws if user cannot view the ticket
 * Returns the authenticated user
 */
export async function requireCanViewTicket(ticketAssignedToId: string | null, userId: string) {
  const user = await requireOfficeAuth()
  if (!canViewTicket(user.role as UserRole, ticketAssignedToId, userId)) {
    throw new Error('Forbidden: Insufficient permissions to view this ticket')
  }
  return user
}

/**
 * Require ability to change ticket status
 * Throws if user cannot change status
 * Returns the authenticated user
 */
export async function requireCanChangeStatus(ticketAssignedToId: string | null, userId: string) {
  const user = await requireOfficeAuth()
  if (!canChangeStatus(user.role as UserRole, ticketAssignedToId, userId)) {
    throw new Error('Forbidden: Insufficient permissions to change ticket status')
  }
  return user
}

/**
 * Require ability to change ticket priority
 * Throws if user cannot change priority
 * Returns the authenticated user
 */
export async function requireCanChangePriority(ticketAssignedToId: string | null, userId: string) {
  const user = await requireOfficeAuth()
  if (!canChangePriority(user.role as UserRole, ticketAssignedToId, userId)) {
    throw new Error('Forbidden: Insufficient permissions to change ticket priority')
  }
  return user
}

/**
 * Require ability to set ETA
 * Throws if user cannot set ETA
 * Returns the authenticated user
 */
export async function requireCanSetETA(ticketAssignedToId: string | null, userId: string) {
  const user = await requireOfficeAuth()
  if (!canSetETA(user.role as UserRole, ticketAssignedToId, userId)) {
    throw new Error('Forbidden: Insufficient permissions to set ETA')
  }
  return user
}

/**
 * Require ability to assign tickets
 * Throws if user cannot assign tickets
 * Returns the authenticated user
 */
export async function requireCanAssignTickets() {
  const user = await requireOfficeAuth()
  if (!canAssignTickets(user.role as UserRole)) {
    throw new Error('Forbidden: Only admins can assign tickets')
  }
  return user
}

/**
 * Helper to handle middleware errors and return proper HTTP responses
 * Use this in route handlers to catch errors from middleware functions
 */
export function handleMiddlewareError(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : 'Internal server error'
  
  if (message.includes('Unauthorized')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  
  if (message.includes('Forbidden') || message.includes('Insufficient permissions')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  
  return NextResponse.json({ success: false, error: message }, { status: 500 })
}

/**
 * Get office user or admin session (for routes that accept both)
 * Returns null if neither is authenticated
 */
export async function getOfficeOrAdminSession() {
  const office = await getOfficeSessionUser()
  if (office) return { user: office, type: 'office' as const }
  
  const admin = await getCurrentSession()
  if (admin) return { user: { id: admin, role: 'OFFICE_ADMIN' }, type: 'admin' as const }
  
  return null
}

