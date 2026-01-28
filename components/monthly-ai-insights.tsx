"use client"

import { useState, useEffect } from "react"
import { AIMessageCard } from "@/components/ai-message-card"
import { analyzeMonthlyPatterns, type AIMessage } from "@/lib/ai-assistant"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface MonthlyAIInsightsProps {
  month: number
  year: number
}

export function MonthlyAIInsights({ month, year }: MonthlyAIInsightsProps) {
  const [insights, setInsights] = useState<AIMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInsights()
  }, [month, year])

  const loadInsights = async () => {
    setLoading(true)
    try {
      const toMonthlyAmount = (amount: number, period?: string) => {
        if (period === "week") return amount * 4
        return amount
      }

      // Intentar usar presupuestos fijos por categoría
      const fixedBudgetsRes = await fetch(`/api/budgets?month=${month}&year=${year}`)
      const fixedBudgetsData = await fixedBudgetsRes.json()
      const fixedBudgets = (fixedBudgetsData.budgets || []).map((budget: any) => ({
        categoryName: budget.name,
        allocated: toMonthlyAmount(Number(budget.amount || 0), budget.period),
        spent: Number(budget.spent || 0)
      }))

      let budgetCategories = fixedBudgets

      if (!budgetCategories.length) {
        // Obtener configuración de presupuesto con gastos
        const budgetRes = await fetch(`/api/budget-config?month=${month}&year=${year}`)
        const budgetData = await budgetRes.json()

        if (budgetData.configured && budgetData.categories) {
          budgetCategories = budgetData.categories
        }
      }

      if (budgetCategories.length > 0) {
        // Obtener transacciones del mes
        const transactionsRes = await fetch(`/api/transactions?month=${month}&year=${year}&type=expense`)
        const transactionsData = await transactionsRes.json()

        const expenses = transactionsData.transactions || []
        const messages = analyzeMonthlyPatterns(expenses, budgetCategories)
        setInsights(messages)
      } else {
        setInsights([])
      }
    } catch (error) {
      console.error("Error al cargar insights:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || insights.length === 0) {
    return null
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Análisis de tu Mes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
            <AIMessageCard
              message={insight}
              dismissible={true}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
