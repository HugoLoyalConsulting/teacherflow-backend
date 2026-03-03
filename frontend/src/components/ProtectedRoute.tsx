import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'user' | 'admin'
}

/**
 * Componente que protege rotas que requerem autenticação
 * Se o usuário não estiver autenticado, redireciona para /login
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getCurrentUser()

  // Se não autenticado, redirecionar ao login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Se requer admin mas user não é admin, redirecionar
  if (requiredRole === 'admin' && !user?.is_admin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
