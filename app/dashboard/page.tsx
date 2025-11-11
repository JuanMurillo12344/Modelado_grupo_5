"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionsList } from "@/components/transactions-list"
import { BudgetAlerts } from "@/components/budget-alerts"
import { QuickStatsCards } from "@/components/quick-stats-cards"
import { PeriodComparison } from "@/components/period-comparison"
import { BalanceOverview } from "@/components/balance-overview"
import { ExpenseChart } from "@/components/expense-chart"
import { IncomeChart } from "@/components/income-chart"
import { useBudgetAlerts } from "@/contexts/budget-alerts-context"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { refreshAlerts } = useBudgetAlerts()
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [refreshKey, setRefreshKey] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const handleTransactionSuccess = () => {
    setRefreshKey((k) => k + 1)
    refreshAlerts() // Actualizar alertas en tiempo real
    setIsDialogOpen(false)
  }

  const monthName = new Date(year, month - 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

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
              <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2 min-w-[150px] text-center capitalize">
                {monthName}
              </span>
              <Button variant="ghost" size="sm" onClick={handleNextMonth}>
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
        {/* Alertas de presupuesto */}
        <BudgetAlerts month={month} year={year} refreshKey={refreshKey} />

        {/* Tarjetas de estadísticas rápidas */}
        <QuickStatsCards month={month} year={year} refreshKey={refreshKey} />

        {/* Grid principal: Balance visual y Comparación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BalanceOverview month={month} year={year} refreshKey={refreshKey} />
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
