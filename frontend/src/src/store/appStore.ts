import { create } from 'zustand'
import { Student, Location, Group, Payment, LessonInstance, WeeklySchedule, LessonType } from '../types'
import { getMockDataset, MockMode } from '../data/mockData'
import { expandRecurringPayments } from '../utils/paymentRecurrence'
import { generateFutureLessons } from '../utils/lessonRecurrence'
import { storageService } from '../utils/storageService'

interface AppState {
  // Data
  students: Student[]
  locations: Location[]
  groups: Group[]
  payments: Payment[]
  lessons: LessonInstance[]
  schedules: WeeklySchedule[]
  lessonTypes: LessonType[]
  mockMode: MockMode

  // UI State
  isLoading: boolean
  selectedStudent: Student | null
  selectedMonth: Date
  lastSyncTime: number

  // Actions
  setStudents: (students: Student[]) => void
  setLocations: (locations: Location[]) => void
  setGroups: (groups: Group[]) => void
  setPayments: (payments: Payment[]) => void
  setLessons: (lessons: LessonInstance[]) => void
  setSchedules: (schedules: WeeklySchedule[]) => void
  setLessonTypes: (lessonTypes: LessonType[]) => void
  setLoading: (loading: boolean) => void
  setSelectedStudent: (student: Student | null) => void
  setSelectedMonth: (date: Date) => void
  loadMockMode: (mode: MockMode) => void
  resetCurrentMockMode: () => void
  backupData: () => string
  restoreData: (backup: string) => boolean

  // Create/Update/Delete
  addStudent: (student: Student) => void
  updateStudent: (id: string, updates: Partial<Student>) => void
  deleteStudent: (id: string) => void

  addLocation: (location: Location) => void
  updateLocation: (id: string, updates: Partial<Location>) => void
  deleteLocation: (id: string) => void

  addGroup: (group: Group) => void
  updateGroup: (id: string, updates: Partial<Group>) => void
  deleteGroup: (id: string) => void

  addPayment: (payment: Payment) => void
  markPaymentAsPaid: (id: string) => void

  addSchedule: (schedule: WeeklySchedule) => void
  deleteSchedule: (id: string) => void

  updateLessonStatus: (id: string, status: LessonInstance['status']) => void
}

// Helper functions for localStorage persistence with validation
const getStoredMockMode = (): MockMode => {
  if (typeof window === 'undefined') return 'empty'
  try {
    const stored = storageService.get<string>('mockMode')
    return (stored === 'demo' || stored === 'empty' ? stored : 'empty') as MockMode
  } catch {
    return 'empty'
  }
}

const saveMockMode = (mode: MockMode) => {
  try {
    storageService.set('mockMode', mode)
  } catch (error) {
    console.error('Error saving mock mode:', error)
  }
}

