// Lesson Type Hierarchy
export interface LessonSubType {
  id: string
  name: string
  description?: string
}

export interface LessonType {
  id: string
  name: string
  description?: string
  subTypes: LessonSubType[]
  active: boolean
  createdAt: string
}

export interface UserLessonType {
  typeId: string
  subTypeIds: string[]
}

// Auth
export interface User {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'USER'
  tenantId: string
  onboardingComplete: boolean
  lessonTypes: UserLessonType[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  logout: () => void
  setUser: (user: User | null) => void
  setOnboardingComplete: (complete: boolean) => void
}

// Student
export interface Student {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED'
  lastPaymentDate?: string
  primaryGroupId?: string
  billingModel: 'PER_LESSON' | 'MONTHLY_FIXED' | 'PACKAGE'
  defaultHourlyPrice: number
  startDate: string
  endDate?: string
  notes?: string
  createdAt: string
}

// Location
export interface Location {
  id: string
  tenantId: string
  name: string
  type: 'PARTICULAR' | 'SCHOOL' | 'ACADEMY' | 'CONDOMINIUM' | 'ONLINE'
  unitName?: string
  address?: string
  notes?: string
  active: boolean
}

// Group
export interface Group {
  id: string
  tenantId: string
  name: string
  locationId: string
  capacity: number
  defaultPricePerStudent: number
  active: boolean
}

// Enrollment
export interface Enrollment {
  id: string
  tenantId: string
  studentId: string
  groupId: string
  priceOverride?: number
  active: boolean
}

// Weekly Schedule
export interface WeeklySchedule {
  id: string
  tenantId: string
  studentId?: string
  groupId?: string
  weekday: number
  startTime: string
  durationMinutes: number
  locationId: string
  active: boolean
}

// Lesson Instance
export interface LessonInstance {
  id: string
  tenantId: string
  scheduleId: string
  date: string
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  priceSnapshot: number
  createdAt: string
}

// Payment Plan
export interface PaymentPlan {
  id: string
  tenantId: string
  studentId: string
  recurrence: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  amountExpected: number
  nextDueDate: string
  autoGenerate: boolean
  active: boolean
}

// Payment
export interface Payment {
  id: string
  tenantId: string
  studentId: string
  dueDate: string
  paidDate?: string
  amount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'DEFAULTED' | 'RENEGOTIATED' | 'PARTIALLY_PAID'
  recurrence?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ONCE'
  recurrenceEndDate?: string  // Até quando repetir (ex: quando aluno sair da turma)
  paymentFrequency?: 'MONTHLY' | 'ANNUAL'  // Frequência de pagamento
  paidInAdvance?: boolean  // Pagamento anual antecipado
  coversPeriod?: string  // Período coberto (ex: "2026-01 a 2026-12" para anual)
  createdAt: string
}

// Dashboard
export interface DashboardSummary {
  totalExpectedRevenue: number
  totalRealizedRevenue: number
  totalPending: number
  hoursScheduled: number
}
