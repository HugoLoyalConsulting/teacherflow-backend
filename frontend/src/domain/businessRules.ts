import { addDays, addMonths } from 'date-fns'
import { LessonInstance, PaymentPlan, WeeklySchedule } from '../types'

export interface PriceChange {
  effectiveFrom: string
  hourlyPrice: number
  reason?: string
}

export const isHalfHourSlot = (startTime: string, durationMinutes: number): boolean => {
  const [hour, minute] = startTime.split(':').map(Number)
  const validHour = Number.isInteger(hour) && hour >= 0 && hour <= 23
  const validMinute = Number.isInteger(minute) && minute >= 0 && minute <= 59

  if (!validHour || !validMinute) {
    return false
  }

  return minute % 30 === 0 && durationMinutes % 30 === 0
}

export const hasScheduleConflict = (
  schedules: WeeklySchedule[],
  candidate: WeeklySchedule,
  ignoreScheduleId?: string
): boolean => {
  const candidateStart = toMinutes(candidate.startTime)
  const candidateEnd = candidateStart + candidate.durationMinutes

  return schedules.some((schedule) => {
    if (!schedule.active || schedule.id === ignoreScheduleId) {
      return false
    }

    if (schedule.weekday !== candidate.weekday || schedule.locationId !== candidate.locationId) {
      return false
    }

    const currentStart = toMinutes(schedule.startTime)
    const currentEnd = currentStart + schedule.durationMinutes

    return candidateStart < currentEnd && candidateEnd > currentStart
  })
}

export const resolveHourlyPriceAtDate = (
  defaultHourlyPrice: number,
  changes: PriceChange[],
  lessonDate: string
): number => {
  if (changes.length === 0) {
    return defaultHourlyPrice
  }

  const target = new Date(lessonDate)

  const applicable = [...changes]
    .filter((change) => new Date(change.effectiveFrom) <= target)
    .sort((left, right) => new Date(left.effectiveFrom).getTime() - new Date(right.effectiveFrom).getTime())

  if (applicable.length === 0) {
    return defaultHourlyPrice
  }

  return applicable[applicable.length - 1].hourlyPrice
}

export const calculateRevenue = (
  lessons: LessonInstance[],
  status: LessonInstance['status']
): number => {
  return lessons
    .filter((lesson) => lesson.status === status)
    .reduce((total, lesson) => total + lesson.priceSnapshot, 0)
}

export const derivePaymentStatus = (
  dueDate: string,
  currentStatus: 'PENDING' | 'PAID' | 'OVERDUE',
  now: Date
): 'PENDING' | 'PAID' | 'OVERDUE' => {
  if (currentStatus === 'PAID') {
    return 'PAID'
  }

  return new Date(dueDate) < now ? 'OVERDUE' : 'PENDING'
}

export const generateNextDueDate = (
  recurrence: PaymentPlan['recurrence'],
  currentDueDate: string
): string => {
  const due = new Date(currentDueDate)

  if (recurrence === 'WEEKLY') {
    return addDays(due, 7).toISOString().slice(0, 10)
  }

  if (recurrence === 'BIWEEKLY') {
    return addDays(due, 14).toISOString().slice(0, 10)
  }

  return addMonths(due, 1).toISOString().slice(0, 10)
}

const toMinutes = (time: string): number => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}
