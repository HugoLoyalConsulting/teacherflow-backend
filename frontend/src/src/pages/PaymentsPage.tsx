import { useMemo, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useTheme } from '../hooks/useTheme'
import { Card, Badge } from '../components/UI'
import { Button } from '../components/Form'
import {
  addDays,
  subDays,
  subWeeks,
  subMonths,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  endOfDay,
  startOfMonth,
  startOfToday,
  startOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrencyBR } from '../utils/formatters'
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts'
import { getDataGenerationWindow } from '../utils/dataGenerationWindow'
import { isDefaultedStatus, isOpenStatus, isOverdueStatus, isPaidStatus, OPEN_STATUSES, OVERDUE_STATUSES, DEFAULTED_STATUSES } from '../utils/paymentStatus'

type PaymentView = 'PENDING' | 'FUTURE' | 'ALL'
type ChartGranularity = 'DAY' | 'WEEK' | 'MONTH'
type ChartStatusFilter = 'TOTAL' | 'PAID' | 'DEFAULTED' | 'OVERDUE' | 'FUTURE'

const chartStatusConfig = {
  PAID: { label: 'Pago', color: '#22c55e' },
  PARTIALLY_PAID: { label: 'Parcial', color: '#14b8a6' },
  RENEGOTIATED: { label: 'Renegociado', color: '#3b82f6' },
  PENDING: { label: 'Pendente', color: '#f59e0b' },
  OVERDUE: { label: 'Vencido', color: '#ef4444' },
  DEFAULTED: { label: 'Inadimplente', color: '#7c3aed' },
} as const

const chartStatusKeys = Object.keys(chartStatusConfig) as Array<keyof typeof chartStatusConfig>

type ChartBucket = {
  name: string
  total: number
} & Record<keyof typeof chartStatusConfig, number>

