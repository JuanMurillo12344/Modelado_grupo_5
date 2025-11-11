"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react"

interface SummaryData {
  totalIncome: number
  totalExpenses: number
  balance: number
  byCategory: Array<{
    name: string
    icon: string
    color: string
    total: number
    count: number
  }>
}

export function DashboardSummary({ month, year, refreshKey }: { month: number; year: number; refreshKey?: number }) {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(summary.totalIncome).toFixed(2)}</div>
            {!hasAnyData && <p className="text-xs text-muted-foreground mt-1">Sin datos este mes</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(summary.totalExpenses).toFixed(2)}</div>
            {!hasAnyData && <p className="text-xs text-muted-foreground mt-1">Sin datos este mes</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.byCategory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">Sin gastos este mes</p>
                <p className="text-sm text-muted-foreground">
                  Agrega transacciones para ver el desglose por categorías
                </p>
              </div>
            ) : (
              summary.byCategory.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.count} transacciones</p>
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
  )
}
