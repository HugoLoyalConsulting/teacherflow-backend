import { Card, Badge } from '../components/UI'
import { useTheme } from '../hooks/useTheme'

export const SettingsPage = () => {
  const { isDark, theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400">Preferências do sistema</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-50">Dark Mode</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Escolha a aparência do aplicativo. O modo Sistema ajusta automaticamente conforme as preferências do seu dispositivo.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={setLightTheme}
              className={`w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">☀️</div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-50">Claro</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Interface com fundo claro</p>
                </div>
              </div>
              {theme === 'light' && <Badge variant="success">Ativo</Badge>}
            </button>

            <button
              onClick={setDarkTheme}
              className={`w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🌙</div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-50">Escuro</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Interface com fundo escuro</p>
                </div>
              </div>
              {theme === 'dark' && <Badge variant="success">Ativo</Badge>}
            </button>

            <button
              onClick={setSystemTheme}
              className={`w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                theme === 'system'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">💻</div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-50">Sistema</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Segue as preferências do dispositivo</p>
                </div>
              </div>
              {theme === 'system' && <Badge variant="success">Ativo</Badge>}
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              Status atual: {theme === 'system' ? `Sistema (${isDark ? 'Escuro' : 'Claro'})` : theme === 'dark' ? 'Escuro' : 'Claro'}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              {theme === 'system' 
                ? 'A aparência muda automaticamente conforme as configurações do seu dispositivo.' 
                : 'A aparência está fixada no modo escolhido.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
