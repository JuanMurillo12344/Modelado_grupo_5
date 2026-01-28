"use client"

import { useState, useEffect } from "react"
import { BudgetSummary } from "@/components/budget-summary-card"
import { SimpleBalanceCard } from "@/components/simple-balance-card"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionsList } from "@/components/transactions-list"
import { MonthlyAIInsights } from "@/components/monthly-ai-insights"
import { useBudgetAlerts } from "@/contexts/budget-alerts-context"
import { useMonth } from "@/contexts/month-context"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function DashboardPage() {
  const { refreshAlerts } = useBudgetAlerts()
  const { month, year, goToPreviousMonth, goToNextMonth, getMonthName } = useMonth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Estado para balance y estadísticas
  const [balanceData, setBalanceData] = useState({
    availableBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    budgetRemaining: 0,
    totalBudget: 0
  })

  const handleTransactionSuccess = () => {
    setRefreshKey(prev => prev + 1)
    refreshAlerts()
    setDialogOpen(false)
  }

  // Cargar balance del usuario y estadísticas del mes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener configuración de presupuesto
        const budgetRes = await fetch(`/api/budget-config?month=${month}&year=${year}`)
        const budgetJson = await budgetRes.json()
        
        // Obtener resumen del mes
        const summaryRes = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
        const summaryJson = await summaryRes.json()
        
        const totalIncome = summaryJson.totalIncome || 0
        const totalExpenses = summaryJson.totalExpenses || 0
        
        // Si hay presupuesto configurado, usar eso como referencia principal
        if (budgetJson.configured) {
          const totalBudget = budgetJson.config.totalBudget || 0
          const savingsAmount = budgetJson.config.savingsAmount || 0
          const availableForExpenses = totalBudget - savingsAmount
          
          // Presupuesto disponible = Presupuesto inicial + Ingresos - Gastos
          const budgetRemaining = availableForExpenses + totalIncome - totalExpenses
          
          setBalanceData({
            availableBalance: budgetRemaining,
            totalIncome,
            totalExpenses,
            budgetRemaining,
            totalBudget: availableForExpenses
          })
        } else {
          // Si no hay presupuesto, calcular balance tradicional
          const balanceRes = await fetch(`/api/monthly-balance?month=${month}&year=${year}`)
          const balanceJson = await balanceRes.json()
          
          setBalanceData({
            availableBalance: balanceJson.availableBalance || 0,
            totalIncome,
            totalExpenses,
            budgetRemaining: 0,
            totalBudget: 0
          })
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }
    
    fetchData()
  }, [month, year, refreshKey])

  return (
    <div className="h-full">
      {/* Header con navegación de mes y botón de transacción */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            
            {/* Navegación de mes y Botón de Nueva Transacción */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2 min-w-[120px] text-center capitalize">
                  {getMonthName()}
                </span>
                <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Transacción
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Registrar Nueva Transacción</DialogTitle>
                  </DialogHeader>
                  <TransactionForm 
                    onSuccess={handleTransactionSuccess}
                    month={month}
                    year={year}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - SOLO RESUMEN VISUAL */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Tarjeta de Balance Simple */}
        <SimpleBalanceCard 
          availableBalance={balanceData.availableBalance}
          totalIncome={balanceData.totalIncome}
          totalExpenses={balanceData.totalExpenses}
          budgetRemaining={balanceData.budgetRemaining}
          totalBudget={balanceData.totalBudget}
        />

        {/* Análisis de IA del mes */}
        <MonthlyAIInsights month={month} year={year} />

        {/* Grid: Presupuesto Mensual + Transacciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Presupuesto Mensual */}
          <BudgetSummary month={month} year={year} />

          {/* Transacciones Recientes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Transacciones Recientes</h2>

            <TransactionsList
              month={month}
              year={year}
              refreshKey={refreshKey}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
