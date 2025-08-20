import { useLocation } from 'react-router-dom'
import { applications } from '../../applications'
import { ApplicationDefinition } from '../routing/types'

/**
 * Hook to determine the current application based on the current route
 */
export function useCurrentApplication(): ApplicationDefinition | null {
  const { pathname } = useLocation()
  
  // Find the application that matches the current path
  const currentApp = applications.find(app => 
    pathname.startsWith(app.basePath)
  )
  
  return currentApp || null
}
