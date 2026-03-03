/**
 * Validation service for user inputs
 */

interface ValidationError {
  field: string
  message: string
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export const validationService = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 255
  },

  /**
   * Validate password (minimum 6 characters, at least one letter and one number)
   */
  isValidPassword: (password: string): boolean => {
    if (password.length < 6) return false
    if (!/[a-zA-Z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    return true
  },

  /**
   * Get password strength feedback
   */
  getPasswordFeedback: (password: string): string => {
    if (!password) return 'Senha obrigatória'
    if (password.length < 6) return 'Mínimo 6 caracteres'
    if (!/[a-zA-Z]/.test(password)) return 'Precisa de letras'
    if (!/[0-9]/.test(password)) return 'Precisa de números'
    return ''
  },

  /**
   * Validate student data
   */
  validateStudentData: (data: {
    name?: string
    email?: string
    phone?: string
  }): ValidationResult => {
    const errors: ValidationError[] = []

    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Nome é obrigatório' })
    } else if (data.name.length > 100) {
      errors.push({ field: 'name', message: 'Nome não pode ter mais de 100 caracteres' })
    }

    if (!data.email || !validationService.isValidEmail(data.email)) {
      errors.push({ field: 'email', message: 'Email inválido' })
    }

    if (!data.phone || data.phone.trim().length === 0) {
      errors.push({ field: 'phone', message: 'Telefone é obrigatório' })
    } else if (data.phone.length < 10) {
      errors.push({ field: 'phone', message: 'Telefone deve ter pelo menos 10 dígitos' })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  /**
   * Validate location data
   */
  validateLocationData: (data: {
    name?: string
    type?: string
  }): ValidationResult => {
    const errors: ValidationError[] = []

    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Nome é obrigatório' })
    } else if (data.name.length > 100) {
      errors.push({ field: 'name', message: 'Nome não pode ter mais de 100 caracteres' })
    }

    if (!data.type) {
      errors.push({ field: 'type', message: 'Tipo é obrigatório' })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  /**
   * Validate group data
   */
  validateGroupData: (data: {
    name?: string
    locationId?: string
    capacity?: number
    defaultPricePerStudent?: number
  }): ValidationResult => {
    const errors: ValidationError[] = []

    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Nome é obrigatório' })
    } else if (data.name.length > 100) {
      errors.push({ field: 'name', message: 'Nome não pode ter mais de 100 caracteres' })
    }

    if (!data.locationId) {
      errors.push({ field: 'locationId', message: 'Localização é obrigatória' })
    }

    if (!data.capacity || data.capacity < 1) {
      errors.push({ field: 'capacity', message: 'Capacidade deve ser maior que 0' })
    }

    if (!data.defaultPricePerStudent || data.defaultPricePerStudent < 0) {
      errors.push({ field: 'defaultPricePerStudent', message: 'Preço deve ser maior que 0' })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  /**
   * Sanitize string input
   */
  sanitizeString: (value: unknown): string => {
    if (typeof value !== 'string') return ''
    return value.trim().slice(0, 1000)
  },

  /**
   * Sanitize email input
   */
  sanitizeEmail: (value: unknown): string => {
    if (typeof value !== 'string') return ''
    return value.trim().toLowerCase().slice(0, 255)
  },
}
