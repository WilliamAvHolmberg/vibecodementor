import { ApplicationDefinition, ApplicationRoleType } from '../app/routing/types'
import { superAdminApplication } from './super-admin'

// Registry of all available applications
export const applications: ApplicationDefinition[] = [
  superAdminApplication
]

// Helper to get application by ID
export function getApplicationById(id: string): ApplicationDefinition | undefined {
  return applications.find(app => app.id === id)
}

// Helper to get applications user has access to based on their roles
export function getUserApplications(userRoles: ApplicationRoleType[] = []): ApplicationDefinition[] {
  return applications.filter(app => {
    // If app doesn't require a role, it's accessible to everyone
    if (!app.requiresRole) {
      return true
    }
    
    // Check if user has the required role
    return userRoles.includes(app.requiresRole)
  })
}

// Helper to check if user has access to a specific application
export function hasApplicationAccess(applicationId: string, userRoles: ApplicationRoleType[] = []): boolean {
  const app = getApplicationById(applicationId)
  if (!app) return false
  
  // If app doesn't require a role, it's accessible to everyone
  if (!app.requiresRole) {
    return true
  }
  
  // Check if user has the required role
  return userRoles.includes(app.requiresRole)
}
