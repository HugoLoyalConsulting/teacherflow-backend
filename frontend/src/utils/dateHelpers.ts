import { parseISO, isValid } from 'date-fns'

/**
 * Parse seguro de strings ISO para Date
 * Retorna null se a data for inválida
 * @param dateString - String no formato ISO (yyyy-MM-dd)
 * @returns Date válido ou null
 */
export const safeParseISO = (dateString: string | undefined | null): Date | null => {
  if (!dateString || typeof dateString !== 'string') {
    return null
  }

  try {
    const date = parseISO(dateString)
    return isValid(date) ? date : null
  } catch {
    return null
  }
}

/**
 * Parse seguro com fallback para data atual
 * @param dateString - String no formato ISO
 * @param fallback - Data de fallback (padrão: hoje)
 * @returns Date válido ou fallback
 */
export const safeParseISOWithFallback = (
  dateString: string | undefined | null,
  fallback: Date = new Date()
): Date => {
  return safeParseISO(dateString) ?? fallback
}
