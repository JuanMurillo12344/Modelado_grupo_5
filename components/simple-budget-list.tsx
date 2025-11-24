"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Check } from "lucide-react"
import { useEffect, useState } from "react"

interface Budget {
  id: number
  category_id: number
  category_name: string
  category_icon: string
  category_color: string
  amount: number
  spent: number
  remaining: number
  percentage: number
}

interface SimpleBudgetListProps {
  month: number
  year: number
  refreshKey?: number
}

export function SimpleBudgetList({ month, year, refreshKey = 0 }: SimpleBudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/budgets?month=${month}&year=${year}`)
        const data = await res.json()
        
        if (data.budgets) {
          // Ordenar por porcentaje descendente (los más excedidos primero)
          // Luego limitar a 4 más críticos
          const sortedBudgets = data.budgets
            .sort((a: Budget, b: Budget) => (b.percentage || 0) - (a.percentage || 0))
            .slice(0, 4)
          
          setBudgets(sortedBudgets)
        }
      } catch (error) {
        console.error("Error al cargar presupuestos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [month, year, refreshKey])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💰 Tus Presupuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-2 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // No mostrar nada si no hay presupuestos
  if (budgets.length === 0 && !loading) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">💰 Presupuestos Más Críticos</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Mostrando los 4 presupuestos con mayor uso
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map(budget => {
            const percentage = budget.percentage || 0
            const spent = budget.spent || 0
            const remaining = budget.remaining || 0
            const amount = budget.amount || 0
            
            const isOver = percentage > 100
            const isWarning = percentage >= 80 && percentage <= 100
            const isHealthy = percentage < 80

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{budget.category_icon}</span>
                    <span className="font-medium text-sm">{budget.category_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOver && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {isHealthy && <Check className="h-4 w-4 text-green-500" />}
                    <span className={`text-sm font-semibold ${
                      isOver ? "text-red-600" : 
                      isWarning ? "text-orange-600" : 
                      "text-green-600"
                    }`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                  indicatorClassName={
                    isOver ? "bg-red-500" : 
                    isWarning ? "bg-orange-500" : 
                    "bg-green-500"
                  }
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Gastaste: <span className="font-semibold">${spent.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                  </span>
                  <span>
                    {isOver ? (
                      <span className="text-red-600 font-medium">
                        Excediste ${Math.abs(remaining).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span>
                        Te quedan: <span className="font-semibold">${remaining.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                      </span>
                    )}
                  </span>
                </div>

                {isOver && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    ¡Cuidado! Has excedido tu presupuesto de ${amount.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            💡 <span className="font-medium">Consejo:</span> Trata de mantener tus gastos por debajo del 80% de cada presupuesto
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
