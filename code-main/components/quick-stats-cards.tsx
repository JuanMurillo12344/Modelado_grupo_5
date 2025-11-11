"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react"

interface QuickStats {
  totalIncome: number
  totalExpenses: number
  balance: number
  transactionCount: number
  savingsRate: number
  topExpenseCategory: { name: string; icon: string; amount: number } | null
  topIncomeCategory: { name: string; icon: string; amount: number } | null
}

export function QuickStatsCards({ month, year, refreshKey }: { month: number; year: number; refreshKey?: number }) {
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [month, year, refreshKey])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
      const data = await response.json()

      const totalIncome = Number(data.totalIncome) || 0
      const totalExpenses = Number(data.totalExpenses) || 0
      const balance = totalIncome - totalExpenses
      const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

      // Encontrar categorías principales
      const expenseCategories = data.byCategory?.filter((c: any) => c.type === "expense") || []
      const incomeCategories = data.byCategory?.filter((c: any) => c.type === "income") || []

      const topExpense = expenseCategories.length > 0 
        ? expenseCategories.reduce((max: any, cat: any) => Number(cat.total) > Number(max.total) ? cat : max)
        : null

      const topIncome = incomeCategories.length > 0
        ? incomeCategories.reduce((max: any, cat: any) => Number(cat.total) > Number(max.total) ? cat : max)
        : null

      setStats({
        totalIncome,
        totalExpenses,
        balance,
        transactionCount: Number(data.transactionCount) || 0,
        savingsRate,
        topExpenseCategory: topExpense ? {
          name: topExpense.name,
          icon: topExpense.icon,
          amount: Number(topExpense.total)
        } : null,
        topIncomeCategory: topIncome ? {
          name: topIncome.name,
          icon: topIncome.icon,
          amount: Number(topIncome.total)
        } : null,
      })
    } catch (err) {
      console.error("Error fetching quick stats:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Balance */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2 text-xs">
            <DollarSign className="h-4 w-4" />
            Balance del Mes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${Math.abs(stats.balance).toFixed(2)}
          </div>
          <p className={`text-xs flex items-center gap-1 mt-1 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.balance >= 0 ? (
              <>
                <TrendingUp className="h-3 w-3" />
                Positivo
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3" />
                Negativo
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Tasa de Ahorro */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2 text-xs">
            📊 Tasa de Ahorro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.savingsRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.savingsRate >= 20 ? '¡Excelente!' : stats.savingsRate >= 10 ? 'Bien' : 'Puedes mejorar'}
          </p>
        </CardContent>
      </Card>

      {/* Categoría Top Gasto */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2 text-xs">
            🔴 Mayor Gasto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topExpenseCategory ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{stats.topExpenseCategory.icon}</span>
                <div className="text-lg font-bold truncate">{stats.topExpenseCategory.name}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats.topExpenseCategory.amount.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          )}
        </CardContent>
      </Card>

      {/* Categoría Top Ingreso */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2 text-xs">
            🟢 Mayor Ingreso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topIncomeCategory ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{stats.topIncomeCategory.icon}</span>
                <div className="text-lg font-bold truncate">{stats.topIncomeCategory.name}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats.topIncomeCategory.amount.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
