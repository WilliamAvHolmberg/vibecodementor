import { 
  Box, 
  Card, 
  CardActionArea, 
  CardContent, 
  Grid as Grid, 
  Typography,
  Paper
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getUserApplications } from '../../applications'
import { ApplicationDefinition } from '../routing/types'
import { useAuth } from '../../auth/authContext'

function AppCard({ app }: { app: ApplicationDefinition }) {
  const navigate = useNavigate()

  return (
    <Card 
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 4,
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardActionArea 
        onClick={() => navigate(app.basePath)}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        <CardContent 
          sx={{ 
            textAlign: 'center', 
            py: 6, 
            px: 4,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >

          
          {/* Clean typography */}
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              mb: 1.5,
              letterSpacing: '-0.01em'
            }}
          >
            {app.name}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              lineHeight: 1.5,
              fontSize: '0.95rem'
            }}
          >
            {app.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export function AppSelector() {
  const auth = useAuth()
  const userApplications = getUserApplications(auth.user?.roles || [])

  // Show message when no applications are available
  if (userApplications.length === 0) {
    return (
      <Box 
        sx={{ 
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 2
        }}
      >

        {/* Clean typography hierarchy */}
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 300,
            color: 'text.primary',
            mb: 2,
            letterSpacing: '-0.02em'
          }}
        >
          No Applications Available
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            maxWidth: 480,
            lineHeight: 1.6,
            mb: 6,
            fontSize: '1.1rem'
          }}
        >
          You don't have access to any applications yet. Contact your administrator to get the appropriate permissions.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ px: 2, py: 4 }}>
      {/* Clean header section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 300,
            color: 'text.primary',
            mb: 2,
            letterSpacing: '-0.02em'
          }}
        >
          Select Application
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '1.1rem',
            maxWidth: 480,
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Choose the application you want to access
        </Typography>
      </Box>
      
      {/* Application grid */}
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Grid container spacing={4} justifyContent="center">
          {userApplications.map((app) => (
            <Grid key={app.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <AppCard app={app} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
