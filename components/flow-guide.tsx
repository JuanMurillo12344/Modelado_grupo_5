"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, ArrowRight, TrendingUp, PiggyBank, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FlowStep {
  id: number
  title: string
  description: string
  completed: boolean
  action: string
  route: string
  icon: any
}

interface FlowGuideProps {
  month: number
  year: number
}

export function FlowGuide({ month, year }: FlowGuideProps) {
  const router = useRouter()
  const [steps, setSteps] = useState<FlowStep[]>([
    {
      id: 1,
      title: "Registra tu primer ingreso",
      description: "Ingresa tu mesada, beca o apoyo familiar",
      completed: false,
      action: "Registrar Ingreso",
      route: "/dashboard",
      icon: TrendingUp
    },
    {
      id: 2,
      title: "Configura tu presupuesto",
      description: "Define cuánto gastarás y ahorrarás este mes",
      completed: false,
      action: "Configurar Presupuesto",
      route: "/dashboard/budget-config",
      icon: PiggyBank
    },
    {
      id: 3,
      title: "Registra tus gastos",
      description: "Lleva control de tus compras y gastos diarios",
      completed: false,
      action: "Ver Dashboard",
      route: "/dashboard",
      icon: ShoppingCart
    }
  ])

  const [loading, setLoading] = useState(true)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    checkFlowStatus()
  }, [month, year])

  const checkFlowStatus = async () => {
    setLoading(true)
    try {
      // Verificar ingresos
      const incomeRes = await fetch(`/api/transactions?month=${month}&year=${year}&type=income`)
      const incomeData = await incomeRes.json()
      const hasIncome = incomeData.transactions && incomeData.transactions.length > 0

      // Verificar presupuesto
      const budgetRes = await fetch(`/api/budget-config?month=${month}&year=${year}`)
      const budgetData = await budgetRes.json()
      const hasBudget = budgetData.configured

      // Verificar gastos
      const expenseRes = await fetch(`/api/transactions?month=${month}&year=${year}&type=expense`)
      const expenseData = await expenseRes.json()
      const hasExpenses = expenseData.transactions && expenseData.transactions.length > 0

      // Actualizar pasos
      const updatedSteps = steps.map(step => {
        if (step.id === 1) return { ...step, completed: hasIncome }
        if (step.id === 2) return { ...step, completed: hasBudget }
        if (step.id === 3) return { ...step, completed: hasExpenses }
        return step
      })

      setSteps(updatedSteps)

      // Mostrar guía solo si no ha completado al menos los dos primeros pasos
      setShowGuide(!hasIncome || !hasBudget)
    } catch (error) {
      console.error("Error checking flow status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !showGuide) return null

  const currentStep = steps.find(s => !s.completed) || steps[steps.length - 1]

  return (
    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <AlertDescription>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
              {currentStep.id}
            </div>
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                👋 ¡Bienvenido! Comienza tu control financiero
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Paso {currentStep.id} de 3: {currentStep.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={`text-xs ${step.completed ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {step.title.split(' ')[0]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <currentStep.icon className="h-6 w-6 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {currentStep.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {currentStep.description}
                </p>
                <Button 
                  size="sm" 
                  onClick={() => router.push(currentStep.route)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentStep.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 Tip: Sigue estos pasos en orden para aprovechar al máximo FinanzApp
          </p>
        </div>
      </AlertDescription>
    </Alert>
  )
}
