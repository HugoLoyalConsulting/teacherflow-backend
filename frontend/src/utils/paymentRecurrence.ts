import { Payment, Student } from '../types'
import { addWeeks, addMonths, parseISO, format, endOfMonth, differenceInCalendarDays, isValid, startOfMonth } from 'date-fns'

/**
 * Gera pagamentos recorrentes a partir de um pagamento base
 * Usa janela de dados dinâmica baseada no mês atual
 * 
 * REGRA DE NEGÓCIO: Alunos com mais de 2 meses consecutivos de inadimplência
 * são considerados inativos e param de gerar novos pagamentos (realismo).
 * 
 * @param basePayment - Pagamento base com recorrência configurada
 * @returns Array de pagamentos gerados
 */
export const generateRecurringPayments = (
  basePayment: Payment,
  studentsById?: Map<string, Student>
): Payment[] => {
  // Pagamento anual antecipado: não gera recorrências
  if (basePayment.paymentFrequency === 'ANNUAL' || basePayment.paidInAdvance) {
    return [basePayment]
  }
  
  if (!basePayment.recurrence || basePayment.recurrence === 'ONCE') {
    return [basePayment]
  }

  const payments: Payment[] = []
  const startDate = parseISO(basePayment.dueDate)
  
  // Validação: se data for inválida, retorna apenas o pagamento base
  if (!isValid(startDate)) {
    console.warn(`Invalid dueDate for payment ${basePayment.id}: ${basePayment.dueDate}`)
    return [basePayment]
  }
  
  // Janela realista para demo: até o fim do mês corrente
  // (evita projeção de dezenas de pendências futuras irreais)
  let endDate = endOfMonth(new Date())

  if (startDate > endDate) {
    endDate = startDate
  }

  const student = studentsById?.get(basePayment.studentId)
  if (student && student.status !== 'ACTIVE' && student.lastPaymentDate) {
    const studentLastPaymentDate = endOfMonth(parseISO(student.lastPaymentDate))
    if (!isNaN(studentLastPaymentDate.getTime()) && studentLastPaymentDate < endDate) {
      endDate = studentLastPaymentDate
    }
  }

  if (basePayment.recurrenceEndDate) {
    const recurrenceEndDate = parseISO(basePayment.recurrenceEndDate)
    if (!isNaN(recurrenceEndDate.getTime()) && recurrenceEndDate < endDate) {
      endDate = recurrenceEndDate
    }
  }
  
  let currentDate = startDate
  let paymentIndex = 0
  let consecutiveUnpaidMonths = 0

  while (currentDate <= endDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentMonthStart = startOfMonth(today)
    const isPast = currentDate < today
    const delayDays = isPast ? differenceInCalendarDays(today, currentDate) : 0
    const generatedStatus: Payment['status'] = !isPast ? 'PENDING' : delayDays >= 45 ? 'DEFAULTED' : 'OVERDUE'
    const isBaseInstance = paymentIndex === 0
    
    // Determina status final do pagamento
    let finalStatus: Payment['status'] = isBaseInstance ? basePayment.status : generatedStatus

    // Realismo da demo:
    // para aluno ACTIVE, meses passados já consolidados como pagos,
    // evitando acúmulo artificial de dezenas de pendências antigas.
    if (!isBaseInstance && student?.status === 'ACTIVE') {
      finalStatus = currentDate < currentMonthStart ? 'PAID' : 'PENDING'
    }
    
    // Realismo: após 2 meses de inadimplência consecutiva, aluno é considerado inativo
    if (finalStatus === 'OVERDUE' || finalStatus === 'DEFAULTED') {
      consecutiveUnpaidMonths++
      
      // Stop generating após 2 meses sem pagar
      if (consecutiveUnpaidMonths > 2) {
        break
      }
    } else if (finalStatus === 'PAID' || finalStatus === 'PENDING') {
      // Reseta contador se pagamento foi pago ou ainda está pendente
      consecutiveUnpaidMonths = 0
    }
    
    const newPayment: Payment = {
      ...basePayment,
      id: isBaseInstance ? basePayment.id : `${basePayment.id}-${paymentIndex}`,
      dueDate: format(currentDate, 'yyyy-MM-dd'),
      paidDate: isBaseInstance ? basePayment.paidDate : undefined,
      status: finalStatus,
      createdAt: basePayment.createdAt,
    }

    payments.push(newPayment)

    // Calcula próxima data baseado na recorrência
    switch (basePayment.recurrence) {
      case 'WEEKLY':
        currentDate = addWeeks(currentDate, 1)
        break
      case 'BIWEEKLY':
        currentDate = addWeeks(currentDate, 2)
        break
      case 'MONTHLY':
        currentDate = addMonths(currentDate, 1)
        break
      default:
        // Tipo de recorrência desconhecido - força saída do loop
        console.warn(`Unknown recurrence type: ${basePayment.recurrence}`)
        return payments
    }

    paymentIndex++

    // Segurança: máximo 200 recorrências
    if (paymentIndex > 200) break
  }

  return payments
}

/**
 * Expande todos os payments com recorrência
 */
export const expandRecurringPayments = (payments: Payment[], students: Student[] = []): Payment[] => {
  const expanded: Payment[] = []
  const studentsById = new Map<string, Student>()
  
  for (const student of students) {
    studentsById.set(student.id, student)
  }
  
  for (const payment of payments) {
    if (payment.recurrence && payment.recurrence !== 'ONCE') {
      expanded.push(...generateRecurringPayments(payment, studentsById))
    } else {
      expanded.push(payment)
    }
  }

  return expanded
}
