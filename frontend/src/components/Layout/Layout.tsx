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
    <div className="flex h-screen bg-white dark:bg-slate-950">
      {/* Sidebar - Desktop Only */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 flex-col hidden md:flex`}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
          <button 
            onClick={() => navigate('/')}
            className="font-bold text-lg sm:text-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors w-full text-left"
            title="Ir para o Dashboard"
          >
            {sidebarOpen ? 'TeacherFlow' : 'TF'}
          </button>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              id={item.id}
              icon={item.emoji}
              label={item.label}
              href={item.href}
              collapsed={!sidebarOpen}
              onClick={() => navigate(item.href)}
            />
          ))}
        </nav>

        <div className="border-t border-gray-200 dark:border-slate-700 p-3 sm:p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex justify-center dark:text-gray-300"
            title={sidebarOpen ? 'Fechar' : 'Abrir'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Desktop Only */}
        <header className="hidden md:flex bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-8 py-3 sm:py-4 flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">TeacherFlow</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Gestão inteligente de aulas</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Mock Mode Selector - Top Right */}
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => loadMockMode('demo')}
                className={`px-3 py-1 text-xs sm:text-sm font-medium rounded transition-colors ${
                  mockMode === 'demo'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
                title="Carregar modo demo com dados de exemplo"
              >
                Demo
              </button>
              <button
                onClick={() => loadMockMode('empty')}
                className={`px-3 py-1 text-xs sm:text-sm font-medium rounded transition-colors ${
                  mockMode === 'empty'
                    ? 'bg-gray-400 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
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
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="Perfil e configurações"
              >
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-20">
                    <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                      <p className="font-semibold text-gray-900 dark:text-gray-50 truncate text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          navigate('/profile')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <User className="w-4 h-4" />
                        Perfil
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          navigate('/settings')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-700 py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-2 flex justify-between items-center">
          <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">TeacherFlow</h2>
          <div className="flex items-center gap-2">
            {/* Mock Mode Selector - Mobile */}
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded p-1">
              <button
                onClick={() => loadMockMode('demo')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  mockMode === 'demo'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Demo
              </button>
              <button
                onClick={() => loadMockMode('empty')}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  mockMode === 'empty'
                    ? 'bg-gray-400 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Vazio
              </button>
            </div>
            
            {/* Profile Dropdown - Mobile */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                title="Perfil"
              >
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-20">
                    <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                      <p className="font-semibold text-gray-900 dark:text-gray-50 truncate text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          navigate('/profile')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <User className="w-4 h-4" />
                        Perfil
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          navigate('/settings')
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-700 py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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

        {/* Content */}
        <main ref={mainContentRef} className="flex-1 overflow-auto pb-20 md:pb-0">
          <OnboardingTourWrapper>
            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
          </OnboardingTourWrapper>
        </main>

        {/* Bottom Navigation - Mobile Only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 z-50">
          <div className="grid grid-cols-6 h-16">
            {mobileBottomTabs.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span className={`text-[9px] font-medium leading-tight ${isActive ? 'font-semibold' : ''}`}>
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
  onClick: () => void
}

const NavLink: FC<NavLinkProps> = ({ id, icon, label, collapsed, onClick }) => (
  <button
    id={id}
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs sm:text-sm"
    title={label}
  >
    <span className="text-lg sm:text-xl flex-shrink-0">{icon}</span>
    {!collapsed && <span className="font-medium">{label}</span>}
  </button>
)
