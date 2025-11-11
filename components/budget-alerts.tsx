"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface Alert {
  id: number
  name: string
  icon: string
  budget_amount: number
  spent: number
  percentage: number
  isExceeded: boolean
}

export function BudgetAlerts({ month, year, refreshKey }: { month: number; year: number; refreshKey?: number }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [month, year, refreshKey])

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/budgets/check?month=${month}&year=${year}`)
      
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (err) {
      console.error("[v0] Error fetching alerts:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || alerts.length === 0) {
    return null
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
          <AlertCircle className="h-5 w-5" />
          Alertas de Presupuesto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-yellow-200 dark:border-yellow-900"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{alert.icon}</span>
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">{alert.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${Number(alert.spent).toFixed(2)} de ${Number(alert.budget_amount).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${alert.isExceeded ? "text-red-600" : "text-orange-600"}`}>
                    {Number(alert.percentage).toFixed(0)}%
                  </p>
                </div>
              </div>
              <div className="w-full bg-yellow-200 dark:bg-yellow-900 rounded-full h-2">
                <div
                  className={`h-full rounded-full transition-all ${alert.isExceeded ? "bg-red-500" : "bg-orange-500"}`}
                  style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
