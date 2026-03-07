import { Card, Badge } from '../components/UI'
import { useTheme } from '../hooks/useTheme'
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Button } from '../components/Form'
import { Check } from 'lucide-react'

interface SubscriptionTier {
  id: string
  tier_key: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number
  max_students: number | null
  max_users: number
  max_locations: number | null
  max_groups: number | null
  features: Record<string, boolean>
}

export const SettingsPage = () => {
  const { isDark, theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme()
  const [tiers, setTiers] = useState<SubscriptionTier[]>([])
  const [currentTierKey, setCurrentTierKey] = useState<string>('free')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTiers()
  }, [])

  const loadTiers = async () => {
    try {
      const response = await api.get('/api/v1/subscriptions/tiers')
      // Ensure tiers is always an array
      const tiersData = Array.isArray(response.data) ? response.data : response.data?.tiers || []
      setTiers(tiersData)
      console.log('Loaded tiers:', tiersData)
      
      // Try to get current subscription
      try {
        const currentResponse = await api.get('/api/v1/subscriptions/current')
        if (currentResponse.data?.subscription?.tier?.tier_key) {
          setCurrentTierKey(currentResponse.data.subscription.tier.tier_key)
        }
      } catch (err) {
        console.log('No current subscription, using free tier')
        setCurrentTierKey('free')
      }
    } catch (error) {
      console.error('Failed to load tiers:', error)
      setTiers([])
    }
  }

  const handleSelectPlan = async (tierKey: string) => {
    if (tierKey === currentTierKey) return
    
    setLoading(true)
    try {
      await api.post('/api/v1/subscriptions/create', { tier_key: tierKey })
      setCurrentTierKey(tierKey)
      alert(`Plano ${tierKey.toUpperCase()} ativado com sucesso!`)
    } catch (error) {
      alert('Erro ao mudar plano. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400">Preferências do sistema</p>
      </div>

      <div className="max-w-2xl">
        {/* Dark Mode */}
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

        {/* Subscription Plans */}
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Plano de Assinatura</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Escolha o plano que melhor atende suas necessidades.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {Array.isArray(tiers) && tiers.length > 0 ? (
              tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative rounded-xl border-2 p-6 transition-all ${
                    tier.tier_key === currentTierKey
                      ? 'border-vaporwave-purple dark:border-vaporwave-cyan bg-purple-50 dark:bg-slate-800'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  {tier.tier_key === currentTierKey && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="success">Plano Atual</Badge>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">{tier.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{tier.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                        R$ {tier.price_monthly}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">/mês</span>
                    </div>
                    {tier.price_yearly > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        R$ {tier.price_yearly}/ano (economize {Math.round((1 - tier.price_yearly / (tier.price_monthly * 12)) * 100)}%)
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {tier.max_students ? `Até ${tier.max_students} alunos` : 'Alunos ilimitados'}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {tier.max_locations ? `Até ${tier.max_locations} locais` : 'Locais ilimitados'}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {tier.max_groups ? `Até ${tier.max_groups} turmas` : 'Turmas ilimitadas'}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {tier.max_users} usuário{tier.max_users > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant={tier.tier_key === currentTierKey ? 'secondary' : 'primary'}
                    className="w-full"
                    onClick={() => handleSelectPlan(tier.tier_key)}
                    disabled={loading || tier.tier_key === currentTierKey}
                  >
                    {tier.tier_key === currentTierKey ? 'Plano Atual' : 'Selecionar'}
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {tiers === undefined || tiers.length === 0 ? 'Carregando planos...' : 'Nenhum plano disponível'}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
