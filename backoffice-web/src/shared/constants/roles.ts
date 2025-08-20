/**
 * Centralized role definitions for the application
 * Keep in sync with backend RoleConstants
 */

export const ApplicationRoles = {
  User: 'User',
  Admin: 'Admin',
  SuperAdmin: 'SuperAdmin'
} as const

export type ApplicationRole = typeof ApplicationRoles[keyof typeof ApplicationRoles]

/**
 * Array of all available roles for dropdowns, selectors, etc.
 */
export const AVAILABLE_ROLES: ApplicationRole[] = Object.values(ApplicationRoles)

/**
 * Role display configurations (colors, labels, etc.)
 */
export const RoleConfig = {
  [ApplicationRoles.SuperAdmin]: {
    color: '#d32f2f', // Red
    backgroundColor: '#d32f2f',
    label: 'Super Admin',
    priority: 3
  },
  [ApplicationRoles.Admin]: {
    color: '#ed6c02', // Orange  
    backgroundColor: '#ed6c02',
    label: 'Admin',
    priority: 2
  },
  [ApplicationRoles.User]: {
    color: '#2e7d32', // Green
    backgroundColor: '#2e7d32', 
    label: 'User',
    priority: 1
  }
} as const

/**
 * Helper function to get role display configuration
 */
export const getRoleConfig = (role: string) => {
  return RoleConfig[role as ApplicationRole] || {
    color: '#757575', // Gray fallback
    backgroundColor: '#757575',
    label: role,
    priority: 0
  }
}
