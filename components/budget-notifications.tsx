"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { useBudgetAlerts } from "@/contexts/budget-alerts-context"
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

export function BudgetNotifications() {
  const { toast } = useToast()
  const { refreshAlerts } = useBudgetAlerts()
  const notifiedAlertsRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    const checkBudgetAlerts = async () => {
      try {
        const month = new Date().getMonth() + 1
        const year = new Date().getFullYear()
        const response = await fetch(`/api/budgets/check?month=${month}&year=${year}`)
        
        if (!response.ok) return
        
        const data = await response.json()
        const alerts: Alert[] = data.alerts || []
        
        // Actualizar el contexto con el nuevo conteo de alertas
        refreshAlerts()
        
        // Mostrar notificación para cada alerta nueva
        alerts.forEach((alert) => {
          // Solo notificar si no hemos notificado esta alerta antes en esta sesión
          if (!notifiedAlertsRef.current.has(alert.id)) {
            notifiedAlertsRef.current.add(alert.id)
            
            // Determinar el tipo y mensaje según el porcentaje
            const isExceeded = alert.percentage >= 100
            const variant = isExceeded ? "destructive" : "default"
            
            toast({
              variant,
              title: isExceeded ? "¡Presupuesto Excedido!" : "⚠️ Alerta de Presupuesto",
              description: `${alert.icon} ${alert.name}: Has gastado $${Number(alert.spent).toFixed(2)} de $${Number(alert.budget_amount).toFixed(2)} (${Number(alert.percentage).toFixed(0)}%). ${isExceeded ? "¡Has excedido tu límite!" : "Estás cerca del límite."}`,
              duration: 10000, // 10 segundos
            })
          }
        })
      } catch (err) {
        console.error("Error checking budget alerts:", err)
      }
    }

    // Verificar inmediatamente al cargar
    checkBudgetAlerts()

    // Verificar cada 2 minutos
    const interval = setInterval(checkBudgetAlerts, 120000)

    return () => clearInterval(interval)
  }, [toast, refreshAlerts])

  return null // Este componente no renderiza nada visible
}