export const PaymentsPage = () => {
  const { payments, students, markPaymentAsPaid } = useAppStore()
  const { isDark } = useTheme()
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [view, setView] = useState<PaymentView>('ALL')
  const [chartStatusFilter, setChartStatusFilter] = useState<ChartStatusFilter>('TOTAL')
  const [chartGranularity, setChartGranularity] = useState<ChartGranularity>('MONTH')
  const [chartWindowSize, setChartWindowSize] = useState(12)
  
  const dataWindow = getDataGenerationWindow()

  const today = startOfToday()

  const monthDate = useMemo(() => {
    const [year, month] = filterMonth.split('-').map(Number)
    return new Date(year, month - 1, 1)
  }, [filterMonth])

  const filteredPayments = payments.filter((p) => {
    const dueDate = parseISO(p.dueDate)

    const matchPeriod =
      view === 'ALL'
        ? true
        : view === 'PENDING'
          ? OPEN_STATUSES.includes(p.status)
          : !isBefore(dueDate, today)

    const matchMonth = isSameMonth(dueDate, monthDate)
    return matchMonth && matchPeriod
  })

  const summary = {
    paid: filteredPayments
      .filter((p) => isPaidStatus(p.status))
      .reduce((sum, p) => sum + p.amount, 0),
    overdue: filteredPayments
      .filter((p) => OVERDUE_STATUSES.includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0),
    defaulted: filteredPayments
      .filter((p) => DEFAULTED_STATUSES.includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0),
    future: filteredPayments
      .filter((p) => !isBefore(parseISO(p.dueDate), today))
      .reduce((sum, p) => sum + p.amount, 0),
    total: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
  }

  // Contar alunos com pagamentos pendentes no mês
  const studentsWithPendingPayments = new Set(
    filteredPayments
      .filter((p) => isOpenStatus(p.status))
      .map((p) => p.studentId)
  ).size

  const monthStart = startOfMonth(monthDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarDays = Array.from({ length: 42 }, (_, i) => addDays(calendarStart, i))

  const getDayTotal = (date: Date) =>
    filteredPayments
      .filter((payment) => isSameDay(parseISO(payment.dueDate), date))
      .reduce((sum, payment) => sum + payment.amount, 0)

  const daysWithPayments = calendarDays
    .map((date) => {
      const entries = filteredPayments
        .filter((payment) => isSameDay(parseISO(payment.dueDate), date))
        .map((payment) => ({
          ...payment,
          studentName: students.find((s) => s.id === payment.studentId)?.name || `Aluno ${payment.studentId.split('-')[1]}`,
        }))

      const total = entries.reduce((sum, payment) => sum + payment.amount, 0)
      return { date, entries, total }
    })
    .filter((day) => day.total > 0 && isSameMonth(day.date, monthDate))

  const selectedMonthTotal = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

  const getStudentName = (studentId: string) => {
    return students.find((s) => s.id === studentId)?.name || `Aluno ${studentId.split('-')[1]}`
  }

  const formatCompactCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)

  const chartRangeStart = useMemo(() => {
    const todayDate = new Date()
    if (chartGranularity === 'DAY') return startOfDay(subDays(todayDate, Math.max(chartWindowSize - 1, 0)))
    if (chartGranularity === 'WEEK') return startOfDay(subWeeks(todayDate, Math.max(chartWindowSize - 1, 0)))
    return startOfDay(subMonths(todayDate, Math.max(chartWindowSize - 1, 0)))
  }, [chartGranularity, chartWindowSize])

  const chartRangeEnd = endOfDay(new Date())

  const chartWindowOptions = useMemo(() => {
    if (chartGranularity === 'DAY') return [7, 14, 30]
    if (chartGranularity === 'WEEK') return [4, 8, 12, 24]
    return [3, 6, 12, 18]
  }, [chartGranularity])

  // Calcular dados do gráfico agrupado por período temporal e status
  const chartData = useMemo(() => {
    const buckets: Record<string, ChartBucket> = {}

    // Gerar períodos baseados na granularidade
    let periods: Date[] = []
    if (chartGranularity === 'DAY') {
      periods = eachDayOfInterval({ start: chartRangeStart, end: chartRangeEnd })
    } else if (chartGranularity === 'WEEK') {
      periods = eachWeekOfInterval({ start: chartRangeStart, end: chartRangeEnd }, { weekStartsOn: 1 })
    } else {
      periods = eachMonthOfInterval({ start: chartRangeStart, end: chartRangeEnd })
    }

    // Inicializar buckets para cada período
    periods.forEach((periodStart) => {
      let periodLabel: string

      if (chartGranularity === 'DAY') {
        periodLabel = format(periodStart, 'dd/MM', { locale: ptBR })
      } else if (chartGranularity === 'WEEK') {
        periodLabel = format(periodStart, "'Sem' w", { locale: ptBR })
      } else {
        periodLabel = format(periodStart, "MMM/yy", { locale: ptBR })
      }

      buckets[periodLabel] = {
        name: periodLabel,
        total: 0,
        PAID: 0,
        PARTIALLY_PAID: 0,
        RENEGOTIATED: 0,
        PENDING: 0,
        OVERDUE: 0,
        DEFAULTED: 0,
      }
    })

    // Filtrar pagamentos baseado no filtro de status
    const filteredChartPayments = payments.filter((payment) => {
      const dueDate = parseISO(payment.dueDate)
      if (dueDate < chartRangeStart || dueDate > chartRangeEnd) return false

      if (chartStatusFilter === 'TOTAL') return true
      if (chartStatusFilter === 'PAID') return isPaidStatus(payment.status)
      if (chartStatusFilter === 'DEFAULTED') return DEFAULTED_STATUSES.includes(payment.status)
      if (chartStatusFilter === 'OVERDUE') return OVERDUE_STATUSES.includes(payment.status)
      if (chartStatusFilter === 'FUTURE') return !isBefore(dueDate, today)
      return false
    })

    // Agrupar pagamentos por período
    filteredChartPayments.forEach((payment) => {
      const dueDate = parseISO(payment.dueDate)
      
      let periodStart: Date
      let periodLabel: string

      if (chartGranularity === 'DAY') {
        periodStart = startOfDay(dueDate)
        periodLabel = format(periodStart, 'dd/MM', { locale: ptBR })
      } else if (chartGranularity === 'WEEK') {
        periodStart = startOfWeek(dueDate, { weekStartsOn: 1 })
        periodLabel = format(periodStart, "'Sem' w", { locale: ptBR })
      } else {
        periodStart = startOfMonth(dueDate)
        periodLabel = format(periodStart, "MMM/yy", { locale: ptBR })
      }

      if (buckets[periodLabel]) {
        buckets[periodLabel][payment.status] += payment.amount
        buckets[periodLabel].total += payment.amount
      }
    })

    return Object.values(buckets).map((item) => ({
      ...item,
      total: parseFloat(item.total.toFixed(2)),
    }))
  }, [payments, chartStatusFilter, chartGranularity, chartRangeStart, chartRangeEnd, today])

  const chartWindowLabel =
    chartGranularity === 'DAY'
      ? `Últimos ${chartWindowSize} dias`
      : chartGranularity === 'WEEK'
        ? `Últimas ${chartWindowSize} semanas`
        : `Últimos ${chartWindowSize} meses`

  const statusBadges = {
    PENDING: <Badge variant="warning">Pendente</Badge>,
    PAID: <Badge variant="success">Pago</Badge>,
    OVERDUE: <Badge variant="danger">Vencido</Badge>,
    DEFAULTED: <Badge variant="danger">Inadimplente</Badge>,
    RENEGOTIATED: <Badge variant="info">Renegociado</Badge>,
    PARTIALLY_PAID: <Badge variant="warning">Parcial</Badge>,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Recebimentos</h1>
        <p className="text-gray-600 dark:text-gray-400">Controle de pagamentos dos alunos</p>
      </div>

      {/* Banner informativo da janela de dados */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Janela de dados: {dataWindow.description}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              Exibindo pagamentos para os próximos {dataWindow.months} meses ({dataWindow.months === 12 ? 'ano corrente' : 'até o final do próximo ano'})
            </p>
          </div>
        </div>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard
          title="Pagos"
          value={summary.paid}
          color="green"
          icon="✅"
        />
        <SummaryCard
          title="Vencidos"
          value={summary.overdue}
          color="red"
          icon="⏰"
        />
        <SummaryCard
          title="Inadimplentes"
          value={summary.defaulted}
          color="red"
          icon="🚨"
        />
        <SummaryCard title="Alunos com Pendências" value={studentsWithPendingPayments} color="blue" icon="👥" isCount />
      </div>

      {/* Recortes e Filtro de Mês */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={view === 'ALL' ? 'primary' : 'secondary'} onClick={() => setView('ALL')}>
              Todos
            </Button>
            <Button size="sm" variant={view === 'PENDING' ? 'primary' : 'secondary'} onClick={() => setView('PENDING')}>
              Pendentes
            </Button>
            <Button size="sm" variant={view === 'FUTURE' ? 'primary' : 'secondary'} onClick={() => setView('FUTURE')}>
              Futuros
            </Button>
          </div>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Calendário mensal com soma diária */}
      <Card>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Calendário de Recebimentos ({format(monthDate, "MMMM 'de' yyyy", { locale: ptBR })})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Soma por vencimento no dia</p>
        </div>

        <div className="mb-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-300 font-medium">
            Total do mês selecionado: <span className="font-bold">{formatCurrencyBR(selectedMonthTotal)}</span>
          </p>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs text-center font-semibold text-gray-600 dark:text-gray-400 mb-2">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const total = getDayTotal(date)
            const inMonth = isSameMonth(date, monthDate)
            const hasReceipts = total > 0

            return (
              <div
                key={date.toISOString()}
                className={`min-h-[70px] rounded border p-1 ${
                  inMonth
                    ? hasReceipts
                      ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-700'
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700'
                    : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-800'
                }`}
              >
                <p className={`text-[11px] ${inMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                  {format(date, 'd')}
                </p>
                {total > 0 && (
                  <p className="text-[10px] font-semibold text-green-700 dark:text-green-300 leading-tight">
                    {formatCurrencyBR(total)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Gráfico de barras empilhadas */}
      {chartData.length > 0 && (
        <Card>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Recebimentos por período</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{chartWindowLabel}</p>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={chartStatusFilter}
                  onChange={(e) => setChartStatusFilter(e.target.value as ChartStatusFilter)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TOTAL">Total</option>
                  <option value="PAID">Pago</option>
                  <option value="DEFAULTED">Inadimplentes</option>
                  <option value="OVERDUE">Vencidos</option>
                  <option value="FUTURE">Futuros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 mb-1">
                  Granularidade
                </label>
                <select
                  value={chartGranularity}
                  onChange={(e) => {
                    const value = e.target.value as ChartGranularity
                    setChartGranularity(value)
                    setChartWindowSize(value === 'DAY' ? 30 : 12)
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DAY">Dia</option>
                  <option value="WEEK">Semana</option>
                  <option value="MONTH">Mês</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 mb-1">
                  Janela Temporal
                </label>
                <select
                  value={chartWindowSize}
                  onChange={(e) => setChartWindowSize(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {chartWindowOptions.map((option) => (
                    <option key={option} value={option}>
                      {chartGranularity === 'DAY' ? `${option} dias` : chartGranularity === 'WEEK' ? `${option} semanas` : `${option} meses`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={520}>
            <ComposedChart data={chartData} margin={{ top: 40, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e5e7eb'} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              />
              <YAxis
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                label={{ value: 'R$', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value) => formatCurrencyBR(value as number)}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
                  borderRadius: '0.5rem',
                  color: isDark ? '#f1f5f9' : '#111827',
                }}
              />
              <Legend />
              {chartStatusKeys.map((key) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  name={chartStatusConfig[key].label} 
                  fill={chartStatusConfig[key].color} 
                  stackId="stack"
                  radius={key === 'DEFAULTED' ? [4, 4, 0, 0] : undefined}
                >
                  <LabelList
                    dataKey={key}
                    position="inside"
                    formatter={(value) => {
                      const numericValue = Number(value || 0)
                      return numericValue > 0 ? formatCompactCurrency(numericValue) : ''
                    }}
                    style={{ fontSize: 10, fill: '#ffffff', fontWeight: 600 }}
                  />
                </Bar>
              ))}
              <Bar dataKey="total" name="Total" fill="transparent" isAnimationActive={false}>
                <LabelList
                  dataKey="total"
                  position="top"
                  formatter={(value) => formatCompactCurrency(Number(value || 0))}
                  style={{ fontSize: 11, fontWeight: 700, fill: isDark ? '#f8fafc' : '#0f172a' }}
                />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Detalhamento diário */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Detalhamento por dia</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Aluno, valor e total diário</p>
        </div>

        {daysWithPayments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum recebimento no mês/filtro selecionado.</p>
        ) : (
          <div className="space-y-3">
            {daysWithPayments.map((day) => (
              <div key={day.date.toISOString()} className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/15 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                    {format(day.date, "EEEE, dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">
                    Total do dia: {formatCurrencyBR(day.total)}
                  </p>
                </div>

                <div className="space-y-1">
                  {day.entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm bg-white dark:bg-slate-900/50 rounded px-2 py-1">
                      <span className="text-gray-800 dark:text-gray-100">{entry.studentName}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-50">{formatCurrencyBR(entry.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tabela */}
      <Card>
        {filteredPayments.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum pagamento encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Aluno</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Tipo</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Vencimento</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Valor</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Data de Pagamento</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const isOverdue = isOverdueStatus(payment.status) || isDefaultedStatus(payment.status)
                  
                  return (
                    <tr key={payment.id} className={`border-b border-gray-200 dark:border-slate-700 ${isOverdue ? 'bg-red-50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-50">{getStudentName(payment.studentId)}</td>
                      <td className="px-4 py-3">
                        {payment.paymentFrequency === 'ANNUAL' ? (
                          <Badge variant="info">Anual</Badge>
                        ) : (
                          <Badge variant="default">Mensal</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {format(parseISO(payment.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                        {payment.coversPeriod && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400">{payment.coversPeriod}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-50">
                        {formatCurrencyBR(payment.amount)}
                      </td>
                      <td className="px-4 py-3">{statusBadges[payment.status]}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {payment.paidDate ? format(parseISO(payment.paidDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {isOpenStatus(payment.status) ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => markPaymentAsPaid(payment.id)}
                          >
                            Marcar como Pago
                          </Button>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: number
  color: 'red' | 'orange' | 'green' | 'blue' | 'gray'
  icon: string
  isCount?: boolean
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, color, icon, isCount = false }) => {
  const colorMap = {
    red: 'bg-red-50 dark:bg-red-900/10',
    orange: 'bg-orange-50 dark:bg-orange-900/10',
    green: 'bg-green-50 dark:bg-green-900/10',
    blue: 'bg-blue-50 dark:bg-blue-900/10',
    gray: 'bg-gray-50 dark:bg-slate-800',
  }

  return (
    <Card className={colorMap[color]}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {isCount ? value : formatCurrencyBR(value)}
          </p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </Card>
  )
}
