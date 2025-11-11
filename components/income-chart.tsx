"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface IncomeCategory {
  name: string
  icon: string
  total: number
  percentage: number
  count: number
}

export function IncomeChart({ month, year, refreshKey }: { month: number; year: number; refreshKey?: number }) {
  const [categories, setCategories] = useState<IncomeCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalIncome, setTotalIncome] = useState(0)

  useEffect(() => {
    fetchData()
  }, [month, year, refreshKey])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
      const data = await response.json()

      const incomeByCategory: IncomeCategory[] = data.byCategory
        ? data.byCategory
            .filter((c: any) => c.type === "income")
            .map((c: any) => ({
              name: c.name,
              icon: c.icon,
              total: Number(c.total),
              percentage: data.totalIncome > 0 ? (Number(c.total) / data.totalIncome) * 100 : 0,
              count: Number(c.count),
            }))
            .sort((a: IncomeCategory, b: IncomeCategory) => b.total - a.total)
        : []

      setCategories(incomeByCategory)
      setTotalIncome(Number(data.totalIncome) || 0)
    } catch (err) {
      console.error("Error fetching income data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Categoría</CardTitle>
          <CardDescription>Distribución de tus ingresos del mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Categoría</CardTitle>
          <CardDescription>Distribución de tus ingresos del mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="text-4xl mb-3">💰</div>
            <p className="text-muted-foreground mb-1">No hay ingresos registrados</p>
            <p className="text-sm text-muted-foreground">Agrega transacciones de ingreso para ver el análisis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const colors = [
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por Categoría</CardTitle>
        <CardDescription>
          Total del mes: <span className="font-bold text-green-600">${totalIncome.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category, idx) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.count} {category.count === 1 ? "transacción" : "transacciones"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${category.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full ${colors[idx % colors.length]} transition-all duration-300`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
