import { Typography, Box, Alert } from '@mui/material'
import { useAuth } from '../../auth/authContext'
import { ApplicationRoleType } from './types'

interface RouteGuardProps {
  children: React.ReactNode
  requiresRole?: ApplicationRoleType
}

export function RouteGuard({ children, requiresRole }: RouteGuardProps) {
  const auth = useAuth()

  // If no role is required, allow access
  if (!requiresRole) {
    return <>{children}</>
  }

  // If user is not authenticated, show access denied
  if (!auth.isAuthenticated || !auth.user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You need to be logged in to access this page.</Typography>
        </Alert>
      </Box>
    )
  }

  // Check if user has the required role
  if (!auth.user.roles.includes(requiresRole)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>
            You do not have access to this page. Required role: {requiresRole}
          </Typography>
        </Alert>
      </Box>
    )
  }

  // User has access, render the component
  return <>{children}</>
}
