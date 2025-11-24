"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react"

interface CategoryData {
  name: string
  icon: string
  color: string
  total: number
  count: number
}

interface SummaryData {
  totalIncome: number
  totalExpenses: number
  balance: number
  expensesByCategory: CategoryData[]
  incomesByCategory: CategoryData[]
}

export function DashboardSummary({ month, year, refreshKey }: { month: number; year: number; refreshKey?: number }) {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [availableBalance, setAvailableBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
    fetchBalance()
  }, [month, year, refreshKey])

  const fetchSummary = async () => {
    try {
      const response = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
      
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      
      const data = await response.json()
      setSummary(data)
    } catch (err) {
      console.error("[v0] Error fetching summary:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBalance = async () => {
    try {
      const response = await fetch(`/api/monthly-balance?month=${month}&year=${year}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableBalance(data.availableBalance || 0)
      }
    } catch (err) {
      console.error("Error fetching balance:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return <div>Error cargando datos</div>
  }

  const hasAnyData = summary.totalIncome > 0 || summary.totalExpenses > 0
  const expenses = summary.expensesByCategory || []
  const incomes = summary.incomesByCategory || []

  return (
    <div className="space-y-4">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">💰 Tengo Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${availableBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Balance actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${Number(summary.totalIncome).toFixed(2)}</div>
            {!hasAnyData && <p className="text-xs text-muted-foreground mt-1">Sin datos este mes</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${Number(summary.totalExpenses).toFixed(2)}</div>
            {!hasAnyData && <p className="text-xs text-muted-foreground mt-1">Sin datos este mes</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${Number(summary.balance).toFixed(2)}
            </div>
            {!hasAnyData && <p className="text-xs text-muted-foreground mt-1">Sin datos este mes</p>}
          </CardContent>
        </Card>
      </div>

      {/* Gastos e Ingresos por categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gastos */}
        <Card>
          <CardHeader>
            <CardTitle>💸 En qué gastaste</CardTitle>
            <CardDescription>Total gastado: ${Number(summary.totalExpenses).toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💸</div>
                  <p className="text-muted-foreground mb-1">No hay gastos este mes</p>
                  <p className="text-sm text-muted-foreground">
                    Agrega transacciones de gasto para ver el análisis
                  </p>
                </div>
              ) : (
                expenses.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.count} {cat.count === 1 ? "vez" : "veces"}</p>
                      </div>
                    </div>
                    <p className="font-bold">${Number(cat.total).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ingresos */}
        <Card>
          <CardHeader>
            <CardTitle>💰 De dónde vino tu plata</CardTitle>
            <CardDescription>Total recibido: ${Number(summary.totalIncome).toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incomes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💰</div>
                  <p className="text-muted-foreground mb-1">No hay ingresos este mes</p>
                  <p className="text-sm text-muted-foreground">
                    Agrega transacciones de ingreso para ver el análisis
                  </p>
                </div>
              ) : (
                incomes.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.count} {cat.count === 1 ? "vez" : "veces"}</p>
                      </div>
                    </div>
                    <p className="font-bold">${Number(cat.total).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
