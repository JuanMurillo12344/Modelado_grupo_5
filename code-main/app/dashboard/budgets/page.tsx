"use client"

import { BudgetManager } from "@/components/budget-manager"
import { BudgetAlerts } from "@/components/budget-alerts"
import { useBudgetAlerts } from "@/contexts/budget-alerts-context"
import { useState } from "react"

export default function BudgetsPage() {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const { refreshAlerts } = useBudgetAlerts()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleBudgetChange = () => {
    refreshAlerts() // Actualizar el badge inmediatamente
    setRefreshKey(k => k + 1) // Actualizar las alertas visibles
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Presupuestos</h1>
        <p className="text-muted-foreground">Administra tus presupuestos por categoría</p>
      </div>

      <BudgetAlerts month={currentMonth} year={currentYear} refreshKey={refreshKey} />
      
      <BudgetManager onSuccess={handleBudgetChange} />
    </div>
  )
}
