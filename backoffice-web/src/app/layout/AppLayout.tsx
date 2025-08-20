import { PropsWithChildren, useState } from 'react'
import { AppBar, Avatar, Box, Drawer, IconButton, InputBase, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import { Sidebar } from './Sidebar.tsx'
import { useAuth } from '../../auth/authContext'

const drawerWidth = 260

export function AppLayout({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const toggle = () => setMobileOpen((v) => !v)
  const { isAuthenticated, user, logout } = useAuth()
  const [userMenuEl, setUserMenuEl] = useState<null | HTMLElement>(null)
  const openUserMenu = (e: React.MouseEvent<HTMLElement>) => setUserMenuEl(e.currentTarget)
  const closeUserMenu = () => setUserMenuEl(null)
  const handleLogout = async () => {
    closeUserMenu()
    await logout()
  }
  const avatarLabel = (user?.email?.[0] ?? 'A').toUpperCase()

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" color="default">
        <Toolbar sx={{ gap: 2 }}>
          <IconButton color="inherit" edge="start" sx={{ display: { md: 'none' } }} onClick={toggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
            Admin
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={(t) => ({
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 10,
            border: `1px solid ${t.palette.divider}`,
            bgcolor: 'background.paper',
            minWidth: 220,
          })}>
            <InputBase placeholder="Search…" sx={{ fontSize: 14, width: '100%' }} />
          </Box>
          <IconButton size="small" onClick={isAuthenticated ? openUserMenu : undefined} aria-label="account">
            <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>{avatarLabel}</Avatar>
          </IconButton>
          <Menu
            anchorEl={userMenuEl}
            open={!!userMenuEl}
            onClose={closeUserMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {isAuthenticated && (
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" style={{ marginRight: 8 }} /> Logout
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          <Sidebar onNavigate={toggle} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar sx={{ mb: 1 }} />
        {children}
      </Box>
    </Box>
  )
}


