import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert, Stack, TextField, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import AddIcon from '@mui/icons-material/Add'
import { useState } from 'react'
import { UsersTable } from '../components/UsersTable'
import { RoleSelector } from '../components/RoleSelector'
import { usePostApiUsers, getGetApiUsersQueryKey, usePutApiUsersId, UserListItem } from '../../../../../api/generated'

export function UsersPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['User'])
  const createUser = usePostApiUsers()
  const updateUser = usePutApiUsersId()
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' })
  const queryClient = useQueryClient()

  const onCreate = () => {
    createUser.mutate(
      { 
        data: { 
          email, 
          firstName,
          lastName,
          roles: selectedRoles
        } 
      },
      {
        onSuccess: () => {
          setCreateOpen(false)
          resetForm()
          setSnack({ open: true, msg: 'User created', severity: 'success' })
          // Invalidate all /api/users queries (any params)
          queryClient.invalidateQueries({ queryKey: getGetApiUsersQueryKey(undefined) })
        },
        onError: () => setSnack({ open: true, msg: 'Failed to create user', severity: 'error' }),
      }
    )
  }

  const resetForm = () => {
    setEmail('')
    setFirstName('')
    setLastName('')
    setSelectedRoles(['User'])
  }

  const handleEditUser = (user: UserListItem) => {
    setEditingUser(user)
    setEmail(user.email || '')
    setFirstName(user.fullName?.split(' ')[0] || '')
    setLastName(user.fullName?.split(' ').slice(1).join(' ') || '')
    setSelectedRoles(user.roles || [])
    setEditOpen(true)
  }

  const onUpdate = () => {
    if (!editingUser?.id) return
    
    updateUser.mutate(
      { 
        id: editingUser.id,
        data: { 
          email,
          firstName,
          lastName,
          roles: selectedRoles
        } 
      },
      {
        onSuccess: () => {
          setEditOpen(false)
          setEditingUser(null)
          resetForm()
          setSnack({ open: true, msg: 'User updated', severity: 'success' })
          queryClient.invalidateQueries({ queryKey: getGetApiUsersQueryKey(undefined) })
        },
        onError: () => setSnack({ open: true, msg: 'Failed to update user', severity: 'error' }),
      }
    )
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6">Users</Typography>
            <Typography variant="body2" color="text.secondary">Explore, search, and manage users seamlessly.</Typography>
          </Stack>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New User
          </Button>
        </Box>
        <UsersTable onEditUser={handleEditUser} />
      </Container>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
              label="Email" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              autoFocus 
              fullWidth 
            />
            <TextField 
              label="First Name" 
              required 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              fullWidth 
            />
            <TextField 
              label="Last Name" 
              required 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              fullWidth 
            />
            <RoleSelector
              selectedRoles={selectedRoles}
              onChange={setSelectedRoles}
              label="User Roles"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onCreate} disabled={createUser.isPending || !email || !firstName || !lastName}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
              label="Email" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              autoFocus 
              fullWidth 
            />
            <TextField 
              label="First Name" 
              required 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              fullWidth 
            />
            <TextField 
              label="Last Name" 
              required 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              fullWidth 
            />
            <RoleSelector
              selectedRoles={selectedRoles}
              onChange={setSelectedRoles}
              label="User Roles"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onUpdate} disabled={updateUser.isPending || !email || !firstName || !lastName}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}


