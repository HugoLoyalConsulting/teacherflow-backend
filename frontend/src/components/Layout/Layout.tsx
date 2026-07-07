import { ReactNode, FC, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Home, Users, Calendar, DollarSign, MapPin, GraduationCap, User, Settings, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { OnboardingTourWrapper } from '../OnboardingTourWrapper'

interface LayoutProps {
  children: ReactNode
}

const menuItems = [
  { id: 'nav-menu', icon: Home, emoji: '📊', label: 'Dashboard', shortLabel: 'Home', href: '/' },
  { id: 'nav-calendar', icon: Calendar, emoji: '📅', label: 'Calendário', shortLabel: 'Agenda', href: '/calendar' },
  { id: 'nav-payments', icon: DollarSign, emoji: '💰', label: 'Recebimentos', shortLabel: 'Pag.', href: '/payments' },
  { id: 'nav-locations', icon: MapPin, emoji: '📍', label: 'Locais', shortLabel: 'Locais', href: '/locations' },
  { id: 'nav-groups', icon: GraduationCap, emoji: '👨‍🎓', label: 'Turmas', shortLabel: 'Turmas', href: '/groups' },
  { id: 'nav-students', icon: Users, emoji: '👥', label: 'Alunos', shortLabel: 'Alunos', href: '/students' },
]

const mobileBottomTabs = menuItems.slice(0, 6)

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const mainContentRef = useRef<HTMLElement | null>(null)
  const { user, logout } = useAuthStore()
  const { mockMode, loadMockMode } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } glass-sidebar transition-all duration-300 flex-col hidden md:flex flex-shrink-0 z-20`}
      >
        <div className="p-4 sm:p-6 border-b border-white/30 dark:border-white/06">
          <button
            onClick={() => navigate('/')}
            className="font-extrabold text-lg sm:text-xl w-full text-left transition-opacity hover:opacity-80"
            title="Ir para o Dashboard"
            style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {sidebarOpen ? 'TeacherFlow' : 'TF'}
          </button>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              id={item.id}
              icon={item.emoji}
              label={item.label}
              href={item.href}
              collapsed={!sidebarOpen}
              active={location.pathname === item.href}
              onClick={() => navigate(item.href)}
            />
          ))}
        </nav>

        <div className="border-t border-white/30 dark:border-white/06 p-3 sm:p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 rounded-xl hover:bg-white/30 dark:hover:bg-white/08 flex justify-center text-gray-500 dark:text-gray-400 transition-colors"
            title={sidebarOpen ? 'Fechar' : 'Abrir'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Desktop Only */}
        <header className="hidden md:flex glass-header px-4 sm:px-8 py-3 sm:py-4 flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 z-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">TeacherFlow</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Gestão inteligente de aulas</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Mock Mode Selector - Top Right */}
            <div className="flex gap-1 bg-black/06 dark:bg-white/06 backdrop-blur-sm rounded-xl p-1 flex-shrink-0 border border-white/40 dark:border-white/06">
              <button
                onClick={() => loadMockMode('demo')}
                className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  mockMode === 'demo'
                    ? 'btn-gradient'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/08'
                }`}
                title="Carregar modo demo com dados de exemplo"
              >
                Demo
              </button>
              <button
                onClick={() => loadMockMode('empty')}
                className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  mockMode === 'empty'
                    ? 'bg-slate-400 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/08'
                }`}
                title="Carregar modo vazio"
              >
                Vazio
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/08 transition-colors border border-transparent hover:border-white/40 dark:hover:border-white/10"
                title="Perfil e configurações"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--gradient-primary)' }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl z-20 overflow-hidden">
                    <div className="p-3 border-b border-white/30 dark:border-white/06">
                      <p className="font-semibold text-gray-900 dark:text-gray-50 truncate text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          navigate('/profile')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/06 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Perfil
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          navigate('/settings')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/06 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </button>
                    </div>
                    <div className="border-t border-white/30 dark:border-white/06 py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/15 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Header - Compact */}
        <header className="md:hidden glass-header px-4 py-2 flex justify-between items-center z-10">
          <h2
            className="text-lg font-extrabold"
            style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            TeacherFlow
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-black/05 dark:bg-white/06 rounded-lg p-0.5 border border-white/40 dark:border-white/06">
              <button
                onClick={() => loadMockMode('demo')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                  mockMode === 'demo' ? 'btn-gradient' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Demo
              </button>
              <button
                onClick={() => loadMockMode('empty')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                  mockMode === 'empty' ? 'bg-slate-400 text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Vazio
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="p-1.5 rounded-xl hover:bg-white/40 dark:hover:bg-white/08 transition-colors"
                title="Perfil"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--gradient-primary)' }}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 glass-card rounded-2xl z-20 overflow-hidden">
                    <div className="p-3 border-b border-white/30 dark:border-white/06">
                      <p className="font-semibold text-gray-900 dark:text-gray-50 truncate text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setProfileDropdownOpen(false); navigate('/profile') }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/06">
                        <User className="w-4 h-4" /> Perfil
                      </button>
                      <button onClick={() => { setProfileDropdownOpen(false); navigate('/settings') }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/06">
                        <Settings className="w-4 h-4" /> Configurações
                      </button>
                    </div>
                    <div className="border-t border-white/30 dark:border-white/06 py-1">
                      <button onClick={() => { setProfileDropdownOpen(false); handleLogout() }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/15">
                        <LogOut className="w-4 h-4" /> Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main ref={mainContentRef} className="flex-1 overflow-auto pb-20 md:pb-0 relative z-0">
          <OnboardingTourWrapper>
            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
          </OnboardingTourWrapper>
        </main>

        {/* Bottom Navigation - Mobile Only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-header border-t z-50" style={{ borderTop: '1px solid rgba(255,255,255,0.25)' }}>
          <div className="grid grid-cols-6 h-16">
            {mobileBottomTabs.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  title={item.label}
                >
                  {isActive && (
                    <span className="absolute inset-x-0 top-0 h-0.5 mx-4 rounded-b-full" style={{ background: 'var(--gradient-primary)' }} />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span className={`text-[9px] font-medium leading-tight ${isActive ? 'font-bold' : ''}`}>
                    {item.shortLabel || item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

interface NavLinkProps {
  id: string
  icon: string
  label: string
  href: string
  collapsed: boolean
  active?: boolean
  onClick: () => void
}

const NavLink: FC<NavLinkProps> = ({ id, icon, label, collapsed, active, onClick }) => (
  <button
    id={id}
    onClick={onClick}
    className={`nav-item w-full ${active ? 'active' : ''}`}
    title={label}
  >
    <span className="text-lg sm:text-xl flex-shrink-0">{icon}</span>
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </button>
)
