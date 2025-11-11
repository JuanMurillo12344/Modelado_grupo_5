"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DailyData {
  day: number
  income: number
  expenses: number
  net: number
}

export function DailyActivityChart({ month, year, refreshKey }: { month: number; year: number; refreshKey?: number }) {
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [month, year, refreshKey])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/dashboard/daily-activity?month=${month}&year=${year}`)
      const data = await response.json()
      setDailyData(data.daily || [])
    } catch (err) {
      console.error("Error fetching daily activity:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Diaria</CardTitle>
          <CardDescription>Transacciones día por día</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (dailyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Diaria</CardTitle>
          <CardDescription>Transacciones día por día</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-muted-foreground">No hay actividad registrada este mes</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...dailyData.map(d => Math.max(d.income, d.expenses)))
  const daysInMonth = new Date(year, month, 0).getDate()

  // Crear array completo de días (incluyendo días sin transacciones)
  const fullMonthData: DailyData[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const existing = dailyData.find(d => d.day === day)
    return existing || { day, income: 0, expenses: 0, net: 0 }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Diaria</CardTitle>
        <CardDescription>
          Ingresos y gastos por día del mes • {dailyData.length} días con actividad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
            {fullMonthData.map((day) => {
              const hasActivity = day.income > 0 || day.expenses > 0
              return (
                <div key={day.day} className="flex-shrink-0 flex flex-col items-center gap-1" style={{ width: '20px' }}>
                  <div className="flex flex-col-reverse gap-0.5 h-40 items-center justify-end">
                    {/* Barra de ingresos */}
                    {hasActivity && (
                      <div
                        className="w-2 bg-green-500 rounded-t transition-all hover:opacity-80 cursor-help"
                        style={{
                          height: maxValue > 0 ? `${(day.income / maxValue) * 100}%` : '0%',
                          minHeight: day.income > 0 ? '2px' : '0'
                        }}
                        title={`Día ${day.day}\nIngresos: $${day.income.toFixed(2)}\nGastos: $${day.expenses.toFixed(2)}\nNeto: $${day.net.toFixed(2)}`}
                      />
                    )}
                    {/* Barra de gastos */}
                    {hasActivity && (
                      <div
                        className="w-2 bg-red-500 rounded-t transition-all hover:opacity-80 cursor-help"
                        style={{
                          height: maxValue > 0 ? `${(day.expenses / maxValue) * 100}%` : '0%',
                          minHeight: day.expenses > 0 ? '2px' : '0'
                        }}
                        title={`Día ${day.day}\nIngresos: $${day.income.toFixed(2)}\nGastos: $${day.expenses.toFixed(2)}\nNeto: $${day.net.toFixed(2)}`}
                      />
                    )}
                    {/* Punto para días sin actividad */}
                    {!hasActivity && (
                      <div className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
                    )}
                  </div>
                  {/* Número del día - mostrar solo cada 5 días */}
                  {day.day % 5 === 0 && (
                    <span className="text-[9px] text-muted-foreground">{day.day}</span>
                  )}
                </div>
              )
            })}
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
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-muted-foreground/20 rounded-full" />
              <span>Sin actividad</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
