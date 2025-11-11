"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, Award } from "lucide-react"

interface CategoryRanking {
  name: string
  icon: string
  total: number
  count: number
  avgTransaction: number
}

export function TopCategoriesRanking({ month, year, type, refreshKey }: { 
  month: number
  year: number
  type: "income" | "expense"
  refreshKey?: number 
}) {
  const [categories, setCategories] = useState<CategoryRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [month, year, type, refreshKey])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
      const data = await response.json()

      const filtered = data.byCategory
        ?.filter((c: any) => c.type === type)
        .map((c: any) => ({
          name: c.name,
          icon: c.icon,
          total: Number(c.total),
          count: Number(c.count),
          avgTransaction: Number(c.count) > 0 ? Number(c.total) / Number(c.count) : 0
        }))
        .sort((a: CategoryRanking, b: CategoryRanking) => b.total - a.total)
        .slice(0, 10) || []

      setCategories(filtered)
    } catch (err) {
      console.error("Error fetching category ranking:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
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
          <CardTitle>Top 10 Categorías de {type === "income" ? "Ingresos" : "Gastos"}</CardTitle>
          <CardDescription>Las categorías más utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay datos disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
  }

  const total = categories.reduce((sum, cat) => sum + cat.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Categorías de {type === "income" ? "Ingresos" : "Gastos"}</CardTitle>
        <CardDescription>
          Ranking por volumen • Total: <span className="font-bold">${total.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map((category, index) => {
            const percentage = total > 0 ? (category.total / total) * 100 : 0
            return (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      {getMedalIcon(index)}
                    </div>
                    <span className="text-2xl flex-shrink-0">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{category.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{category.count} {category.count === 1 ? "transacción" : "transacciones"}</span>
                        <span>•</span>
                        <span>Promedio: ${category.avgTransaction.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold ${type === "income" ? "text-green-600" : "text-red-600"}`}>
                      ${category.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                {/* Barra de progreso */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      type === "income" ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
