/**
 * Centralized authorization system
 * 
 * Single source of truth for all permission checks
 * Prevents scattered checks and ensures consistency
 */

import { type UserRole } from '../permissions'
import {
  canEditTicket,
  canViewTicket,
  canAssignTickets,
  canChangeStatus,
  canChangePriority,
  canSetETA,
  hasPermission,
  isAdmin,
} from '../permissions'

export type Action = 
  | 'view_ticket'
  | 'edit_ticket'
  | 'assign_ticket'
  | 'change_status'
  | 'change_priority'
  | 'set_eta'
  | 'view_analytics'
  | 'export_data'
  | 'manage_users'

export interface AuthorizationContext {
  userRole: UserRole
  userId: string
  resourceId?: string
  ticketAssignedToId?: string | null
  [key: string]: unknown // Allow additional context
}

/**
 * Centralized authorization check
 * Returns { allowed: boolean, reason?: string }
 */
export function authorize(
  action: Action,
  context: AuthorizationContext
): { allowed: boolean; reason?: string } {
  const { userRole, userId, ticketAssignedToId } = context

  // Deny by default
  let allowed = false
  let reason: string | undefined

  switch (action) {
    case 'view_ticket':
      allowed = canViewTicket(userRole, ticketAssignedToId || null, userId)
      if (!allowed) reason = 'Insufficient permissions to view ticket'
      break

    case 'edit_ticket':
      allowed = canEditTicket(userRole, ticketAssignedToId || null, userId)
      if (!allowed) reason = 'Insufficient permissions to edit ticket'
      break

    case 'assign_ticket':
      allowed = canAssignTickets(userRole)
      if (!allowed) reason = 'Only admins can assign tickets'
      break

    case 'change_status':
      allowed = canChangeStatus(userRole, ticketAssignedToId || null, userId)
      if (!allowed) reason = 'Insufficient permissions to change ticket status'
      break

    case 'change_priority':
      allowed = canChangePriority(userRole, ticketAssignedToId || null, userId)
      if (!allowed) reason = 'Insufficient permissions to change ticket priority'
      break

    case 'set_eta':
      allowed = canSetETA(userRole, ticketAssignedToId || null, userId)
      if (!allowed) reason = 'Insufficient permissions to set ETA'
      break

    case 'view_analytics':
      allowed = hasPermission(userRole, 'VIEW_ANALYTICS')
      if (!allowed) reason = 'Only admins can view analytics'
      break

    case 'export_data':
      allowed = hasPermission(userRole, 'EXPORT_DATA')
      if (!allowed) reason = 'Only admins can export data'
      break

    case 'manage_users':
      allowed = hasPermission(userRole, 'MANAGE_USERS')
      if (!allowed) reason = 'Only admins can manage users'
      break

    default:
      allowed = false
      reason = `Unknown action: ${action}`
  }

  return { allowed, reason }
}

/**
 * Require authorization - throws if not allowed
 * Use in route handlers with try/catch
 */
export function requireAuthorization(
  action: Action,
  context: AuthorizationContext
): void {
  const { allowed, reason } = authorize(action, context)
  if (!allowed) {
    throw new Error(reason || 'Unauthorized')
  }
}

/**
 * Check if user is admin
 */
export function requireAdmin(userRole: UserRole): void {
  if (!isAdmin(userRole)) {
    throw new Error('Admin access required')
  }
}

