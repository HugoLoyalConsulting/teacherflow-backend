import { Card, Badge } from '../components/UI'
import { useAppStore } from '../store/appStore'
import { DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { format, isThisMonth, isThisWeek, isBefore, parseISO, startOfYear, startOfMonth, startOfToday, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrencyBR, formatNumberBR } from '../utils/formatters'
import { isPaidStatus, isOpenStatus, isOverdueStatus, isDefaultedStatus, OPEN_STATUSES, OVERDUE_STATUSES, DEFAULTED_STATUSES } from '../utils/paymentStatus'

export const DashboardPage = () => {
  const {
    lessons,
    payments,
    schedules,
    locations,
    students,
    groups,
  } = useAppStore()

  const today = startOfToday()

  // Calcula receita prevista (lessons PLANNED)
  const plannedLessons = lessons.filter((l) => l.status === 'PLANNED' && isThisMonth(parseISO(l.date)))
  const totalExpectedRevenue = plannedLessons.reduce((sum, l) => sum + l.priceSnapshot, 0)

  // Calcula receita realizada (lessons COMPLETED)
  const completedLessons = lessons.filter((l) => l.status === 'COMPLETED' && isThisMonth(parseISO(l.date)))
  const totalRealizedRevenue = completedLessons.reduce((sum, l) => sum + l.priceSnapshot, 0)

  // Calcula pendências deste mês
  const pendingPaymentsThisMonth = payments.filter((p) => OPEN_STATUSES.includes(p.status) && isThisMonth(parseISO(p.dueDate)))
  const totalPending = pendingPaymentsThisMonth.reduce((sum, p) => sum + p.amount, 0)

  // Calcula horas agendadas esta semana
  const thisWeekLessons = lessons.filter((l) => isThisWeek(parseISO(l.date), { weekStartsOn: 1 }))
  const totalHours = thisWeekLessons.reduce((sum, l) => {
    const schedule = schedules.find((s) => s.id === l.scheduleId)
    return sum + (schedule?.durationMinutes || 0) / 60
  }, 0)

  // Financial summary - MTD (Month To Date)
  const mtdStart = startOfMonth(today)
  const mtdPayments = payments.filter((p) => 
    isWithinInterval(parseISO(p.dueDate), { start: mtdStart, end: today })
  )
  const mtdSummary = {
    paid: mtdPayments.filter((p) => isPaidStatus(p.status)).reduce((sum, p) => sum + p.amount, 0),
    pending: mtdPayments
      .filter((p) => OPEN_STATUSES.includes(p.status) && !isBefore(parseISO(p.dueDate), today))
      .reduce((sum, p) => sum + p.amount, 0),
    overdue: mtdPayments
      .filter((p) => 
        (OVERDUE_STATUSES.includes(p.status) || DEFAULTED_STATUSES.includes(p.status))
      )
      .reduce((sum, p) => sum + p.amount, 0),
    get expected() {
      return this.paid + this.pending
    },
  }

  // Financial summary - YTD (Year To Date)
  const ytdStart = startOfYear(today)
  const ytdPayments = payments.filter((p) => 
    isWithinInterval(parseISO(p.dueDate), { start: ytdStart, end: today })
  )
  const ytdSummary = {
    paid: ytdPayments.filter((p) => isPaidStatus(p.status)).reduce((sum, p) => sum + p.amount, 0),
    pending: ytdPayments
      .filter((p) => OPEN_STATUSES.includes(p.status) && !isBefore(parseISO(p.dueDate), today))
      .reduce((sum, p) => sum + p.amount, 0),
    overdue: ytdPayments
      .filter((p) => 
        (OVERDUE_STATUSES.includes(p.status) || DEFAULTED_STATUSES.includes(p.status))
      )
      .reduce((sum, p) => sum + p.amount, 0),
    get expected() {
      return this.paid + this.pending
    },
  }

  // Pagamentos inadimplentes (OVERDUE + DEFAULTED)
  const overduePayments = payments.filter(
    (p) => OVERDUE_STATUSES.includes(p.status) || DEFAULTED_STATUSES.includes(p.status)
  )

  const onboardingSteps = [
    {
      title: 'Cadastrar locais (escolas/academias)',
      hint: 'Comece em Locais para criar escolas, academias ou atendimento online.',
      route: '/locations',
      done: locations.length > 0,
    },
    {
      title: 'Cadastrar alunos',
      hint: 'Depois, registre seus alunos com status e modelo de cobrança.',
      route: '/students',
      done: students.length > 0,
    },
    {
      title: 'Criar turmas',
      hint: 'Se tiver aulas em grupo, crie turmas e defina capacidade/preço.',
      route: '/groups',
      done: groups.length > 0,
    },
    {
      title: 'Montar agenda semanal',
      hint: 'Cadastre os horários das aulas para preencher o calendário.',
      route: '/calendar',
      done: schedules.length > 0,
    },
    {
      title: 'Registrar recebimentos',
      hint: 'Crie pagamentos pendentes e acompanhe o fluxo financeiro.',
      route: '/payments',
      done: payments.length > 0,
    },
  ]

  const completedSteps = onboardingSteps.filter((step) => step.done).length
  const nextStep = onboardingSteps.find((step) => !step.done)
  const onboardingFinished = completedSteps === onboardingSteps.length

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1 sm:mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Visão geral do seu negócio - Mês de {format(new Date(), 'MMMM/yyyy', { locale: ptBR })}</p>
      </div>

      {!onboardingFinished && (
        <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300">Onboarding TeacherFlow</h3>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-400 mt-1">
                Progresso: {completedSteps}/{onboardingSteps.length} etapas concluídas
              </p>
            </div>
            <Badge variant="info">Em andamento</Badge>
          </div>

          <div className="mt-4 space-y-2">
            {onboardingSteps.map((step, index) => (
              <div key={step.title} className="flex items-start gap-3 text-xs sm:text-sm">
                <span className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${step.done ? 'bg-green-600 text-white' : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300'}`}>
                  {step.done ? '✓' : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${step.done ? 'text-green-800 dark:text-green-300' : 'text-blue-900 dark:text-blue-300'}`}>{step.title}</p>
                  {!step.done && <p className="text-blue-800 dark:text-blue-400 line-clamp-1">{step.hint}</p>}
                </div>
              </div>
            ))}
          </div>

          {nextStep && (
            <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-300 mt-4 font-medium">
              Próximo: {nextStep.title}
            </p>
          )}
        </Card>
      )}

      {/* Alertas */}
      {overduePayments.length > 0 && (
        <Card className="border-l-4 border-l-red-500 dark:border-l-red-400 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-300">Pagamentos Inadimplentes</h3>
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-400">
                Você tem {overduePayments.length} pagamento(s) inadimplente(s) no valor de R${' '}
                {formatCurrencyBR(overduePayments.reduce((sum, p) => sum + p.amount, 0)).replace('R$', '').trim()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Resumo Financeiro YTD/MTD - Precisão Cirúrgica */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
          📊 Resumo Financeiro Detalhado (YTD / MTD)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* YTD */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              YTD (Year To Date) - {format(ytdStart, 'dd/MM/yyyy', { locale: ptBR })} até hoje
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium">✅ Pagos</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-200">{formatCurrencyBR(ytdSummary.paid)}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">📅 A Receber</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-200">{formatCurrencyBR(ytdSummary.pending)}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">🚨 Inadimplentes</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-200">{formatCurrencyBR(ytdSummary.overdue)}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">💰 Total Esperado</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-200">{formatCurrencyBR(ytdSummary.expected)}</p>
              </div>
            </div>
          </div>

          {/* MTD */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              MTD (Month To Date) - {format(mtdStart, 'dd/MM/yyyy', { locale: ptBR })} até hoje
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium">✅ Pagos</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-200">{formatCurrencyBR(mtdSummary.paid)}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">📅 A Receber</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-200">{formatCurrencyBR(mtdSummary.pending)}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">🚨 Inadimplentes</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-200">{formatCurrencyBR(mtdSummary.overdue)}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">💰 Total Esperado</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-200">{formatCurrencyBR(mtdSummary.expected)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          icon={<TrendingUp className="w-6 sm:w-8 h-6 sm:h-8" />}
          title="Receita Prevista (Mês)"
          value={totalExpectedRevenue}
          color="blue"
        />
        <MetricCard
          icon={<DollarSign className="w-6 sm:w-8 h-6 sm:h-8" />}
          title="Receita Realizada (Mês)"
          value={totalRealizedRevenue}
          color="green"
        />
        <MetricCard
          icon={<AlertCircle className="w-6 sm:w-8 h-6 sm:h-8" />}
          title="Pendências"
          value={totalPending}
          color="orange"
        />
        <MetricCard
          icon={<Clock className="w-6 sm:w-8 h-6 sm:h-8" />}
          title="Horas Agendadas (Semana)"
          value={totalHours}
          color="purple"
          isCurrency={false}
        />
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Aulas Planejadas Esta Semana">
          {thisWeekLessons.length === 0 ? (
            <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">Nenhuma aula agendada esta semana</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {thisWeekLessons.map((lesson) => {
                const schedule = schedules.find((s) => s.id === lesson.scheduleId)
                return (
                  <div key={lesson.id} className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-50">{format(parseISO(lesson.date), 'EEEE, dd MMM', { locale: ptBR })}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{schedule?.startTime} • {schedule?.durationMinutes} min</p>
                    </div>
                    <Badge variant="info" className="flex-shrink-0">{formatCurrencyBR(lesson.priceSnapshot)}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card title="Pagamentos Pendentes">
          {pendingPaymentsThisMonth.length === 0 ? (
            <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">Todos os pagamentos em dia!</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {pendingPaymentsThisMonth.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-50">{students.find((s) => s.id === payment.studentId)?.name || `Aluno ${payment.studentId.split('-')[1]}`}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Vencimento: {format(parseISO(payment.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant={isOverdueStatus(payment.status) || isDefaultedStatus(payment.status) ? 'danger' : 'warning'} className="flex-shrink-0">
                    {isDefaultedStatus(payment.status) || isOverdueStatus(payment.status) ? (
                      <span className="mr-1">⚠️</span>
                    ) : OPEN_STATUSES.includes(payment.status) ? (
                      <span className="mr-1">⏳</span>
                    ) : null}
                    {formatCurrencyBR(payment.amount)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: number
  color: 'blue' | 'green' | 'orange' | 'purple'
  isCurrency?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, color, isCurrency = true }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  }

  return (
    <Card className={colorClasses[color]}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
            {isCurrency ? formatCurrencyBR(value) : formatNumberBR(value, 1)}
          </p>
        </div>
        <div className="text-2xl sm:text-3xl opacity-20 flex-shrink-0">{icon}</div>
      </div>
    </Card>
  )
}
