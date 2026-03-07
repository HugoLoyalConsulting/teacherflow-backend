import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '../components/Form'
import { Card } from '../components/UI'
import { AlertCircle, CheckCircle } from 'lucide-react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Call API endpoint /api/v1/auth/forgot-password
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (err) {
      setError('Erro ao enviar email. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 dark:from-blue-900 to-blue-800 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              Esqueci minha senha
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Digite seu email para receber instruções de recuperação
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-300">
                    Email enviado com sucesso!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Verifique sua caixa de entrada para redefinir sua senha.
                  </p>
                </div>
              </div>

              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  Voltar para o login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900 dark:text-red-300">{error}</p>
                </div>
              )}

              <div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
                disabled={isLoading || !email}
              >
                {isLoading ? 'Enviando...' : 'Enviar email de recuperação'}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ← Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
