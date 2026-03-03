import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { Card, Badge } from '../components/UI'
import { Button } from '../components/Form'
import { ArrowLeft, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { formatCurrencyBR } from '../utils/formatters'

export const StudentDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { students, lessons, payments, groups } = useAppStore()

  const student = students.find((s) => s.id === id)
  if (!student) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate(-1)} icon={<ArrowLeft className="w-4 h-4" />}>
          Voltar
        </Button>
        <Card>
          <p className="text-center text-gray-500">Aluno não encontrado</p>
        </Card>
      </div>
    )
  }

  // Get student's group
  const group = student.primaryGroupId ? groups.find((g) => g.id === student.primaryGroupId) : null

  // Get student's lessons
  const studentLessons = lessons.filter((l) => {
    const schedule = l.scheduleId ? true : false
    return schedule && students.find((s) => s.id === student.id)
  })

  // Better approach: filter by schedule and then check if it belongs to this student
  const studentLessonIds = new Set<string>()
  studentLessons.forEach((l) => {
    studentLessonIds.add(l.id)
  })

  // Count lesson statuses
  const plannedLessons = studentLessons.filter((l) => l.status === 'PLANNED').length
  const completedLessons = studentLessons.filter((l) => l.status === 'COMPLETED').length
  const cancelledLessons = studentLessons.filter((l) => l.status === 'CANCELLED').length
  const noShowLessons = studentLessons.filter((l) => l.status === 'NO_SHOW').length

  const totalLessons = studentLessons.length
  const attendanceRate = totalLessons > 0 ? (completedLessons / totalLessons * 100).toFixed(1) : '0'

  // Get student's payments
  const studentPayments = payments.filter((p) => p.studentId === student.id)
  const paidPayments = studentPayments.filter((p) => p.status === 'PAID')
  const pendingPayments = studentPayments.filter((p) => ['PENDING', 'OVERDUE', 'DEFAULTED'].includes(p.status))
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

  // Upcoming lessons (next 5)
  const upcomingLessons = studentLessons
    .filter((l) => l.status === 'PLANNED' && new Date(l.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  // Recent payments (last 5)
  const recentPayments = studentPayments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="secondary" onClick={() => navigate(-1)} icon={<ArrowLeft className="w-4 h-4" />}>
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600">{student.email} • {student.phone}</p>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <div className="mt-2">
              <Badge variant={student.status === 'ACTIVE' ? 'success' : student.status === 'PAUSED' ? 'warning' : 'danger'}>
                {student.status === 'ACTIVE' ? 'Ativo' : student.status === 'PAUSED' ? 'Pausado' : 'Encerrado'}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Turma</p>
            <p className="mt-2 text-sm text-gray-900">{group?.name || '—'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Modelo de Cobrança</p>
            <p className="mt-2 text-sm text-gray-900">
              {student.billingModel === 'PER_LESSON' ? 'Por Aula' : student.billingModel === 'MONTHLY_FIXED' ? 'Mensal Fixo' : 'Pacote'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Valor/Hora</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{formatCurrencyBR(student.defaultHourlyPrice)}</p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Presença</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{attendanceRate}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Aulas</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{totalLessons}</p>
            </div>
            <Calendar className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Realizada</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrencyBR(totalPaid)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-emerald-500 opacity-20" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">A Receber</p>
              <p className="mt-2 text-2xl font-bold text-amber-600">{formatCurrencyBR(totalPending)}</p>
            </div>
            <Users className="w-10 h-10 text-amber-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Lessons Breakdown */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Aulas</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="text-center">
            <p className="text-sm text-gray-600">Planejadas</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">{plannedLessons}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Completadas</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{completedLessons}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Canceladas</p>
            <p className="mt-2 text-2xl font-bold text-gray-600">{cancelledLessons}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Não Compareceu</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{noShowLessons}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{totalLessons}</p>
          </div>
        </div>
      </Card>

      {/* Upcoming Lessons */}
      {upcomingLessons.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximas Aulas</h2>
          <div className="space-y-3">
            {upcomingLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{new Date(lesson.date).toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm text-gray-600">Preço: {formatCurrencyBR(lesson.priceSnapshot)}</p>
                </div>
                <Badge variant="success">Planejada</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos Pagamentos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Data Vencimento</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Valor</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Data Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-200">
                    <td className="px-4 py-3 font-medium">
                      {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatCurrencyBR(payment.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={payment.status === 'PAID' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'danger'}>
                        {payment.status === 'PAID' ? 'Pago' : payment.status === 'PENDING' ? 'Pendente' : 'Atrasado'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
