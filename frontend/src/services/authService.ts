/**
 * Serviço de Autenticação - Integração com API Backend
 * Incluí geração segura de OTP, validação, e gerenciamento de tokens
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface RegisterRequest {
  email: string
  full_name: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: {
    id: string
    email: string
    full_name: string
    email_verified: boolean
    two_factor_enabled: boolean
    created_at: string
  }
}

export interface AuthError {
  detail: string
  status: number
}

class AuthService {
  /**
   * Registrar novo usuário
   * Enviará código OTP para email
   */
  async register(data: RegisterRequest): Promise<{
    message: string
    email: string
    otp_code?: string // Apenas em DEBUG mode
  }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw {
        detail: error.detail || 'Erro no registro',
        status: response.status,
      }
    }

    return response.json()
  }

  /**
   * Verificar email com código OTP
   * Retorna tokens JWT se bem-sucedido
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw {
        detail: error.detail || 'Erro na verificação',
        status: response.status,
      }
    }

    const result = await response.json()
    this.storeTokens(result)
    return result
  }

  /**
   * Reenviar código OTP
   */
  async resendOTP(email: string): Promise<{
    message: string
    otp_code?: string
  }> {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw {
        detail: error.detail || 'Erro ao reenviar OTP',
        status: response.status,
      }
    }

    return response.json()
  }

  /**
   * Fazer login
   */
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw {
        detail: error.detail || 'Erro no login',
        status: response.status,
      }
    }

    const result = await response.json()
    this.storeTokens(result)
    return result
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw {
        detail: 'Refresh token não encontrado',
        status: 401,
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      this.clearTokens()
      throw {
        detail: 'Falha ao renovar token',
        status: response.status,
      }
    }

    const result = await response.json()
    this.storeTokens(result)
    return result
  }

  /**
   * Mudar senha (requer autenticação)
   */
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const accessToken = this.getAccessToken()

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw {
        detail: error.detail || 'Erro ao mudar senha',
        status: response.status,
      }
    }

    return response.json()
  }

  /**
   * Logout
   */
  logout(): void {
    this.clearTokens()
  }

  /**
   * Armazenar tokens de forma segura
   * - access_token: localStorage (rápido, mas menos seguro)
   * - refresh_token: sessionStorage (mais seguro, perdido ao fechar aba)
   */
  private storeTokens(response: TokenResponse): void {
    // Access token - compartilhado entre suposições
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('teacherflow-token', response.access_token)

    // Refresh token - mais seguro em sessionStorage (perdido ao fechar abas)
    sessionStorage.setItem('refresh_token', response.refresh_token)

    // Salvar info do usuário para UI
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: response.user.id,
        name: response.user.full_name,
        email: response.user.email,
        role: 'OWNER',
        tenantId: response.user.id,
        onboardingComplete: false,
        lessonTypes: [],
      })
    )

    // Salvar tempo de expiração
    const expiresAt = Date.now() + response.expires_in * 1000
    localStorage.setItem('token_expires_at', expiresAt.toString())
  }

  /**
   * Obter access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  }

  /**
   * Obter refresh token
   */
  getRefreshToken(): string | null {
    return sessionStorage.getItem('refresh_token')
  }

  /**
   * Verificar se token está expirado
   */
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at')
    if (!expiresAt) return true

    return Date.now() >= parseInt(expiresAt)
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken()
    return !!accessToken && !this.isTokenExpired()
  }

  /**
   * Obter usuário atual do localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * Limpar tokens e dados de autenticação
   */
  private clearTokens(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('teacherflow-token')
    localStorage.removeItem('user')
    localStorage.removeItem('token_expires_at')
    sessionStorage.removeItem('refresh_token')
  }
}

export const authService = new AuthService()

/**
 * Interceptor de fetch para adicionar Auth header automaticamente
 * Também trata refresh automático de token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = authService.getAccessToken()

  // Adicionar Auth header
  const headers = {
    ...options.headers,
    Authorization: accessToken ? `Bearer ${accessToken}` : '',
  } as Record<string, string>

  let response = await fetch(url, {
    ...options,
    headers,
  })

  // Se token expirou (401), tentar renovar
  if (response.status === 401 && authService.getRefreshToken()) {
    try {
      await authService.refreshToken()
      const newAccessToken = authService.getAccessToken()

      // Tentar novamente com novo token
      headers.Authorization = `Bearer ${newAccessToken}`
      response = await fetch(url, {
        ...options,
        headers,
      })
    } catch (error) {
      // Falha ao renovar - fazer logout
      authService.logout()
      window.location.href = '/login'
    }
  }

  return response
}
