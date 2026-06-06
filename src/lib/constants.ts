/**
 * Shared constants for roles, statuses, priorities, and UI colors
 */

export const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  OFFICE_ADMIN: 'OFFICE_ADMIN',
  OFFICE_AGENT: 'OFFICE_AGENT',
  OFFICE_VIEWER: 'OFFICE_VIEWER',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const OFFICE_ROLES = [USER_ROLES.OFFICE_ADMIN, USER_ROLES.OFFICE_AGENT, USER_ROLES.OFFICE_VIEWER] as const

export const TICKET_STATUSES = {
  NEW: 'NEW',
  CREATED: 'CREATED',
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  NEED_INFO: 'NEED_INFO',
  REOPEN: 'REOPEN',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const

export type TicketStatus = (typeof TICKET_STATUSES)[keyof typeof TICKET_STATUSES]

export const TICKET_PRIORITIES = {
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
  P4: 'P4',
} as const

export type TicketPriority = (typeof TICKET_PRIORITIES)[keyof typeof TICKET_PRIORITIES]

export const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-gray-500',
  CREATED: 'bg-blue-500',
  OPEN: 'bg-blue-600',
  IN_PROGRESS: 'bg-yellow-500',
  NEED_INFO: 'bg-orange-500',
  REOPEN: 'bg-red-500',
  RESOLVED: 'bg-green-500',
  CLOSED: 'bg-gray-700',
}

export const PRIORITY_COLORS: Record<string, string> = {
  P1: 'bg-red-600',
  P2: 'bg-orange-500',
  P3: 'bg-yellow-500',
  P4: 'bg-blue-500',
}

export const PRIORITY_LABELS: Record<string, string> = {
  P1: 'Critical',
  P2: 'High',
  P3: 'Medium',
  P4: 'Low',
}

export const SLA_DAYS: Record<string, number> = {
  P1: 3,
  P2: 7,
  P3: 15,
  P4: 30,
}
