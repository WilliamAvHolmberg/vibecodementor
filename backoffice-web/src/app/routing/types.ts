import { ApplicationRoles, type ApplicationRole } from '../../shared/constants/roles'

export { ApplicationRoles as ApplicationRole }
export type ApplicationRoleType = ApplicationRole

export interface RouteDefinition {
  path: string
  label: string
  icon: React.ComponentType<{ fontSize?: 'small' | 'medium' | 'large' }>
  component: React.ComponentType
  children?: RouteDefinition[]
  requiresRole?: ApplicationRoleType
}

export interface ApplicationDefinition {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ fontSize?: 'small' | 'medium' | 'large' }>
  basePath: string
  routes: RouteDefinition[]
  requiresRole?: ApplicationRoleType
}

export interface NavigationItem {
  path: string
  label: string
  icon: React.ComponentType<{ fontSize?: 'small' | 'medium' | 'large' }>
  children?: NavigationItem[]
}
