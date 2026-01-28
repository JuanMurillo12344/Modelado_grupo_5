"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Wallet, PiggyBank, TrendingDown, AlertCircle, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface BudgetSummaryProps {
  month: number
  year: number
}

export function BudgetSummary({ month, year }: BudgetSummaryProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [budgetData, setBudgetData] = useState<any>(null)

  useEffect(() => {
    loadBudgetData()
  }, [month, year])

  const loadBudgetData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/budget-config?month=${month}&year=${year}`)
      const data = await response.json()

      if (data.configured) {
        // Obtener ingresos del mes para sumarlos al presupuesto
        const summaryRes = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
        const summaryData = await summaryRes.json()
        const totalIncome = summaryData.totalIncome || 0
        
        // Actualizar presupuesto y remaining con ingresos
        data.config.totalBudget = data.config.totalBudget + totalIncome
        data.config.availableForExpenses = data.config.availableForExpenses + totalIncome
        data.config.remaining = data.config.availableForExpenses - data.config.totalSpent
        
        setConfigured(true)
        setBudgetData(data)
      } else {
        setConfigured(false)
        setBudgetData(null)
      }
    } catch (error) {
      console.error("Error al cargar presupuesto:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Presupuesto Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!configured) {
    return (
      <Card className="border-amber-200 dark:border-amber-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Presupuesto no configurado
          </CardTitle>
          <CardDescription>
            Configura tu presupuesto mensual para comenzar a controlar tus finanzas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/dashboard/budget-config')} className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Configurar Presupuesto
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { config, categories } = budgetData
  const usagePercentage = config.availableForExpenses > 0
    ? Math.round((config.totalSpent / config.availableForExpenses) * 100)
    : 0

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "text-red-600"
    if (percentage >= 80) return "text-amber-600"
    return "text-green-600"
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge variant="destructive">Excedido</Badge>
    if (percentage >= 80) return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Alerta</Badge>
    return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Saludable</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Resumen General */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Presupuesto Mensual
            </CardTitle>
            {getStatusBadge(usagePercentage)}
          </div>
          <CardDescription>
            Control de tu presupuesto y ahorro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presupuesto Total */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">💰 Presupuesto + Ingresos</p>
              <p className="text-3xl font-bold text-blue-600">${config.totalBudget.toFixed(2)}</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <PiggyBank className="h-4 w-4" />
                💵 Ahorro Separado
              </p>
              <p className="text-3xl font-bold text-green-600">${config.savingsAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Disponible y Gastado */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground font-medium">📊 Total disponible (sin ahorro):</span>
              <span className="font-bold text-lg">${config.availableForExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground font-medium">📉 Ya gastaste:</span>
              <span className={`font-bold text-lg ${getStatusColor(usagePercentage)}`}>
                ${config.totalSpent.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2 bg-muted/30 px-3 rounded-lg">
              <span className="text-muted-foreground font-medium">✅ Te queda disponible:</span>
              <span className={`font-bold text-xl ${config.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${config.remaining.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Uso del presupuesto</span>
              <span className={getStatusColor(usagePercentage)}>{usagePercentage}%</span>
            </div>
            <Progress 
              value={Math.min(usagePercentage, 100)} 
              className={`h-2 ${usagePercentage >= 100 ? '[&>div]:bg-red-600' : usagePercentage >= 80 ? '[&>div]:bg-amber-600' : ''}`}
            />
          </div>

          {/* Alertas */}
          {usagePercentage >= 100 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Has excedido tu presupuesto disponible en ${Math.abs(config.remaining).toFixed(2)}
              </AlertDescription>
            </Alert>
          )}

          {usagePercentage >= 80 && usagePercentage < 100 && (
            <Alert className="border-amber-200 dark:border-amber-900">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs">
                Estás cerca del límite de tu presupuesto ({usagePercentage}%)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Categorías con presupuesto */}
      {categories && categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.slice(0, 5).map((cat: any) => {
                const catPercentage = cat.allocated > 0 
                  ? Math.round((cat.spent / cat.allocated) * 100) 
                  : 0
                
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="font-medium">{cat.categoryName}</span>
                      </div>
                      <span className={`text-xs ${getStatusColor(catPercentage)}`}>
                        ${cat.spent.toFixed(0)} / ${cat.allocated.toFixed(0)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(catPercentage, 100)} 
                      className={`h-1 ${catPercentage >= 100 ? '[&>div]:bg-red-600' : catPercentage >= 80 ? '[&>div]:bg-amber-600' : ''}`}
                    />
                  </div>
                )
              })}
              
              {categories.length > 5 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => router.push('/dashboard/budget-config')}
                >
                  Ver todas las categorías
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de configuración */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => router.push('/dashboard/budget-config')}
      >
        <Settings className="mr-2 h-4 w-4" />
        Editar Configuración
      </Button>
    </div>
  )
}
