import { Box, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material'
import AppsIcon from '@mui/icons-material/Apps'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCurrentApplication } from '../navigation/useCurrentApplication'
import { getAppNavigationItems } from '../routing/routeBuilder'
import { NavigationItem } from '../routing/types'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const currentApp = useCurrentApplication()
  
  const go = (to: string) => () => {
    navigate(to)
    onNavigate?.()
  }

  // Smart selection logic that works for flat navigation and future nested routes
  const isSelected = (currentPath: string, item: NavigationItem): boolean => {
    // Exact match always wins (both leaf and parent routes)
    if (currentPath === item.path) return true
    
    // If item has children, stay selected when on any child route
    if (item.children && item.children.length > 0) {
      return item.children.some(child => isSelected(currentPath, child))
    }
    
    // For leaf routes (no children), only exact match
    return false
  }

  // Get navigation items for current app, or show app selector
  const navigationItems = currentApp ? getAppNavigationItems(currentApp) : []

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Toolbar />
      <Box sx={{ px: 2, pb: 1 }}>
        <Typography variant="overline" color="text.secondary">
          {currentApp ? currentApp.name : 'Navigation'}
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {/* App Selector */}
        <ListItemButton selected={pathname === '/'} onClick={go('/')} sx={{ mb: 0.5 }}>
          <ListItemIcon><AppsIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Apps" />
        </ListItemButton>
        
        {/* Current App Navigation */}
        {navigationItems.map((item) => {
          const Icon = item.icon
          const selected = isSelected(pathname, item)
          
          return (
            <ListItemButton 
              key={item.path}
              selected={selected} 
              onClick={go(item.path)} 
              sx={{ mb: 0.5 }}
            >
              <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">v0.1</Typography>
      </Box>
    </Box>
  )
}


