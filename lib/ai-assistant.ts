/**
 * AI Assistant - Asistente Financiero Educativo
 * Proporciona recomendaciones y mensajes para estudiantes universitarios foráneos
 */

export interface AIMessage {
  type: 'info' | 'warning' | 'success' | 'suggestion'
  title: string
  message: string
  icon?: string
  action?: {
    label: string
    value: any
  }
}

export interface BudgetDistribution {
  categoryId: number
  categoryName: string
  suggestedAmount: number
  percentage: number
  reason: string
}

/**
 * Analiza el ingreso y sugiere distribución de presupuesto
 */
export function suggestBudgetDistribution(
  totalBudget: number,
  savingsAmount: number,
  categories: Array<{ id: number; name: string; type: string }>
): BudgetDistribution[] {
  const availableForExpenses = totalBudget - savingsAmount
  const expenseCategories = categories.filter(c => c.type === 'expense')
  
  // Distribución recomendada para estudiantes foráneos
  const priorityDistribution: Record<string, { percentage: number; reason: string }> = {
    'Alimentación': { 
      percentage: 35, 
      reason: 'Es tu mayor necesidad básica como estudiante' 
    },
    'Vivienda': { 
      percentage: 25, 
      reason: 'Renta y servicios son gastos fijos importantes' 
    },
    'Transporte': { 
      percentage: 15, 
      reason: 'Para ir a clases y moverte en la ciudad' 
    },
    'Educación': { 
      percentage: 10, 
      reason: 'Libros, materiales y copias' 
    },
    'Entretenimiento': { 
      percentage: 8, 
      reason: 'Un poco para distraerte y socializar' 
    },
    'Salud': { 
      percentage: 5, 
      reason: 'Medicamentos y consultas básicas' 
    },
    'Otros Gastos': { 
      percentage: 2, 
      reason: 'Gastos imprevistos' 
    }
  }

  // Calcular total de porcentajes asignados
  let totalPercentageAssigned = 0
  const suggestions: BudgetDistribution[] = []
  
  expenseCategories.forEach(category => {
    const distribution = priorityDistribution[category.name] || { 
      percentage: 5, 
      reason: 'Asignación flexible para otros gastos' 
    }
    
    suggestions.push({
      categoryId: category.id,
      categoryName: category.name,
      suggestedAmount: 0, // Se calculará después
      percentage: distribution.percentage,
      reason: distribution.reason
    })
    
    totalPercentageAssigned += distribution.percentage
  })

  // Ajustar porcentajes proporcionalmente para que sumen exactamente 100%
  const adjustmentFactor = 100 / totalPercentageAssigned
  let totalAssigned = 0
  
  suggestions.forEach((suggestion, index) => {
    const adjustedPercentage = suggestion.percentage * adjustmentFactor
    
    // Para las primeras categorías, calcular normalmente
    if (index < suggestions.length - 1) {
      suggestion.percentage = Math.round(adjustedPercentage * 100) / 100
      suggestion.suggestedAmount = Math.round((availableForExpenses * adjustedPercentage) / 100)
      totalAssigned += suggestion.suggestedAmount
    } else {
      // La última categoría recibe lo que queda para asegurar que suma exactamente el total
      suggestion.percentage = Math.round(adjustedPercentage * 100) / 100
      suggestion.suggestedAmount = availableForExpenses - totalAssigned
    }
  })

  return suggestions
}

/**
 * Analiza un gasto y proporciona mensaje contextual
 */
export function analyzeExpense(
  amount: number,
  categoryName: string,
  budgetAllocated: number,
  budgetSpent: number,
  availableBalance: number
): AIMessage | null {
  const budgetRemaining = budgetAllocated - budgetSpent
  const percentageUsed = budgetAllocated > 0 ? (budgetSpent / budgetAllocated) * 100 : 0
  const newPercentage = budgetAllocated > 0 ? ((budgetSpent + amount) / budgetAllocated) * 100 : 0

  // Gasto supera el presupuesto
  if (amount > budgetRemaining) {
    return {
      type: 'warning',
      title: '⚠️ Cuidado con este gasto',
      message: `Este gasto supera tu presupuesto de ${categoryName}. Te quedan solo $${budgetRemaining.toFixed(2)} disponibles.`,
      icon: '💸'
    }
  }

  // Gasto representa más del 50% del presupuesto restante
  if (amount > (budgetRemaining * 0.5)) {
    return {
      type: 'warning',
      title: '💡 Considera esto',
      message: `Este gasto usará más de la mitad de tu presupuesto restante en ${categoryName}. ¿Es realmente necesario ahora?`,
      icon: '🤔'
    }
  }

  // Se está acercando al límite (más del 80%)
  if (newPercentage > 80 && newPercentage <= 100) {
    return {
      type: 'info',
      title: '📊 Estás cerca del límite',
      message: `Con este gasto usarás el ${Math.round(newPercentage)}% de tu presupuesto en ${categoryName}. Planifica bien tus próximos gastos.`,
      icon: '📈'
    }
  }

  // Gasto controlado
  if (newPercentage <= 50) {
    return {
      type: 'success',
      title: '✅ Vas muy bien',
      message: `Este gasto está dentro de tu plan. Sigues controlando tu presupuesto de ${categoryName}.`,
      icon: '👍'
    }
  }

  return null
}

