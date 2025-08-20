import { createTheme } from '@mui/material/styles'
import '@mui/x-data-grid/themeAugmentation'
import { grey } from '@mui/material/colors'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563EB' },
    secondary: { main: '#0EA5E9' },
    background: { default: '#F6F7FB', paper: '#FFFFFF' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: 'none',
          borderRadius: 0,
          border: 'none',
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'saturate(180%) blur(8px)',
          WebkitBackdropFilter: 'saturate(180%) blur(8px)',
          color: '#0F172A',
          borderBottom: `1px solid ${grey[200]}`,
          // Keep AppBar above Drawer globally so individual pages don't need zIndex sx
          zIndex: theme.zIndex.drawer + 1,
        }),
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${grey[200]}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${grey[200]}`,
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-selected': {
            backgroundColor: '#F1F5F9',
          },
        },
      },
    },
    MuiDataGrid: {
      defaultProps: {
        density: 'compact',
        rowHeight: 44,
        columnHeaderHeight: 44,
        disableColumnMenu: true,
        disableRowSelectionOnClick: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          // Container look and feel
          '--DataGrid-containerBackground': 'transparent',
          '--DataGrid-cellPaddingInline': '14px',
          '--DataGrid-cellPaddingBlock': '10px',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 12,
          backgroundColor: theme.palette.background.paper,
          overflow: 'hidden',

          // Headers
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            color: theme.palette.text.secondary,
          },

          // Rows
          '& .MuiDataGrid-virtualScrollerRenderZone .MuiDataGrid-row': {
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(15, 23, 42, 0.03)',
          },
          '& .MuiDataGrid-row:nth-of-type(even) .MuiDataGrid-cell': {
            backgroundColor: 'transparent',
          },
          '& .MuiDataGrid-row:nth-of-type(odd) .MuiDataGrid-cell': {
            backgroundColor: 'rgba(2, 6, 23, 0.015)',
          },

          // Focus
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },

          // Footer
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          },
        }),
      },
    },
  },
})


