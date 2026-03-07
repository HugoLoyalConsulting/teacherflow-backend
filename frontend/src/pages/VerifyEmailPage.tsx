import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Form'
import { Card } from '../components/UI'
import { authService, AuthError } from '../services/authService'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get('email')

  const [email] = useState(emailParam || '')
  const [otp, setOtp] = useState('')
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (value: string) => {
    // Aceitar apenas 6 dígitos
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setOtp(cleaned)
    setError(null)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!email) {
        setError('Email não encontrado')
        setLoading(false)
        return
      }

      if (!otp || otp.length !== 6) {
        setError('Digite um código válido (6 dígitos)')
        setLoading(false)
        return
      }

      // Verificar email
      await authService.verifyEmail({
        email: email,
        code: otp,
      })

      setSuccess(true)

      // Redirecionar ao login em 2 segundos
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      const authErr = err as AuthError
      setError(authErr.detail || 'Código inválido ou expirado')
      console.warn('Verify error:', authErr.status)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError(null)

    try {
      if (!email) {
        setError('Email não encontrado')
        setResendLoading(false)
        return
      }

      await authService.resendOTP(email)

      // Resetar timer e cooldown
      setTimeLeft(15 * 60)
      setResendCooldown(60) // 60 segundos de cooldown

      const cooldownInterval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 0) {
            clearInterval(cooldownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      const authErr = err as AuthError
      setError(authErr.detail || 'Erro ao reenviar código')
      console.warn('Resend error:', authErr.status)
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="space-y-6">
            <div className="text-5xl">✅</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                Email verificado!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sua conta foi ativada com sucesso
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Redirecionando para login...
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
              Verificar Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Digite o código que enviamos para<br />
              <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4" noValidate>
            {/* Email Input (hidden, readonly) */}
            <input
              type="hidden"
              value={email}
            />

            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Código de Verificação
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                placeholder="000000"
                disabled={loading || timeLeft === 0}
                autoComplete="off"
                className="w-full text-center text-3xl tracking-widest px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                Apenas números. O código é válido por 15 minutos.
              </p>
            </div>

            {/* Timer */}
            <div className={`p-3 rounded-lg text-center font-mono text-sm ${
              timeLeft > 300 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
              timeLeft > 60 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
              'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              ⏱️ Tempo restante: {formatTime(timeLeft)}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={loading || otp.length !== 6 || timeLeft === 0}
              className="w-full"
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </Button>

            {/* Resend Button */}
            <Button
              type="button"
              variant="secondary"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0 || timeLeft === 0}
              className="w-full"
            >
              {resendLoading ? 'Reenviando...' : 
               resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 
               'Reenviar Código'}
            </Button>
          </form>

          {/* Email Timeout Warning */}
          {timeLeft === 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm font-semibold mb-2">
                ⚠️ Código expirado
              </p>
              <p className="text-red-600 dark:text-red-400 text-xs mb-3">
                O código era válido por 15 minutos. Solicite um novo código.
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full text-sm"
              >
                {resendLoading ? 'Reenviando...' : 'Enviar novo código'}
              </Button>
            </div>
          )}

          {/* Help */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="mb-2">Não recebeu o código?</p>
            <ul className="space-y-1 text-left ml-4 list-disc">
              <li>Verifique sua pasta de spam</li>
              <li>Aguarde alguns segundos e recarregue</li>
              <li>Clique em "Reenviar Código"</li>
            </ul>
          </div>

          {/* Back to Login */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            Já tem código?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Voltar ao login
            </button>
          </p>

          {/* Security Notice */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            🔒 Código validado apenas uma vez. Uso seguro.
          </div>
        </div>
      </Card>
    </div>
  )
}
