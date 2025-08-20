import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/layout/AppLayout'
import { AppSelector } from './app/navigation/AppSelector'
import { buildRoutes, getAllRoutes } from './app/routing/routeBuilder'
import { RouteGuard } from './app/routing/RouteGuard'
import { applications, getUserApplications } from './applications'
import { useAuth } from './auth/authContext'

function AppRoutes() {
  const auth = useAuth()
  const accessibleApplications = getUserApplications(auth.user?.roles || [])
  const allRoutes = getAllRoutes(accessibleApplications)

  return (
    <Routes>
      <Route path="/" element={<AppSelector />} />
      {buildRoutes(allRoutes)}
      
      {/* Catch-all route for inaccessible application paths */}
      {applications.map(app => (
        <Route 
          key={`guard-${app.id}`}
          path={`${app.basePath}/*`} 
          element={
            <RouteGuard requiresRole={app.requiresRole}>
              <div>Loading...</div> {/* This won't show if access is denied */}
            </RouteGuard>
          } 
        />
      ))}
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
