import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { ApplicationDefinition, ApplicationRole } from '../../app/routing/types'
import { superAdminRoutes } from './routes'

export const superAdminApplication: ApplicationDefinition = {
  id: 'super-admin',
  name: 'SuperAdmin Panel',
  description: 'User management and system administration',
  icon: AdminPanelSettingsIcon,
  basePath: '/super-admin',
  routes: superAdminRoutes,
  requiresRole: ApplicationRole.SuperAdmin
}

export * from './routes'
