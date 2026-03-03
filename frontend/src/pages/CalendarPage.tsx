import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Card, Badge } from '../components/UI'
import { Button, Select, Modal } from '../components/Form'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  format, 
  addDays, 
  startOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameDay, 
  isSameMonth,
  parseISO,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LessonInstance } from '../types'
import { formatCurrencyBR } from '../utils/formatters'

type CalendarView = 'day' | 'week' | 'month'

export const CalendarPage = () => {
  const { lessons, schedules, students, groups, locations, updateLessonStatus } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('week')
  const [selectedLesson, setSelectedLesson] = useState<LessonInstance | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getLessonsForDay = (date: Date) => {
    return lessons.filter((l) => isSameDay(parseISO(l.date), date))
  }

  const getScheduleInfo = (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId)
    if (!schedule) return null

    const student = students.find((s) => s.id === schedule.studentId)
    const group = groups.find((g) => g.id === schedule.groupId)
    const location = locations.find((l) => l.id === schedule.locationId)

    return { schedule, student, group, location }
  }

  const statusColors = {
    PLANNED: 'bg-blue-50 dark:bg-slate-800 border-l-4 border-l-blue-500',
    COMPLETED: 'bg-green-50 dark:bg-slate-800 border-l-4 border-l-green-500',
    CANCELLED: 'bg-gray-50 dark:bg-slate-800 border-l-4 border-l-gray-500',
    NO_SHOW: 'bg-red-50 dark:bg-slate-800 border-l-4 border-l-red-500',
  }

  const statusBadges = {
    PLANNED: <Badge variant="info">Planejada</Badge>,
    COMPLETED: <Badge variant="success">Concluída</Badge>,
    CANCELLED: <Badge variant="danger">Cancelada</Badge>,
    NO_SHOW: <Badge variant="danger">Não Compareceu</Badge>,
  }

  const statusOptions = [
    { value: 'PLANNED', label: 'Planejada' },
    { value: 'COMPLETED', label: 'Concluída' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'NO_SHOW', label: 'Não Compareceu' },
  ]

  const handleStatusChange = (lessonId: string, newStatus: string) => {
    updateLessonStatus(lessonId, newStatus as LessonInstance['status'])
    setIsModalOpen(false)
  }

  const renderLessonCard = (lesson: LessonInstance) => {
    const info = getScheduleInfo(lesson.scheduleId)
    if (!info) return null

    const student = info.student?.name || info.group?.name || 'Sem nome'
    const location = info.location?.name || 'Local'

    return (
      <div
        key={lesson.id}
        onClick={() => {
          setSelectedLesson(lesson)
          setIsModalOpen(true)
        }}
        className={`p-2 rounded text-xs cursor-pointer hover:shadow-md transition-shadow ${statusColors[lesson.status]}`}
      >
        <p className="font-semibold text-gray-900 dark:text-gray-50 truncate">{student}</p>
        <p className="text-gray-600 dark:text-gray-400 text-xs">{location}</p>
        <div className="mt-1">{statusBadges[lesson.status]}</div>
      </div>
    )
  }

  // DAY VIEW
  const renderDayView = () => {
    const dayLessons = getLessonsForDay(currentDate)

    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white">
          <div className="flex justify-between items-center">
            <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="p-2 hover:bg-blue-400 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">
              {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-blue-400 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </Card>

        {dayLessons.length === 0 ? (
          <Card>
            <p className="text-center py-12 text-gray-500 dark:text-gray-400">Nenhuma aula neste dia</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {dayLessons.map(renderLessonCard)}
          </div>
        )}
      </div>
    )
  }

  // WEEK VIEW
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white">
          <div className="flex justify-between items-center">
            <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-2 hover:bg-blue-400 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-xl font-bold text-center">
              {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 hover:bg-blue-400 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </Card>

        <div className="md:hidden space-y-3">
          {weekDays.map((date) => {
            const dayLessons = getLessonsForDay(date).sort(
              (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
            )
            const isTodayDate = isToday(date)

            return (
              <Card
                key={date.toString()}
                className={`border ${
                  isTodayDate
                    ? 'border-blue-500 bg-blue-50 dark:bg-slate-800'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className="w-[112px] flex-shrink-0">
                    <h3 className={`font-bold text-sm ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-50'}`}>
                      {format(date, "EEE", { locale: ptBR }).toUpperCase()}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {format(date, 'dd/MM')}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{dayLessons.length} aula(s)</p>
                  </div>

                  {dayLessons.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sem aulas</p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
                      {dayLessons.map((lesson) => {
                        const info = getScheduleInfo(lesson.scheduleId)
                        const student = info?.student?.name || info?.group?.name || 'Sem nome'
                        const location = info?.location?.name || 'Local'

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setSelectedLesson(lesson)
                              setIsModalOpen(true)
                            }}
                            className={`min-w-[170px] text-left p-2 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${statusColors[lesson.status]}`}
                          >
                            <p className="text-xs font-bold text-gray-900 dark:text-gray-50 mb-1">
                              {format(parseISO(lesson.date), 'HH:mm')}
                            </p>
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-50 truncate">{student}</p>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate">{location}</p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        <div className="hidden md:grid grid-cols-7 gap-2">
          {weekDays.map((date) => {
            const dayLessons = getLessonsForDay(date)
            const isTodayDate = isToday(date)

            return (
              <div
                key={date.toString()}
                className={`rounded-lg border-2 p-3 min-h-[280px] ${
                  isTodayDate ? 'border-blue-500 bg-blue-50 dark:bg-slate-800' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <h3 className={`font-bold mb-3 text-sm ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-50'}`}>
                  {format(date, 'EEE', { locale: ptBR }).toUpperCase()}
                  <br />
                  <span className="text-lg">{format(date, 'dd')}</span>
                </h3>

                <div className="space-y-1 text-xs">
                  {dayLessons.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 text-center py-4">-</p>
                  ) : (
                    dayLessons.map(renderLessonCard)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // MONTH VIEW
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    
    // Preencher com dias do mês anterior
    const firstDay = monthStart
    const startDate = startOfWeek(firstDay, { weekStartsOn: 1 })
    const allDays = eachDayOfInterval({ start: startDate, end: addDays(monthEnd, 6) })

    const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white">
          <div className="flex justify-between items-center">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-blue-400 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-blue-400 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-7 gap-1">
            {/* Day labels */}
            {dayLabels.map((day) => (
              <div key={day} className="text-center font-bold text-sm text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}

            {/* Days */}
            {allDays.map((date) => {
              const dayLessons = getLessonsForDay(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isTodayDate = isToday(date)

              return (
                <div
                  key={date.toString()}
                  className={`min-h-[120px] p-2 border rounded-lg transition-colors ${
                    !isCurrentMonth
                      ? 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                      : isTodayDate
                      ? 'bg-blue-50 dark:bg-slate-800 border-blue-500'
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <p className={`text-sm font-semibold mb-1 ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-50'}`}>
                    {format(date, 'd')}
                  </p>
                  <div className="space-y-1">
                    {dayLessons.slice(0, 2).map((lesson) => {
                      const info = getScheduleInfo(lesson.scheduleId)
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setIsModalOpen(true)
                          }}
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 p-1 rounded cursor-pointer hover:shadow-sm truncate"
                        >
                          {info?.student?.name || info?.group?.name}
                        </div>
                      )
                    })}
                    {dayLessons.length > 2 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-1">+{dayLessons.length - 2} mais</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Calendário</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas aulas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'day' ? 'primary' : 'secondary'}
            onClick={() => setView('day')}
            size="sm"
          >
            Dia
          </Button>
          <Button
            variant={view === 'week' ? 'primary' : 'secondary'}
            onClick={() => setView('week')}
            size="sm"
          >
            Semana
          </Button>
          <Button
            variant={view === 'month' ? 'primary' : 'secondary'}
            onClick={() => setView('month')}
            size="sm"
          >
            Mês
          </Button>
        </div>
      </div>

      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}

      {/* Modal para editar status */}
      <Modal
        isOpen={isModalOpen}
        title="Aula"
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Fechar
            </Button>
          </>
        }
      >
        {selectedLesson && (
          <div className="space-y-4">
            {(() => {
              const info = getScheduleInfo(selectedLesson.scheduleId)
              return (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Aluno/Turma</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-50">{info?.student?.name || info?.group?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Local</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-50">{info?.location?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Data</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-50">{format(parseISO(selectedLesson.date), 'dd/MM/yyyy')}</p>
                  </div>
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={selectedLesson.status}
                    onChange={(e) => handleStatusChange(selectedLesson.id, e.target.value)}
                  />
                </>
              )
            })()}
          </div>
        )}
      </Modal>

      {/* Lesson Details Modal */}
      {selectedLesson && (
        <Modal
          isOpen={isModalOpen}
          title="Detalhes da Aula"
          onClose={() => {
            setIsModalOpen(false)
            setSelectedLesson(null)
          }}
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Fechar
              </Button>
              <Select
                options={[
                  { value: 'PLANNED', label: 'Planejada' },
                  { value: 'COMPLETED', label: 'Concluída' },
                  { value: 'CANCELLED', label: 'Cancelada' },
                  { value: 'NO_SHOW', label: 'Não Compareceu' },
                ]}
                value={selectedLesson.status}
                onChange={(e) => handleStatusChange(selectedLesson.id, e.target.value as LessonInstance['status'])}
              />
            </>
          }
        >
          {(() => {
            const info = getScheduleInfo(selectedLesson!.scheduleId)
            if (!info) return <p>Informações não disponíveis</p>

            return (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Aluno/Turma</label>
                  <p className="text-lg font-bold">{info.student?.name || info.group?.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Data e Hora</label>
                  <p className="text-lg">
                    {format(parseISO(selectedLesson!.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Duração</label>
                  <p className="text-lg">{info.schedule.durationMinutes} minutos</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Local</label>
                  <p className="text-lg">{info.location?.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Valor</label>
                  <p className="text-lg font-bold text-blue-600">{formatCurrencyBR(selectedLesson!.priceSnapshot)}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <div className="mt-1">{statusBadges[selectedLesson!.status]}</div>
                </div>
              </div>
            )
          })()}
        </Modal>
      )}
    </div>
  )
}
