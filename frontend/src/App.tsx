import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from './store/authStore'
import { useTheme } from './hooks/useTheme'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FeedbackWidget } from './components/FeedbackWidget'
import { Layout } from './components/Layout/Layout'
import { GOOGLE_CLIENT_ID, isGoogleOAuthConfigured } from './config/googleAuth'
import { LoginPage } from './pages/LoginPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { StudentsPage } from './pages/StudentsPage'
import { StudentDetailsPage } from './pages/StudentDetailsPage'
import { CalendarPage } from './pages/CalendarPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { LocationsPage } from './pages/LocationsPage'
import { GroupsPage } from './pages/GroupsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { PackagesPage } from './pages/PackagesPage'
import { validateConfig, logConfig } from './config/env'

// Validate and log configuration on startup
validateConfig()
logConfig()

function AppContent() {
  const { isAuthenticated } = useAuthStore()
  const { mounted } = useTheme()

  // Prevent flash of unstyled content
  useEffect(() => {
    if (!mounted) {
      document.documentElement.style.visibility = 'hidden'
    } else {
      document.documentElement.style.visibility = 'visible'
    }
  }, [mounted])

  if (!mounted) {
    return null
  }

  return (
    <Router>
      {isAuthenticated ? (
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/:id" element={<StudentDetailsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  )
}

function App() {
  const appContent = (
    <ErrorBoundary>
      <AppContent />
      <FeedbackWidget />
    </ErrorBoundary>
  )

  // Wrap with GoogleOAuthProvider if configured
  if (isGoogleOAuthConfigured()) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {appContent}
      </GoogleOAuthProvider>
    )
  }

  return appContent
}

export default App
