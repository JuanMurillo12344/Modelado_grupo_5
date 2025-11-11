"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface BalanceData {
  totalIncome: number
  totalExpenses: number
  balance: number
  transactionCount: number
  avgTransaction: number
}

export function BalanceOverview({ month, year, refreshKey }: { month: number; year: number; refreshKey?: number }) {
  const [data, setData] = useState<BalanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [month, year, refreshKey])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
      const json = await response.json()

      setData({
        totalIncome: Number(json.totalIncome) || 0,
        totalExpenses: Number(json.totalExpenses) || 0,
        balance: Number(json.balance) || 0,
        transactionCount: Number(json.transactionCount) || 0,
        avgTransaction: Number(json.avgTransaction) || 0,
      })
    } catch (err) {
      console.error("Error fetching balance data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance General</CardTitle>
          <CardDescription>Resumen financiero del mes</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const total = data.totalIncome + data.totalExpenses
  const incomePercentage = total > 0 ? (data.totalIncome / total) * 100 : 50
  const expensePercentage = total > 0 ? (data.totalExpenses / total) * 100 : 50

  const balanceStatus = data.balance > 0 ? "positive" : data.balance < 0 ? "negative" : "neutral"
  const balanceColor = balanceStatus === "positive" ? "text-green-600" : balanceStatus === "negative" ? "text-red-600" : "text-gray-600"
  const balanceIcon = balanceStatus === "positive" ? TrendingUp : balanceStatus === "negative" ? TrendingDown : Minus

  const BalanceIcon = balanceIcon

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance General</CardTitle>
        <CardDescription>Resumen financiero del mes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Gráfico circular */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                {/* Ingresos */}
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="32"
                  strokeDasharray={`${(incomePercentage / 100) * 502.65} 502.65`}
                  className="transition-all duration-500"
                />
                {/* Gastos */}
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="32"
                  strokeDasharray={`${(expensePercentage / 100) * 502.65} 502.65`}
                  strokeDashoffset={`-${(incomePercentage / 100) * 502.65}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <BalanceIcon className={`h-8 w-8 ${balanceColor} mb-1`} />
                <p className={`text-2xl font-bold ${balanceColor}`}>
                  ${Math.abs(data.balance).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Balance</p>
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <p className="text-sm font-medium">Ingresos</p>
              </div>
              <p className="text-2xl font-bold text-green-600">${data.totalIncome.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{incomePercentage.toFixed(1)}% del total</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <p className="text-sm font-medium">Gastos</p>
              </div>
              <p className="text-2xl font-bold text-red-600">${data.totalExpenses.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{expensePercentage.toFixed(1)}% del total</p>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Transacciones</span>
              <span className="font-medium">{data.transactionCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Promedio por Transacción</span>
              <span className="font-medium">${data.avgTransaction.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
