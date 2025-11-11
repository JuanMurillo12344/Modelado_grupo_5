"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"

interface ComparisonData {
  current: {
    income: number
    expenses: number
    balance: number
  }
  previous: {
    income: number
    expenses: number
    balance: number
  }
  changes: {
    income: number
    expenses: number
    balance: number
  }
}

export function PeriodComparison({ month, year, refreshKey }: { month: number; year: number; refreshKey?: number }) {
  const [data, setData] = useState<ComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [month, year, refreshKey])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Mes actual
      const currentResponse = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
      const currentData = await currentResponse.json()

      // Mes anterior
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      const prevResponse = await fetch(`/api/dashboard/summary?month=${prevMonth}&year=${prevYear}`)
      const prevData = await prevResponse.json()

      const current = {
        income: Number(currentData.totalIncome) || 0,
        expenses: Number(currentData.totalExpenses) || 0,
        balance: Number(currentData.balance) || 0,
      }

      const previous = {
        income: Number(prevData.totalIncome) || 0,
        expenses: Number(prevData.totalExpenses) || 0,
        balance: Number(prevData.balance) || 0,
      }

      setData({
        current,
        previous,
        changes: {
          income: previous.income > 0 
            ? ((current.income - previous.income) / previous.income) * 100 
            : current.income > 0 ? 100 : 0,
          expenses: previous.expenses > 0 
            ? ((current.expenses - previous.expenses) / previous.expenses) * 100 
            : current.expenses > 0 ? 100 : 0,
          balance: previous.balance !== 0 
            ? ((current.balance - previous.balance) / Math.abs(previous.balance)) * 100 
            : current.balance !== 0 ? (current.balance > 0 ? 100 : -100) : 0,
        },
      })
    } catch (err) {
      console.error("Error fetching comparison data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparación con Mes Anterior</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const IncomeIndicator = ({ value, hasData }: { value: number; hasData: boolean }) => {
    if (!hasData) {
      return <span className="text-sm text-muted-foreground">Primer mes</span>
    }
    if (value > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">+{value.toFixed(1)}%</span>
        </div>
      )
    }
    if (value < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-4 w-4" />
          <span className="text-sm font-medium">{value.toFixed(1)}%</span>
        </div>
      )
    }
    return <span className="text-sm text-muted-foreground">Sin cambios</span>
  }

  const ExpenseIndicator = ({ value, hasData }: { value: number; hasData: boolean }) => {
    if (!hasData) {
      return <span className="text-sm text-muted-foreground">Primer mes</span>
    }
    // Para gastos: aumentar es malo (rojo), reducir es bueno (verde)
    if (value > 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">+{value.toFixed(1)}%</span>
        </div>
      )
    }
    if (value < 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingDown className="h-4 w-4" />
          <span className="text-sm font-medium">{value.toFixed(1)}%</span>
        </div>
      )
    }
    return <span className="text-sm text-muted-foreground">Sin cambios</span>
  }

  const BalanceIndicator = ({ value, hasData }: { value: number; hasData: boolean }) => {
    if (!hasData) {
      return <span className="text-sm text-muted-foreground">Primer mes</span>
    }
    if (value > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">+{value.toFixed(1)}%</span>
        </div>
      )
    }
    if (value < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-4 w-4" />
          <span className="text-sm font-medium">{value.toFixed(1)}%</span>
        </div>
      )
    }
    return <span className="text-sm text-muted-foreground">Sin cambios</span>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparación con Mes Anterior</CardTitle>
        <CardDescription>Cambios respecto al período previo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Ingresos */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">${data.previous.income.toFixed(2)}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="text-lg font-bold text-green-600">${data.current.income.toFixed(2)}</span>
              </div>
            </div>
            <IncomeIndicator value={data.changes.income} hasData={data.previous.income > 0} />
          </div>

          {/* Gastos */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Gastos</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">${data.previous.expenses.toFixed(2)}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="text-lg font-bold text-red-600">${data.current.expenses.toFixed(2)}</span>
              </div>
            </div>
            <ExpenseIndicator value={data.changes.expenses} hasData={data.previous.expenses > 0} />
          </div>

          {/* Balance */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Balance</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">${data.previous.balance.toFixed(2)}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="text-lg font-bold">${data.current.balance.toFixed(2)}</span>
              </div>
            </div>
            <BalanceIndicator value={data.changes.balance} hasData={data.previous.balance !== 0 || data.previous.income > 0 || data.previous.expenses > 0} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
