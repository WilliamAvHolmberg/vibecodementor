import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import { RouteDefinition } from '../../app/routing/types'
import { DashboardPage } from '../../pages/DashboardPage'
import { UsersPage } from './features/users/routes/UsersPage'

export const superAdminRoutes: RouteDefinition[] = [
  {
    path: '/super-admin',
    label: 'Dashboard',
    icon: DashboardIcon,
    component: DashboardPage
  },
  {
    path: '/super-admin/users',
    label: 'Users',
    icon: PeopleIcon,
    component: UsersPage
  }
]
