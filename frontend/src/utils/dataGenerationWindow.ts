/**
 * Calcula a janela de dados dinâmica baseada no mês atual
 * Garante que o usuário sempre tenha visão completa do ano corrente e,
 * nos últimos meses, dos primeiros meses do ano seguinte
 */
export const getDataGenerationWindow = (): { 
  months: number
  weeks: number
  description: string 
} => {
  const now = new Date()
  const currentMonth = now.getMonth() // 0-11 (0 = Janeiro, 11 = Dezembro)
  
  // Janeiro (0) a Setembro (8): gera 12 meses (ano corrente completo)
  if (currentMonth <= 8) {
    return { 
      months: 12,
      weeks: 52, 
      description: 'Ano corrente completo' 
    }
  }
  
  // Outubro (9): gera 15 meses (out-dez atual + jan-dez seguinte)
  if (currentMonth === 9) {
    return { 
      months: 15,
      weeks: 65, // ~15 meses em semanas
      description: 'Até Dezembro do ano seguinte' 
    }
  }
  
  // Novembro (10): gera 14 meses (nov-dez atual + jan-dez seguinte)
  if (currentMonth === 10) {
    return { 
      months: 14,
      weeks: 60,
      description: 'Até Dezembro do ano seguinte' 
    }
  }
  
  // Dezembro (11): gera 13 meses (dez atual + jan-dez seguinte)
  return { 
    months: 13,
    weeks: 56,
    description: 'Até Dezembro do ano seguinte' 
  }
}

/**
 * Retorna a data limite para geração de dados
 */
export const getDataGenerationEndDate = (): Date => {
  const window = getDataGenerationWindow()
  const now = new Date()
  const endDate = new Date(now)
  endDate.setMonth(endDate.getMonth() + window.months)
  return endDate
}
