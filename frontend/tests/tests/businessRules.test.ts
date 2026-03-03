import { describe, expect, it } from 'vitest'
import {
  calculateRevenue,
  derivePaymentStatus,
  generateNextDueDate,
  hasScheduleConflict,
  isHalfHourSlot,
  resolveHourlyPriceAtDate,
} from '../src/domain/businessRules'
import { getMockDataset } from '../src/data/mockData'
import { expandRecurringPayments } from '../src/utils/paymentRecurrence'
import { isOpenStatus } from '../src/utils/paymentStatus'

describe('TeacherFlow business QA suite', () => {
  describe('RN1 - múltiplos de 30 minutos', () => {
    it('aceita horários válidos de 30 em 30 minutos', () => {
      expect(isHalfHourSlot('09:00', 60)).toBe(true)
      expect(isHalfHourSlot('10:30', 90)).toBe(true)
    })

    it('rejeita horários fora da regra', () => {
      expect(isHalfHourSlot('09:15', 60)).toBe(false)
      expect(isHalfHourSlot('10:30', 45)).toBe(false)
    })
  })

  describe('RN2 - conflito de agenda', () => {
    const demo = getMockDataset('demo')

    it('detecta conflito no mesmo local e dia', () => {
      const candidate = {
        id: 'candidate-1',
        tenantId: 'tenant-1',
        studentId: 'student-99',
        weekday: 1,
        startTime: '14:30',
        durationMinutes: 60,
        locationId: 'location-1',
        active: true,
      }

      expect(hasScheduleConflict(demo.schedules, candidate)).toBe(true)
    })

    it('não acusa conflito quando é outro local', () => {
      const candidate = {
        id: 'candidate-2',
        tenantId: 'tenant-1',
        studentId: 'student-99',
        weekday: 1,
        startTime: '14:30',
        durationMinutes: 60,
        locationId: 'location-3',
        active: true,
      }

      expect(hasScheduleConflict(demo.schedules, candidate)).toBe(false)
    })
  })

  describe('RN4 e financeiro - status de pagamento', () => {
    it('marca overdue quando vencido e pendente', () => {
      const status = derivePaymentStatus('2026-02-10', 'PENDING', new Date('2026-02-27T12:00:00Z'))
      expect(status).toBe('OVERDUE')
    })

    it('mantém pago como pago', () => {
      const status = derivePaymentStatus('2026-02-10', 'PAID', new Date('2026-02-27T12:00:00Z'))
      expect(status).toBe('PAID')
    })
  })

  describe('RN5 e RN6 - receita prevista e realizada', () => {
    const demo = getMockDataset('demo')

    it('soma receita prevista por aulas PLANNED', () => {
      expect(calculateRevenue(demo.lessons, 'PLANNED')).toBeGreaterThan(0)
    })

    it('soma receita realizada por aulas COMPLETED', () => {
      expect(calculateRevenue(demo.lessons, 'COMPLETED')).toBeGreaterThan(0)
    })
  })

  describe('RN7 - próximo vencimento por recorrência', () => {
    it('gera próxima data semanal', () => {
      expect(generateNextDueDate('WEEKLY', '2026-03-05')).toBe('2026-03-12')
    })

    it('gera próxima data quinzenal', () => {
      expect(generateNextDueDate('BIWEEKLY', '2026-03-05')).toBe('2026-03-19')
    })

    it('gera próxima data mensal', () => {
      expect(generateNextDueDate('MONTHLY', '2026-03-05')).toBe('2026-04-05')
    })
  })

  describe('cenário de negócio - reajuste por data efetiva', () => {
    const changes = [
      { effectiveFrom: '2026-03-01', hourlyPrice: 180, reason: 'Reajuste anual' },
      { effectiveFrom: '2026-06-01', hourlyPrice: 195, reason: 'Aumento de demanda' },
    ]

    it('mantém preço padrão antes da vigência', () => {
      const price = resolveHourlyPriceAtDate(165, changes, '2026-02-20')
      expect(price).toBe(165)
    })

    it('aplica primeiro reajuste na data correta', () => {
      const price = resolveHourlyPriceAtDate(165, changes, '2026-03-01')
      expect(price).toBe(180)
    })

    it('aplica último reajuste vigente em datas futuras', () => {
      const price = resolveHourlyPriceAtDate(165, changes, '2026-07-10')
      expect(price).toBe(195)
    })
  })

  describe('integridade dos perfis mock', () => {
    it('perfil empty inicia sem dados', () => {
      const empty = getMockDataset('empty')
      expect(empty.students).toHaveLength(0)
      expect(empty.locations).toHaveLength(0)
      expect(empty.groups).toHaveLength(0)
      expect(empty.schedules).toHaveLength(0)
      expect(empty.lessons).toHaveLength(0)
      expect(empty.payments).toHaveLength(0)
    })

    it('perfil demo contém massa mínima de negócio', () => {
      const demo = getMockDataset('demo')
      expect(demo.students.length).toBeGreaterThanOrEqual(4)
      expect(demo.locations.length).toBeGreaterThanOrEqual(3)
      expect(demo.schedules.length).toBeGreaterThanOrEqual(3)
      expect(demo.lessons.some((lesson) => lesson.status === 'PLANNED')).toBe(true)
      expect(demo.payments.some((payment) => payment.status === 'PAID')).toBe(true)
    })
  })

  describe('demo realista - preços e pendências', () => {
    it('mantém hora/aula no intervalo 100-200 com passo de 25', () => {
      const demo = getMockDataset('demo')

      expect(demo.students.every((student) => {
        const price = student.defaultHourlyPrice
        return price >= 100 && price <= 200 && (price - 100) % 25 === 0
      })).toBe(true)

      expect(demo.groups.every((group) => {
        const price = group.defaultPricePerStudent
        return price >= 100 && price <= 200 && (price - 100) % 25 === 0
      })).toBe(true)

      expect(demo.lessons.every((lesson) => {
        const price = lesson.priceSnapshot
        return price >= 100 && price <= 200 && (price - 100) % 25 === 0
      })).toBe(true)
    })

    it('evita explosão de pendências no modo demo expandido', () => {
      const demo = getMockDataset('demo')
      const expandedPayments = expandRecurringPayments(demo.payments, demo.students)
      const openPayments = expandedPayments.filter((payment) => isOpenStatus(payment.status))
      const openAmount = openPayments.reduce((sum, payment) => sum + payment.amount, 0)

      // Demo realista: 32 alunos ativos podem ter 36-45 pagamentos abertos em um período
      expect(openPayments.length).toBeLessThanOrEqual(50)
      expect(openAmount).toBeLessThanOrEqual(50000)
    })
  })
})
