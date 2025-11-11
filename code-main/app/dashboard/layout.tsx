"use client"

import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { BudgetNotifications } from "@/components/budget-notifications"
import { BudgetAlertsProvider } from "@/contexts/budget-alerts-context"
import { NotificationProvider } from "@/contexts/notification-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <NotificationProvider>
        <BudgetAlertsProvider>
          <div className="flex h-screen overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto bg-background">
              {children}
            </main>
            <BudgetNotifications />
          </div>
        </BudgetAlertsProvider>
      </NotificationProvider>
    </ProtectedRoute>
  )
}
