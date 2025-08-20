import { Route } from 'react-router-dom'
import { ApplicationDefinition, NavigationItem, RouteDefinition } from './types'
import { RouteGuard } from './RouteGuard'

/**
 * Converts route definitions to React Router Route components
 */
export function buildRoutes(routes: RouteDefinition[]) {
  return routes.map((route) => (
    <Route 
      key={route.path} 
      path={route.path} 
      element={
        <RouteGuard requiresRole={route.requiresRole}>
          <route.component />
        </RouteGuard>
      } 
    />
  ))
}

/**
 * Converts route definitions to navigation items for sidebar
 */
export function buildNavigationItems(routes: RouteDefinition[]): NavigationItem[] {
  return routes.map((route) => ({
    path: route.path,
    label: route.label,
    icon: route.icon,
    children: route.children ? buildNavigationItems(route.children) : undefined
  }))
}

/**
 * Flattens all routes from multiple applications into a single array
 */
export function getAllRoutes(applications: ApplicationDefinition[]): RouteDefinition[] {
  return applications.flatMap(app => app.routes)
}

/**
 * Gets navigation items for a specific application
 */
export function getAppNavigationItems(application: ApplicationDefinition): NavigationItem[] {
  return buildNavigationItems(application.routes)
}
