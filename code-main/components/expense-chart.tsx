"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePolling } from "@/hooks/use-polling"
import { RefreshCw } from "lucide-react"

interface CategoryData {
  name: string
  icon: string
  color: string
  total: number
  count: number
}

export function ExpenseChart({ month, year, refreshKey }: { month: number; year: number; refreshKey?: number }) {
  const [data, setData] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    fetchData(true)
  }, [month, year, refreshKey])

  // Auto-actualizar cada 30 segundos
  usePolling(() => {
    fetchData(false) // false = no mostrar loading
  }, 30000)

  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    
    try {
      const response = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
      
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      
      const json = await response.json()
      console.log("Expense Chart Data:", json.byCategory)
      setData(json.byCategory || [])
      setLastUpdate(new Date())
    } catch (err) {
      console.error("[v0] Error fetching chart data:", err)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  if (isLoading) return <div>Cargando gráfico...</div>

  const totalExpenses = data.reduce((sum, item) => sum + Number(item.total || 0), 0)
  console.log("Total Expenses:", totalExpenses, "Data:", data)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Distribución de Gastos</CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3 animate-spin-slow" />
          <span>Actualizado: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <p className="text-muted-foreground">Sin datos</p>
          ) : (
            data.map((item) => {
              const itemTotal = Number(item.total || 0)
              const percentage = totalExpenses > 0 ? (itemTotal / totalExpenses) * 100 : 0
              console.log(`${item.name}: ${itemTotal} / ${totalExpenses} = ${percentage}%`)
              
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold">${itemTotal.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(percentage, 0)}%`,
                        backgroundColor: item.color || '#888',
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% • {item.count} {item.count === 1 ? 'transacción' : 'transacciones'}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
