import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Form'
import { Card } from '../components/UI'
import { authService, AuthError } from '../services/authService'

interface PasswordStrength {
  hasMinLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
  isStrong: boolean
}

// Validadores de força de senha (mesmo do backend)
const validatePasswordStrength = (password: string): PasswordStrength => {
  return {
    hasMinLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    isStrong: password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }
}

export function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
  })

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)

    // Validar força de senha em tempo real
    if (name === 'password') {
      setPasswordStrength(validatePasswordStrength(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validação básica
      if (!formData.email || !formData.full_name || !formData.password) {
        setError('Todos os campos são obrigatórios')
        setLoading(false)
        return
      }

      if (!formData.email.includes('@')) {
        setError('Email inválido')
        setLoading(false)
        return
      }

      if (formData.full_name.length < 3) {
        setError('Nome deve ter pelo menos 3 caracteres')
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não correspondem')
        setLoading(false)
        return
      }

      if (!passwordStrength?.isStrong) {
        setError('Senha não atende aos requisitos de segurança')
        setLoading(false)
        return
      }

      // Fazer registro
      await authService.register({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
      })

      // Mostrar mensagem de sucesso
      setSuccess(true)

      // Redirecionar ao verify email em 2 segundos
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`)
      }, 2000)
    } catch (err) {
      const authErr = err as AuthError
      setError(authErr.detail || 'Erro ao criar conta')
      console.warn('Register error:', authErr.status)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="space-y-6">
            <div className="text-5xl">✉️</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                Conta criada com sucesso!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enviamos um código de verificação para<br />
                <span className="font-semibold text-blue-600 dark:text-blue-400">{formData.email}</span>
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
              O código é válido por 15 minutos. Verifique também sua pasta de spam.
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Redirecionando para verificação...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              Criar Conta
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Junte-se ao TeacherFlow
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                disabled={loading}
                autoComplete="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nome Completo
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="João Silva"
                disabled={loading}
                autoComplete="name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordStrength && formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Força da senha:
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={passwordStrength.hasMinLength ? '✅' : '❌'}>
                        Mínimo 12 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={passwordStrength.hasUppercase ? '✅' : '❌'}>
                        Letra maiúscula (A-Z)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={passwordStrength.hasLowercase ? '✅' : '❌'}>
                        Letra minúscula (a-z)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={passwordStrength.hasNumber ? '✅' : '❌'}>
                        Número (0-9)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={passwordStrength.hasSpecialChar ? '✅' : '❌'}>
                        Caractere especial (!@#$%...)
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.isStrong
                          ? 'w-full bg-green-500'
                          : 'w-1/2 bg-yellow-500'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Register Button */}
            <Button
              type="submit"
              disabled={loading || !passwordStrength?.isStrong || formData.password !== formData.confirmPassword}
              className="w-full"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 dark:text-gray-400">
            Já tem conta?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Fazer login
            </button>
          </p>

          {/* Security Notice */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            🔒 Dados sempre criptografados. Verificação de email obrigatória.
          </div>
        </div>
      </Card>
    </div>
  )
}