/**
 * Analiza un ingreso y proporciona sugerencia de ahorro
 */
export function analyzeIncome(
  amount: number,
  currentSavings: number,
  totalBudget: number
): AIMessage {
  const suggestedSavings = Math.round(amount * 0.1) // 10% de ahorro sugerido
  const savingsPercentage = totalBudget > 0 ? (currentSavings / totalBudget) * 100 : 0

  if (savingsPercentage < 10) {
    return {
      type: 'suggestion',
      title: '💰 Sugerencia de ahorro',
      message: `¿Qué tal si ahorras $${suggestedSavings.toFixed(2)} de este ingreso? Es el 10% y te ayudará para imprevistos.`,
      icon: '🐷',
      action: {
        label: 'Ajustar ahorro',
        value: suggestedSavings
      }
    }
  }

  return {
    type: 'success',
    title: '🎉 ¡Excelente!',
    message: `Tu ahorro está en ${Math.round(savingsPercentage)}%. Sigue así, estás construyendo un buen colchón financiero.`,
    icon: '⭐'
  }
}

/**
 * Analiza patrones de gasto mensuales
 */
export function analyzeMonthlyPatterns(
  expenses: Array<{ category_name: string; amount: number }>,
  budgetCategories: Array<{ categoryName: string; allocated: number; spent: number }>
): AIMessage[] {
  const messages: AIMessage[] = []

  // Identificar categorías con gasto excesivo
  const overBudgetCategories = budgetCategories.filter(
    cat => cat.spent > cat.allocated
  )

  if (overBudgetCategories.length > 0) {
    const categoriesList = overBudgetCategories.map(c => c.categoryName).join(', ')
    messages.push({
      type: 'warning',
      title: '⚠️ Atención a tus gastos',
      message: `Te pasaste del presupuesto en:${overBudgetCategories.map(c => `• ${c.categoryName}: $${(c.spent - c.allocated).toFixed(2)} de más`).join(' ')}Revisa estos gastos el próximo mes para mantenerte dentro del plan.`,
      icon: '📊'
    })
  }

  // Identificar categorías con buen control
  const wellManagedCategories = budgetCategories.filter(
    cat => cat.spent > 0 && (cat.spent / cat.allocated) <= 0.8
  )

  if (wellManagedCategories.length > 0) {
    messages.push({
      type: 'success',
      title: '🎯 Estás manejando muy bien tu presupuesto en: ',
      message: `${wellManagedCategories.map(c => ` • ${c.categoryName} (${Math.round((c.spent / c.allocated) * 100)}% usado )`).join('  ')}   ¡Sigue así! `,
      icon: '✅'
    })
  }

  return messages
}

/**
 * Mensaje de bienvenida al configurar presupuesto
 */
export function getWelcomeMessage(): AIMessage {
  return {
    type: 'info',
    title: '👋 ¡Hola! Soy tu asistente financiero',
    message: 'Te ayudaré a distribuir tu presupuesto de forma inteligente. Consideraré tus necesidades como estudiante foráneo.',
    icon: '🤖'
  }
}

/**
 * Mensaje al completar configuración de presupuesto
 */
export function getBudgetCompleteMessage(
  totalBudget: number,
  savingsAmount: number,
  availableForExpenses: number
): AIMessage {
  const savingsPercentage = (savingsAmount / totalBudget) * 100

  if (savingsPercentage >= 10) {
    return {
      type: 'success',
      title: '🎉 ¡Excelente planificación!',
      message: `Tu presupuesto está bien estructurado. Tienes $${availableForExpenses.toFixed(2)} para gastos y $${savingsAmount.toFixed(2)} de ahorro (${Math.round(savingsPercentage)}%).`,
      icon: '💪'
    }
  }

  return {
    type: 'info',
    title: '✅ Presupuesto configurado',
    message: `Tienes $${availableForExpenses.toFixed(2)} para tus gastos mensuales. Recuerda seguir tu plan para llegar bien a fin de mes.`,
    icon: '📋'
  }
}
