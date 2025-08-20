import { DataGrid, GridToolbarQuickFilter, GridActionsCellItem } from '@mui/x-data-grid'
import type { GridColDef, GridPaginationModel, GridFilterModel, GridSortModel } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import { useMemo, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import { useGetApiUsers, UserListItem } from '../../../../../api/generated'
import { RoleChip } from './RoleSelector'

function SoftToolbar() {
  return (
    <Box sx={(t) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      px: { xs: 1, md: 1.5 },
      py: 1,
      borderBottom: `1px solid ${t.palette.divider}`,
      backgroundColor: t.palette.background.paper,
    })}>
      <Box sx={{ width: { xs: '100%', sm: 320 } }}>
        <GridToolbarQuickFilter
          quickFilterParser={(val) => val.split(/\s+/).filter(Boolean)}
          debounceMs={300}
        />
      </Box>
      <Box sx={{ flex: 1 }} />
    </Box>
  )
}

interface UsersTableProps {
  onEditUser?: (user: UserListItem) => void
}

export function UsersTable({ onEditUser }: UsersTableProps) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  // Keep filter model controlled to read quick filter value for server search
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [], quickFilterValues: [] })

  const params = useMemo(() => {
    const quick = filterModel.quickFilterValues?.[0] ?? ''
    return {
      search: quick || undefined,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
    }
  }, [filterModel, paginationModel])

  const query = useGetApiUsers(params, { query: { staleTime: 30000 } })

  const rows = query.data?.data.users ?? []
  const rowCount = query.data?.data.totalCount ?? 0

  const columns = useMemo<GridColDef<UserListItem>[]>(
    () => [
      {
        field: 'email',
        headerName: 'Email',
        flex: 1,
        renderCell: (p) => (
          <a style={{ color: 'inherit' }}>
            {p.value as string}
          </a>
        ),
      },
      { field: 'fullName', headerName: 'Name', flex: 1 },
      {
        field: 'roles',
        headerName: 'Roles',
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', py: 0.5 }}>
            {(params.value as string[] || []).map((role) => (
              <RoleChip key={role} role={role} size="small" />
            ))}
          </Box>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        flex: 1,
        valueFormatter: (p: { value?: string }) => (p?.value ? new Date(p.value).toLocaleString() : ''),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        width: 100,
        getActions: (params) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={() => onEditUser?.(params.row)}
            showInMenu={false}
          />,
        ],
      },
    ],
    [onEditUser]
  )

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        paginationMode="server"
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50]}
        loading={query.isFetching}
        filterMode="server"
        filterModel={filterModel}
        onFilterModelChange={(model) => {
          setFilterModel(model)
          setPaginationModel((prev) => ({ ...prev, page: 0 }))
        }}
        sortingMode="client"
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        slots={{ toolbar: SoftToolbar }}
      />
    </Box>
  )
}


