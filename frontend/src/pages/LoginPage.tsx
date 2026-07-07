import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon, AlertCircle, CheckCircle, Eye, EyeOff, LogIn } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { isGoogleOAuthConfigured } from '../config/googleAuth'
import { authService, AuthError } from '../services/authService'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registerMessage, setRegisterMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, loginWithGoogle, loginError, setLoginError } = useAuthStore()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const prefilledEmail = params.get('email')
    const registered = params.get('registered')
    if (prefilledEmail) setEmail(prefilledEmail)
    if (registered === '1') setRegisterMessage('Conta criada com sucesso. Faça login para continuar.')
    else setRegisterMessage(null)
  }, [location.search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setLoginError({ field: 'email', message: 'Email é obrigatório' }); return }
    if (!password.trim()) { setLoginError({ field: 'password', message: 'Senha é obrigatória' }); return }

    setIsLoading(true)
    setLoginError(null)
    try {
      const response = await authService.login({ email: email.trim(), password })
      setUser({
        id: response.user.id,
        name: response.user.full_name,
        email: response.user.email,
        role: 'OWNER',
        tenantId: response.user.id,
        onboardingComplete: false,
        lessonTypes: [],
      })
      navigate('/')
    } catch (err) {
      const authErr = err as AuthError
      setLoginError({ field: 'form', message: authErr.detail || 'Falha ao autenticar. Verifique email e senha.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      style={{ background: 'var(--gradient-bg-dark)' }}
    >
      {/* Orbs decorativos */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'orb-drift-a 20s ease-in-out infinite' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'orb-drift-b 26s ease-in-out infinite' }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)', filter: 'blur(50px)' }} />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
          title={isDark ? 'Modo claro' : 'Modo escuro'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Card principal */}
      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'var(--gradient-primary)', boxShadow: '0 8px 32px rgba(99,102,241,0.45)' }}>
            <span className="text-white text-2xl font-black">TF</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-1 tracking-tight">TeacherFlow</h1>
          <p className="text-white/50 text-sm">Gestão inteligente de aulas</p>
        </div>

        {/* Glass Form */}
        <div
          className="rounded-3xl p-6 sm:p-8"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.08) inset',
          }}
        >
          {/* Mensagens */}
          {registerMessage && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-300">{registerMessage}</p>
            </div>
          )}

          {loginError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/25">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{loginError.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setRegisterMessage(null); setLoginError(null) }}
                disabled={isLoading}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 text-sm transition-all duration-200 focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide">Senha</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Esqueceu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setRegisterMessage(null); setLoginError(null) }}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-white placeholder-white/30 text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
                ...((!isLoading && email && password) ? { transform: 'translateY(0)' } : {}),
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.6)' }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.45)' }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Google Sign-In */}
          {isGoogleOAuthConfigured() && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/40">ou continue com</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      setIsLoading(true)
                      setTimeout(() => {
                        loginWithGoogle(credentialResponse.credential as string)
                        setIsLoading(false)
                        if (useAuthStore.getState().user) navigate('/')
                      }, 500)
                    }
                  }}
                  onError={() => setLoginError({ field: 'google', message: 'Falha ao fazer login com o Google.' })}
                />
              </div>
            </>
          )}

          {/* Rodapé */}
          <p className="mt-6 text-center text-sm text-white/40">
            Não tem conta?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Criar agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
