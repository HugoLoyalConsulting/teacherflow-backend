import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, Sparkles, Crown, Zap } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'
import { config } from '../config/env'

interface PlanFeature {
  name: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  tier_key: string
  price_monthly_brl: number
  price_yearly_brl: number
  description: string
  icon: React.ReactNode
  color: string
  features: PlanFeature[]
  max_students: number | null
  max_groups: number | null
  max_locations: number | null
  popular?: boolean
}

export const UpgradePage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const isQA = config.isQaEnvironment || config.isDevelopment

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/subscriptions/tiers')
      
      // Map plans with icons and colors
      const plansData = response.data.map((plan: any) => ({
        ...plan,
        icon: plan.tier_key === 'free' ? <Sparkles /> : plan.tier_key === 'pro' ? <Zap /> : <Crown />,
        color: plan.tier_key === 'free' ? 'gray' : plan.tier_key === 'pro' ? 'blue' : 'purple',
        popular: plan.tier_key === 'pro',
        features: [
          { name: `${plan.max_students ?? '∞'} alunos`, included: true },
          { name: `${plan.max_groups ?? '∞'} turmas`, included: true },
          { name: `${plan.max_locations ?? '∞'} locais`, included: true },
          { name: 'Agenda completa', included: true },
          { name: 'Controle de pagamentos', included: true },
          { name: 'Relatórios', included: plan.tier_key !== 'free' },
          { name: 'Exportar dados (CSV/Excel)', included: plan.tier_key !== 'free' },
          { name: 'Suporte prioritário', included: plan.tier_key === 'pro' || plan.tier_key === 'premium' },
          { name: 'WhatsApp automático', included: plan.tier_key === 'premium' },
        ]
      }))
      
      setPlans(plansData)
    } catch (error) {
      console.error('Failed to load plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = async (tierKey: string) => {
    try {
      setSelectedPlan(tierKey)

      const payload: any = {
        tier_key: tierKey,
      }

      if (tierKey !== 'free') {
        payload.trial_days = 7
      }

      await api.post('/subscriptions/create', payload)

      // Redirect to app home
      navigate('/')
    } catch (error) {
      console.error('Failed to create subscription:', error)
      alert('Erro ao criar assinatura. Tente novamente.')
      setSelectedPlan(null)
    }
  }

  const handleSkip = () => {
    // Allow skipping paywall in QA, but not in production
    if (isQA) {
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            🎉 Bem-vindo ao TeacherFlow, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Escolha o melhor plano para gerenciar suas aulas
          </p>
          <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
            ✨ 7 dias de teste grátis em qualquer plano pago!
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg bg-white dark:bg-slate-800 p-1 shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => {
            const monthlyPrice = Number(plan.price_monthly_brl || 0)
            const yearlyPrice = Number(plan.price_yearly_brl || 0)
            const price = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice
            const colorClasses = {
              gray: 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800',
              blue: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg scale-105',
              purple: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
            }

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 transition-all hover:shadow-2xl ${colorClasses[plan.color as keyof typeof colorClasses]}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Mais Popular
                  </div>
                )}

                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    plan.color === 'gray' ? 'bg-gray-200 dark:bg-slate-700' :
                    plan.color === 'blue' ? 'bg-blue-600' : 'bg-purple-600'
                  } text-white`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    {plan.name}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  {price === 0 ? (
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-50">
                      Grátis
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-gray-900 dark:text-gray-50">
                        R$ {price.toFixed(2)}
                        <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                          /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Economize R$ {(monthlyPrice * 12 - yearlyPrice).toFixed(2)}/ano
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.tier_key)}
                  disabled={selectedPlan === plan.tier_key}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    plan.color === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : plan.color === 'purple'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {selectedPlan === plan.tier_key ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Ativando...
                    </span>
                  ) : plan.tier_key === 'free' ? (
                    'Começar Grátis'
                  ) : (
                    'Testar 7 Dias Grátis'
                  )}
                </button>

                {plan.tier_key !== 'free' && (
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Sem compromisso. Cancele quando quiser.
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Skip button (only in QA) */}
        {isQA && (
          <div className="text-center">
            <button
              onClick={handleSkip}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
            >
              Pular por enquanto (apenas em QA)
            </button>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Mais de 1.000 professores já confiam no TeacherFlow
          </p>
          <div className="flex justify-center gap-6 text-gray-500 dark:text-gray-500">
            <span>🔒 Pagamento Seguro</span>
            <span>📱 Suporte 24/7</span>
            <span>✅ Garantia 30 dias</span>
          </div>
        </div>
      </div>
    </div>
  )
}
