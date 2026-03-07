import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTheme } from '../hooks/useTheme'
import { Button, Input } from '../components/Form'
import { Sun, Moon, AlertCircle } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { isGoogleOAuthConfigured } from '../config/googleAuth'

// Função para gerar o próximo usuário-teste
const getNextTestUser = () => {
  const lastUser = localStorage.getItem('lastTestUser') || 'user_0000';
  const lastNumber = parseInt(lastUser.split('_')[1]) || 0;
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  const nextUser = `user_${nextNumber}@gmail.com`;
  localStorage.setItem('lastTestUser', `user_${nextNumber}`);
  return nextUser;
};

const TEST_PASSWORD = 'test123'; // Senha padrão para todos os usuários-teste

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login, loginWithGoogle, loginError, setLoginError } = useAuthStore()
  const { isDark, toggleTheme } = useTheme()

  // Auto-preencher com usuário-teste ao carregar
  useEffect(() => {
    const testUser = getNextTestUser();
    setEmail(testUser);
    setPassword(TEST_PASSWORD);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)

    // Validate inputs before sending
    if (!email.trim()) {
      setLoginError({ field: 'email', message: 'Email é obrigatório' })
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setLoginError({ field: 'password', message: 'Senha é obrigatória' })
      setIsLoading(false)
      return
    }

    // Simular delay de autenticação
    setTimeout(() => {
      login(email, password)
      setIsLoading(false)

      // Check if login was successful (no error was set)
      const state = useAuthStore.getState()
      if (state.user) {
        navigate('/')
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 dark:from-blue-900 to-blue-800 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-2"
            title={isDark ? 'Modo claro' : 'Modo escuro'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">TeacherFlow</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Gestão inteligente de aulas</p>
          </div>

          {/* Error Display */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-300">{loginError.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setLoginError(null)
                }}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setLoginError(null)
                }}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                A senha deve ter letras e números (ex: senha123)
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
            <Link
              to="/forgot-password"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Esqueci minha senha
            </Link>
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Criar conta
            </Link>
          </div>

          {/* Google Sign-In */}
          {isGoogleOAuthConfigured() && (
            <>
              <div className="mt-6 flex items-center">
                <div className="flex-1 border-t border-gray-200 dark:border-slate-700"></div>
                <span className="px-4 text-sm text-gray-600 dark:text-gray-400">ou</span>
                <div className="flex-1 border-t border-gray-200 dark:border-slate-700"></div>
              </div>

              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      setIsLoading(true)
                      setTimeout(() => {
                        loginWithGoogle(credentialResponse.credential as string)
                        setIsLoading(false)

                        // Check if login was successful
                        const state = useAuthStore.getState()
                        if (state.user) {
                          navigate('/')
                        }
                      }, 500)
                    }
                  }}
                  onError={() => {
                    setLoginError({
                      field: 'google',
                      message: 'Falha ao fazer login com o Google. Tente novamente.',
                    })
                  }}
                />
              </div>
            </>
          )}

          <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
              <p className="text-center text-xs sm:text-sm text-blue-900 dark:text-blue-200 font-medium">
                🎯 Login automático ativo!
              </p>
              <p className="text-center text-xs text-blue-700 dark:text-blue-300 mt-1">
                Usuário e senha já preenchidos para você testar. Cada login é rastreável (user_0001, user_0002...).
              </p>
            </div>
            <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              👋 Demo: Use qualquer email válido e uma senha com letras e números
            </p>
            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-2">
              Exemplo: user@gmail.com + password123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

