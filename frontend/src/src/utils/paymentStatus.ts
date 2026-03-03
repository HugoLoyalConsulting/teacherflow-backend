import { Payment } from '../types'

export const PAID_STATUSES: Payment['status'][] = ['PAID']
export const OVERDUE_STATUSES: Payment['status'][] = ['OVERDUE']
export const DEFAULTED_STATUSES: Payment['status'][] = ['DEFAULTED']
export const PENDING_STATUSES: Payment['status'][] = ['PENDING', 'RENEGOTIATED', 'PARTIALLY_PAID']
export const OPEN_STATUSES: Payment['status'][] = ['PENDING', 'RENEGOTIATED', 'PARTIALLY_PAID', 'OVERDUE', 'DEFAULTED']

export const isPaidStatus = (status: Payment['status']) => PAID_STATUSES.includes(status)
export const isOverdueStatus = (status: Payment['status']) => OVERDUE_STATUSES.includes(status)
export const isDefaultedStatus = (status: Payment['status']) => DEFAULTED_STATUSES.includes(status)
export const isOpenStatus = (status: Payment['status']) => OPEN_STATUSES.includes(status)
