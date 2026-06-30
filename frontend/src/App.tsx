import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from './store/authStore'
import { useTheme } from './hooks/useTheme'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FeedbackWidget } from './components/FeedbackWidget'
import { Layout } from './components/Layout/Layout'
import { GOOGLE_CLIENT_ID, isGoogleOAuthConfigured } from './config/googleAuth'
import { config } from './config/env'
import { validateConfig, logConfig } from './config/env'
import { api } from './services/api'

const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })))
const UpgradePage = lazy(() => import('./pages/UpgradePage').then((module) => ({ default: module.UpgradePage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const StudentsPage = lazy(() => import('./pages/StudentsPage').then((module) => ({ default: module.StudentsPage })))
const StudentDetailsPage = lazy(() => import('./pages/StudentDetailsPage').then((module) => ({ default: module.StudentDetailsPage })))
const CalendarPage = lazy(() => import('./pages/CalendarPage').then((module) => ({ default: module.CalendarPage })))
const PaymentsPage = lazy(() => import('./pages/PaymentsPage').then((module) => ({ default: module.PaymentsPage })))
const LocationsPage = lazy(() => import('./pages/LocationsPage').then((module) => ({ default: module.LocationsPage })))
const GroupsPage = lazy(() => import('./pages/GroupsPage').then((module) => ({ default: module.GroupsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const PackagesPage = lazy(() => import('./pages/PackagesPage').then((module) => ({ default: module.PackagesPage })))

function RouteFallback() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  )
}

// Validate and log configuration on startup
validateConfig()
logConfig()

function AppContent() {
  const { isAuthenticated } = useAuthStore()
  const { mounted } = useTheme()
  const [hasValidSubscription, setHasValidSubscription] = useState<boolean | null>(null)
  const [checkingSubscription, setCheckingSubscription] = useState(true)

  const isProduction = config.environment === 'production'

  // Check subscription status on mount
  useEffect(() => {
    if (isAuthenticated && isProduction) {
      checkSubscription()
    } else {
      // Skip check in QA/dev
      setHasValidSubscription(true)
      setCheckingSubscription(false)
    }
  }, [isAuthenticated, isProduction])

  const checkSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/current')
      const subscription = response.data?.subscription
      
      // Check if user has a paid plan or is in trial
      const hasPaidPlan = subscription && 
        (subscription.tier?.tier_key !== 'free' || subscription.status === 'trialing')
      
      setHasValidSubscription(hasPaidPlan)
    } catch {
      // If no subscription found, consider as free
      setHasValidSubscription(false)
    } finally {
      setCheckingSubscription(false)
    }
  }

  // Prevent flash of unstyled content
  useEffect(() => {
    if (!mounted) {
      document.documentElement.style.visibility = 'hidden'
    } else {
      document.documentElement.style.visibility = 'visible'
    }
  }, [mounted])

  if (!mounted || (isAuthenticated && checkingSubscription)) {
    return <RouteFallback />
  }

  // Determine if user needs to upgrade (Prod only)
  const needsUpgrade = isAuthenticated && isProduction && !hasValidSubscription

  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
        {isAuthenticated ? (
          needsUpgrade ? (
            // Production: Paywall for free users
            <Routes>
              <Route path="/upgrade" element={<UpgradePage />} />
              <Route path="*" element={<Navigate to="/upgrade" replace />} />
            </Routes>
          ) : (
            // QA or has valid subscription: Normal flow
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
                <Route path="/upgrade" element={<UpgradePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          )
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Suspense>
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
