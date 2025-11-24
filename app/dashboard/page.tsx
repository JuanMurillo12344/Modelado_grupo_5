"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionsList } from "@/components/transactions-list"
import { SimpleBalanceCard } from "@/components/simple-balance-card"
import { SimpleBudgetList } from "@/components/simple-budget-list"
import { PeriodComparison } from "@/components/period-comparison"
import { ExpenseChart } from "@/components/expense-chart"
import { IncomeChart } from "@/components/income-chart"
import { useBudgetAlerts } from "@/contexts/budget-alerts-context"
import { useMonth } from "@/contexts/month-context"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { refreshAlerts } = useBudgetAlerts()
  const { month, year, goToPreviousMonth, goToNextMonth, getMonthName } = useMonth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Estado para balance y estadísticas
  const [balanceData, setBalanceData] = useState({
    availableBalance: 0,
    totalIncome: 0,
    totalExpenses: 0
  })

  // Cargar balance del usuario y estadísticas del mes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener balance mensual disponible
        const balanceRes = await fetch(`/api/monthly-balance?month=${month}&year=${year}`)
        const balanceJson = await balanceRes.json()
        
        // Obtener resumen del mes
        const summaryRes = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
        const summaryJson = await summaryRes.json()
        
        setBalanceData({
          availableBalance: balanceJson.availableBalance || 0,
          totalIncome: summaryJson.totalIncome || 0,
          totalExpenses: summaryJson.totalExpenses || 0
        })
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }
    
    fetchData()
  }, [month, year, refreshKey])

  const handleTransactionSuccess = () => {
    setRefreshKey((k) => k + 1)
    refreshAlerts() // Actualizar alertas en tiempo real
    setIsDialogOpen(false)
  }

  return (
    <div className="h-full">
      {/* Header con navegación de mes */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Navegación de mes */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2 min-w-[150px] text-center capitalize">
                {getMonthName()}
              </span>
              <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Botón agregar transacción */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nueva Transacción</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nueva Transacción</DialogTitle>
                </DialogHeader>
                <TransactionForm onSuccess={handleTransactionSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Tarjetas simplificadas de balance */}
        <SimpleBalanceCard 
          availableBalance={balanceData.availableBalance}
          totalIncome={balanceData.totalIncome}
          totalExpenses={balanceData.totalExpenses}
        />

        {/* Grid principal: Presupuestos y Comparación */}
        {/* SimpleBudgetList se oculta automáticamente si no hay presupuestos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleBudgetList month={month} year={year} refreshKey={refreshKey} />
          <PeriodComparison month={month} year={year} refreshKey={refreshKey} />
        </div>

        {/* Grid de distribución por categorías */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeChart month={month} year={year} refreshKey={refreshKey} />
          <ExpenseChart month={month} year={year} refreshKey={refreshKey} />
        </div>

        {/* Lista de transacciones recientes */}
        <TransactionsList month={month} year={year} refreshKey={refreshKey} />
      </div>
    </div>
  )
}
