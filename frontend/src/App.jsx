import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ui/ProtectedRoute'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />

      {/* Public routes */}
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/signup"
        element={!user ? <SignupPage /> : <Navigate to="/dashboard" replace />}
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"    element={<DashboardPage />} />
        <Route path="/projects"     element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
      </Route>

      {/* 404 — only for truly unknown paths */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}