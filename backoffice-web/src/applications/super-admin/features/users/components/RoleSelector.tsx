import { Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, Box } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { AVAILABLE_ROLES, getRoleConfig } from '../../../../../shared/constants/roles'

interface RoleSelectorProps {
  selectedRoles: string[]
  onChange: (roles: string[]) => void
  disabled?: boolean
  label?: string
  size?: 'small' | 'medium'
}

export function RoleSelector({ 
  selectedRoles, 
  onChange, 
  disabled = false, 
  label = 'Roles',
  size = 'medium'
}: RoleSelectorProps) {
  const handleChange = (event: SelectChangeEvent<typeof selectedRoles>) => {
    const value = event.target.value
    onChange(typeof value === 'string' ? value.split(',') : value)
  }

  return (
    <FormControl fullWidth size={size} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={selectedRoles}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <RoleChip key={value} role={value} />
            ))}
          </Box>
        )}
      >
        {AVAILABLE_ROLES.map((role) => (
          <MenuItem key={role} value={role}>
            {role}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

interface RoleChipProps {
  role: string
  size?: 'small' | 'medium'
}

export function RoleChip({ role, size = 'small' }: RoleChipProps) {
  const config = getRoleConfig(role)

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        backgroundColor: config.backgroundColor,
        color: 'white',
        fontWeight: 500,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
      }}
    />
  )
}