const initialMockMode = getStoredMockMode()
const initialDataset = getMockDataset(initialMockMode)
const initialExpandedPayments = expandRecurringPayments(initialDataset.payments, initialDataset.students)

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state with mock data
  students: initialDataset.students,
  locations: initialDataset.locations,
  groups: initialDataset.groups,
  payments: initialExpandedPayments,
  lessons: generateFutureLessons(
    initialDataset.schedules,
    initialDataset.students,
    initialDataset.groups,
    initialDataset.lessons
  ),
  schedules: initialDataset.schedules,
  lessonTypes: initialDataset.lessonTypes,
  mockMode: initialMockMode,
  isLoading: false,
  selectedStudent: null,
  selectedMonth: new Date(),
  lastSyncTime: Date.now(),

  // Setters
  setStudents: (students) => set({ students }),
  setLocations: (locations) => set({ locations }),
  setGroups: (groups) => set({ groups }),
  setPayments: (payments) => set((state) => ({ payments: expandRecurringPayments(payments, state.students) })),
  setLessons: (lessons) => set({ lessons }),
  setSchedules: (schedules) => set({ schedules }),
  setLessonTypes: (lessonTypes) => set({ lessonTypes }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedStudent: (student) => set({ selectedStudent: student }),
  setSelectedMonth: (date) => set({ selectedMonth: date }),

  loadMockMode: (mode) => {
    saveMockMode(mode)
    const dataset = getMockDataset(mode)
    const expandedPayments = expandRecurringPayments(dataset.payments, dataset.students)
    const expandedLessons = generateFutureLessons(
      dataset.schedules,
      dataset.students,
      dataset.groups,
      dataset.lessons
    )
    set({
      students: dataset.students,
      locations: dataset.locations,
      groups: dataset.groups,
      payments: expandedPayments,
      lessons: expandedLessons,
      schedules: dataset.schedules,
      lessonTypes: dataset.lessonTypes,
      mockMode: mode,
      selectedStudent: null,
      lastSyncTime: Date.now(),
    })
  },

  resetCurrentMockMode: () => {
    const mode = get().mockMode
    const dataset = getMockDataset(mode)
    const expandedPayments = expandRecurringPayments(dataset.payments, dataset.students)
    const expandedLessons = generateFutureLessons(
      dataset.schedules,
      dataset.students,
      dataset.groups,
      dataset.lessons
    )
    set({
      students: dataset.students,
      locations: dataset.locations,
      groups: dataset.groups,
      payments: expandedPayments,
      lessons: expandedLessons,
      schedules: dataset.schedules,
      lessonTypes: dataset.lessonTypes,
      selectedStudent: null,
      lastSyncTime: Date.now(),
    })
  },

  backupData: () => {
    try {
      const state = get()
      const backup = {
        students: state.students,
        locations: state.locations,
        groups: state.groups,
        payments: state.payments,
        lessons: state.lessons,
        schedules: state.schedules,
        lessonTypes: state.lessonTypes,
        mockMode: state.mockMode,
        timestamp: Date.now(),
      }
      return JSON.stringify(backup)
    } catch (error) {
      console.error('Error creating backup:', error)
      return ''
    }
  },

  restoreData: (backup: string) => {
    try {
      const data = JSON.parse(backup)
      set({
        students: data.students || [],
        locations: data.locations || [],
        groups: data.groups || [],
        payments: expandRecurringPayments(data.payments || [], data.students || []),
        lessons: data.lessons || [],
        schedules: data.schedules || [],
        lessonTypes: data.lessonTypes || [],
        mockMode: data.mockMode || 'empty',
        lastSyncTime: Date.now(),
      })
      return true
    } catch (error) {
      console.error('Error restoring data:', error)
      return false
    }
  },

  // CRUD Operations
  addStudent: (student) => set((state) => ({ students: [...state.students, student] })),

  updateStudent: (id, updates) =>
    set((state) => {
      const updatedStudents = state.students.map((student) =>
        student.id === id ? { ...student, ...updates } : student
      )

      const updatedStudent = updatedStudents.find((student) => student.id === id)
      if (!updatedStudent || updatedStudent.status === 'ACTIVE' || !updatedStudent.lastPaymentDate) {
        return { students: updatedStudents }
      }

      const cutoffMonth = updatedStudent.lastPaymentDate.slice(0, 7)
      const filteredPayments = state.payments.filter((payment) => {
        if (payment.studentId !== id) return true
        if (payment.status === 'PAID') return true
        return payment.dueDate.slice(0, 7) <= cutoffMonth
      })

      return {
        students: updatedStudents,
        payments: filteredPayments,
      }
    }),

  deleteStudent: (id) =>
    set((state) => {
      // Cascade delete: remove student + their payments + their schedules + their lessons
      const updatedPayments = state.payments.filter((p) => p.studentId !== id)
      const removedScheduleIds = state.schedules.filter((s) => s.studentId === id).map((s) => s.id)
      const updatedSchedules = state.schedules.filter((s) => s.studentId !== id)
      const updatedLessons = state.lessons.filter((l) => !removedScheduleIds.includes(l.scheduleId))
      
      return {
        students: state.students.filter((s) => s.id !== id),
        payments: updatedPayments,
        schedules: updatedSchedules,
        lessons: updatedLessons,
      }
    }),

  addLocation: (location) => set((state) => ({ locations: [...state.locations, location] })),

  updateLocation: (id, updates) =>
    set((state) => ({
      locations: state.locations.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  deleteLocation: (id) =>
    set((state) => {
      // Cascade delete: remove location + its groups + their schedules + lessons
      const groupsWithLocation = state.groups.filter((g) => g.locationId === id)
      const groupIdsToDelete = groupsWithLocation.map((g) => g.id)
      const schedulesWithLocation = state.schedules.filter((s) => s.locationId === id || groupIdsToDelete.includes(s.groupId || ''))
      const scheduleIdsToDelete = schedulesWithLocation.map((s) => s.id)
      
      return {
        locations: state.locations.filter((l) => l.id !== id),
        groups: state.groups.filter((g) => g.locationId !== id),
        schedules: state.schedules.filter((s) => !scheduleIdsToDelete.includes(s.id)),
        lessons: state.lessons.filter((l) => !scheduleIdsToDelete.includes(l.scheduleId)),
      }
    }),

  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),

  updateGroup: (id, updates) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),

  deleteGroup: (id) =>
    set((state) => {
      // Cascade delete: remove group + its schedules + lessons
      const schedulesWithGroup = state.schedules.filter((s) => s.groupId === id)
      const scheduleIdsToDelete = schedulesWithGroup.map((s) => s.id)
      
      return {
        groups: state.groups.filter((g) => g.id !== id),
        schedules: state.schedules.filter((s) => s.groupId !== id),
        lessons: state.lessons.filter((l) => !scheduleIdsToDelete.includes(l.scheduleId)),
      }
    }),

  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),

  markPaymentAsPaid: (id) =>
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, status: 'PAID' as const, paidDate: new Date().toISOString() } : p
      ),
    })),

  addSchedule: (schedule) => set((state) => ({ schedules: [...state.schedules, schedule] })),

  deleteSchedule: (id) =>
    set((state) => {
      // Cascade delete: remove schedule + its lessons
      return {
        schedules: state.schedules.filter((s) => s.id !== id),
        lessons: state.lessons.filter((l) => l.scheduleId !== id),
      }
    }),

  updateLessonStatus: (id, status) =>
    set((state) => ({
      lessons: state.lessons.map((l) => (l.id === id ? { ...l, status } : l)),
    })),
}))
