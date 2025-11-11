"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePolling } from "@/hooks/use-polling"
import { RefreshCw } from "lucide-react"

interface MonthTrend {
  month: number
  year?: number
  monthName?: string
  income: number
  expenses: number
}

export function MonthlyTrend({ refreshKey }: { refreshKey?: number }) {
  const [trends, setTrends] = useState<MonthTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    fetchTrends(true)
  }, [refreshKey])

  // Auto-actualizar cada 30 segundos
  usePolling(() => {
    fetchTrends(false)
  }, 30000)

  const fetchTrends = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    
    try {
      // Obtener todos los meses con transacciones
      const response = await fetch('/api/dashboard/monthly-trends')
      
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      
      const data = await response.json()
      
      // Si hay datos, usarlos; si no, mostrar últimos 12 meses
      if (data.trends && data.trends.length > 0) {
        setTrends(data.trends)
      } else {
        // Fallback: últimos 12 meses
        const year = new Date().getFullYear()
        const currentMonth = new Date().getMonth() + 1
        const trendData: MonthTrend[] = []

        for (let i = 11; i >= 0; i--) {
          const month = currentMonth - i
          const checkYear = month > 0 ? year : year - 1
          const checkMonth = month > 0 ? month : month + 12

          trendData.push({
            month: checkMonth,
            income: 0,
            expenses: 0,
          })
        }
        setTrends(trendData)
      }
      
      setLastUpdate(new Date())
    } catch (err) {
      console.error("[v0] Error fetching trends:", err)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  if (isLoading) return <div>Cargando tendencias...</div>

  const maxValue = Math.max(...trends.flatMap((t) => [t.income, t.expenses]))

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  if (trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-2">📊 No hay datos de tendencias</p>
        <p className="text-sm text-muted-foreground">Agrega transacciones para ver el análisis mensual</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {trends.length > 0 ? `Mostrando ${trends.length} ${trends.length === 1 ? 'mes' : 'meses'} con transacciones` : 'Tendencia Mensual'}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          <span>{lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-1 h-48 overflow-x-auto pb-2">
          {trends.map((trend, idx) => (
            <div key={idx} className="flex-shrink-0 w-16 flex flex-col items-center gap-2">
              <div className="flex gap-1 h-40 items-end w-full">
                {/* Barra de ingresos (verde) */}
                <div
                  className="flex-1 bg-green-500 rounded-t transition-all hover:opacity-80 cursor-help min-w-[6px]"
                  style={{
                    height: maxValue > 0 ? `${(trend.income / maxValue) * 100}%` : "2px",
                  }}
                  title={`${trend.monthName || monthNames[trend.month - 1]} ${trend.year || ''}\nIngresos: $${Number(trend.income).toFixed(2)}`}
                />
                {/* Barra de gastos (roja) */}
                <div
                  className="flex-1 bg-red-500 rounded-t transition-all hover:opacity-80 cursor-help min-w-[6px]"
                  style={{
                    height: maxValue > 0 ? `${(trend.expenses / maxValue) * 100}%` : "2px",
                  }}
                  title={`${trend.monthName || monthNames[trend.month - 1]} ${trend.year || ''}\nGastos: $${Number(trend.expenses).toFixed(2)}`}
                />
              </div>
              {/* Etiqueta del mes */}
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">{trend.monthName || monthNames[trend.month - 1]}</span>
                {trend.year && <span className="text-[10px] text-muted-foreground/70">{trend.year}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-sm justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Gastos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
