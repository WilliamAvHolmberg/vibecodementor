import { Box, Grid as Grid, Paper, Stack, Typography } from '@mui/material'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack>
        <Typography variant="overline" color="text.secondary">{label}</Typography>
        <Typography variant="h4">{value}</Typography>
      </Stack>
    </Paper>
  )
}

export function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Welcome back</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}><Stat label="Active Users" value="1,024" /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><Stat label="New Signups" value="37" /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><Stat label="DB Status" value="Healthy" /></Grid>
      </Grid>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Getting Started</Typography>
        <Typography color="text.secondary">Use the sidebar to navigate. Create and manage users under the Users section.</Typography>
      </Paper>
    </Box>
  )
}


