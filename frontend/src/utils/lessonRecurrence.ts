import { LessonInstance, WeeklySchedule, Student, Group } from '../types'
import { addWeeks, format, parseISO, startOfWeek, addDays, isAfter, isBefore } from 'date-fns'
import { getDataGenerationWindow } from './dataGenerationWindow'

/**
 * Gera aulas futuras baseadas em schedules semanais
 * Usa janela de dados dinâmica baseada no mês atual
 */
export const generateFutureLessons = (
  schedules: WeeklySchedule[],
  students: Student[],
  groups: Group[],
  existingLessons: LessonInstance[]
): LessonInstance[] => {
  const generatedLessons: LessonInstance[] = [...existingLessons]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Usa janela de dados dinâmica (52-65 semanas baseado no mês atual)
  const window = getDataGenerationWindow()
  const weeksToGenerate = window.weeks
  
  for (const schedule of schedules) {
    if (!schedule.active) continue
    
    // Get reference entity (student or group) for pricing
    const student = students.find(s => s.id === schedule.studentId)
    const group = groups.find(g => g.id === schedule.groupId)
    
    if (!student && !group) continue
    
    // Calculate hourly price
    let priceSnapshot = 0
    if (student) {
      const durationHours = schedule.durationMinutes / 60
      priceSnapshot = student.defaultHourlyPrice * durationHours
    } else if (group) {
      // Group: sum of all student prices in the group
      // For demo: use a simpler logic (assume group has approximate total)
      const durationHours = schedule.durationMinutes / 60
      priceSnapshot = group.defaultPricePerStudent * durationHours * 10 // Assume ~10 students
    }
    
    // Find the first occurrence of this weekday in the current week or next
    let currentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Monday
    
    for (let week = 0; week < weeksToGenerate; week++) {
      const lessonDate = addDays(currentWeek, schedule.weekday)
      
      // Check if student/group is active on this date
      if (student) {
        const startDate = parseISO(student.startDate)
        if (isBefore(lessonDate, startDate)) {
          currentWeek = addWeeks(currentWeek, 1)
          continue
        }
        if (student.endDate && isAfter(lessonDate, parseISO(student.endDate))) {
          break
        }
      }
      
      // Skip if lesson already exists
      const lessonDateStr = format(lessonDate, 'yyyy-MM-dd')
      const alreadyExists = generatedLessons.some(
        l => l.scheduleId === schedule.id && l.date === lessonDateStr
      )
      
      if (!alreadyExists && !isBefore(lessonDate, today)) {
        const newLesson: LessonInstance = {
          id: `${schedule.id}-${lessonDateStr}`,
          tenantId: schedule.tenantId,
          scheduleId: schedule.id,
          date: lessonDateStr,
          status: 'PLANNED',
          priceSnapshot,
          createdAt: new Date().toISOString(),
        }
        generatedLessons.push(newLesson)
      }
      
      currentWeek = addWeeks(currentWeek, 1)
    }
  }
  
  return generatedLessons
}
