"use client"

import { createContext, useContext, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { 
  TrendingDown, 
  TrendingUp, 
  Edit, 
  Trash2, 
  PiggyBank, 
  AlertTriangle 
} from "lucide-react"

interface NotificationContextType {
  showNotification: (type: string, title: string, message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  const showNotification = (type: string, title: string, message: string) => {
    // Determinar variante y descripción según el tipo
    let variant: "default" | "destructive" = "default"
    let icon = "🔔"
    let description = message

    switch (type) {
      case "expense_added":
        variant = "destructive"
        icon = "💸"
        break
      case "income_added":
        variant = "default"
        icon = "💰"
        break
      case "transaction_updated":
        variant = "default"
        icon = "✏️"
        break
      case "transaction_deleted":
        variant = "destructive"
        icon = "🗑️"
        break
      case "budget_created":
        variant = "default"
        icon = "🐷"
        break
      case "budget_updated":
        variant = "default"
        icon = "✏️"
        break
      case "budget_deleted":
        variant = "destructive"
        icon = "🗑️"
        break
      case "budget_exceeded":
        variant = "destructive"
        icon = "⚠️"
        break
    }

    toast({
      title: `${icon} ${title}`,
      description,
      variant,
      duration: 4000,
    })
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}
