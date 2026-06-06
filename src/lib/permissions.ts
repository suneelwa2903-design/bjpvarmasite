/**
 * Role-Based Access Control (RBAC) Permission System
 * 
 * Defines what each role can do in the system.
 * Use these functions to check permissions before allowing actions.
 */

export type UserRole = 'CITIZEN' | 'OFFICE_ADMIN' | 'OFFICE_AGENT' | 'OFFICE_VIEWER'

/**
 * Permission definitions - which roles can perform which actions
 */
export const PERMISSIONS = {
  // Ticket viewing permissions
  // AGENT and VIEWER can view ALL tickets (not just assigned)
  VIEW_ALL_TICKETS: ['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'] as UserRole[],
  VIEW_ASSIGNED_TICKETS: ['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'] as UserRole[],
  
  // Ticket editing permissions
  EDIT_ALL_TICKETS: ['OFFICE_ADMIN'] as UserRole[],
  EDIT_ASSIGNED_TICKETS: ['OFFICE_ADMIN', 'OFFICE_AGENT'] as UserRole[], // VIEWER cannot edit
  
  // Ticket management permissions
  ASSIGN_TICKETS: ['OFFICE_ADMIN'] as UserRole[], // Only admins can assign
  CHANGE_STATUS: ['OFFICE_ADMIN', 'OFFICE_AGENT'] as UserRole[], // VIEWER cannot change status
  CHANGE_PRIORITY: ['OFFICE_ADMIN', 'OFFICE_AGENT'] as UserRole[], // VIEWER cannot change priority
  SET_ETA: ['OFFICE_ADMIN', 'OFFICE_AGENT'] as UserRole[], // VIEWER cannot set ETA
  
  // Administrative permissions
  MANAGE_USERS: ['OFFICE_ADMIN'] as UserRole[],  // via admin portal
  EXPORT_DATA: ['OFFICE_ADMIN'] as UserRole[],
  VIEW_ANALYTICS: ['OFFICE_ADMIN'] as UserRole[],
  
  // Citizen permissions
  CREATE_TICKET: ['CITIZEN', 'OFFICE_ADMIN', 'OFFICE_AGENT'] as UserRole[],
  COMMENT_ON_TICKET: ['CITIZEN', 'OFFICE_ADMIN', 'OFFICE_AGENT'] as UserRole[],
} as const

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[permission].includes(userRole)
}

/**
 * Check if a user can edit a specific ticket
 * - Admins can edit any ticket
 * - Agents can edit tickets assigned to them
 * - Viewers cannot edit any tickets
 */
export function canEditTicket(
  userRole: UserRole,
  ticketAssignedToId: string | null,
  userId: string
): boolean {
  if (userRole === 'OFFICE_ADMIN') return true
  if (userRole === 'OFFICE_AGENT' && ticketAssignedToId === userId) return true
  return false // VIEWER and CITIZEN cannot edit
}

/**
 * Check if a user can view a specific ticket
 * - Admins, Agents, and Viewers can view ALL tickets (office portal only)
 * - This is for office portal users - citizens have separate logic
 */
export function canViewTicket(
  userRole: UserRole,
  ticketAssignedToId: string | null,
  userId: string
): boolean {
  // All office users (ADMIN, AGENT, VIEWER) can view all tickets
  if (['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'].includes(userRole)) {
    return true
  }
  return false
}

/**
 * Check if a user can assign tickets
 * Only admins can assign tickets to other users
 */
export function canAssignTickets(userRole: UserRole): boolean {
  return hasPermission(userRole, 'ASSIGN_TICKETS')
}

/**
 * Check if a user can change ticket status
 * Admins and Agents can change status (but only on assigned tickets for agents)
 * Viewers cannot change status
 */
export function canChangeStatus(userRole: UserRole, ticketAssignedToId: string | null, userId: string): boolean {
  if (userRole === 'OFFICE_ADMIN') return true
  if (userRole === 'OFFICE_AGENT' && ticketAssignedToId === userId) return true
  return false // VIEWER cannot change status
}

/**
 * Check if a user can change ticket priority
 * Admins can change priority on any ticket
 * Agents can change priority only on assigned tickets
 * Viewers cannot change priority
 */
export function canChangePriority(userRole: UserRole, ticketAssignedToId: string | null, userId: string): boolean {
  if (userRole === 'OFFICE_ADMIN') return true
  if (userRole === 'OFFICE_AGENT' && ticketAssignedToId === userId) return true
  return false // VIEWER cannot change priority
}

/**
 * Check if a user can set ETA
 * Admins can set ETA on any ticket
 * Agents can set ETA only on assigned tickets
 * Viewers cannot set ETA
 */
export function canSetETA(userRole: UserRole, ticketAssignedToId: string | null, userId: string): boolean {
  if (userRole === 'OFFICE_ADMIN') return true
  if (userRole === 'OFFICE_AGENT' && ticketAssignedToId === userId) return true
  return false // VIEWER cannot set ETA
}

/**
 * Check if a user is an office user (not a citizen)
 */
export function isOfficeUser(userRole: UserRole): boolean {
  return ['OFFICE_ADMIN', 'OFFICE_AGENT', 'OFFICE_VIEWER'].includes(userRole)
}

/**
 * Check if a user is an admin
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'OFFICE_ADMIN'
}

/**
 * Get all permissions for a role (useful for debugging or UI display)
 */
export function getRolePermissions(userRole: UserRole): (keyof typeof PERMISSIONS)[] {
  const permissions: (keyof typeof PERMISSIONS)[] = []
  for (const [permission, roles] of Object.entries(PERMISSIONS)) {
    if (roles.includes(userRole)) {
      permissions.push(permission as keyof typeof PERMISSIONS)
    }
  }
  return permissions
}

