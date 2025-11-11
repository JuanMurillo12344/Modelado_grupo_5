"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface BudgetAlertsContextType {
  alertCount: number
  refreshAlerts: () => Promise<void>
}

const BudgetAlertsContext = createContext<BudgetAlertsContextType | undefined>(undefined)

export function BudgetAlertsProvider({ children }: { children: ReactNode }) {
  const [alertCount, setAlertCount] = useState(0)

  const refreshAlerts = useCallback(async () => {
    try {
      const month = new Date().getMonth() + 1
      const year = new Date().getFullYear()
      const response = await fetch(`/api/budgets/check?month=${month}&year=${year}`)
      if (response.ok) {
        const data = await response.json()
        setAlertCount(data.alerts?.length || 0)
      }
    } catch (err) {
      console.error("Error refreshing alerts:", err)
    }
  }, [])

  return (
    <BudgetAlertsContext.Provider value={{ alertCount, refreshAlerts }}>
      {children}
    </BudgetAlertsContext.Provider>
  )
}

export function useBudgetAlerts() {
  const context = useContext(BudgetAlertsContext)
  if (context === undefined) {
    throw new Error("useBudgetAlerts must be used within a BudgetAlertsProvider")
  }
  return context
}
