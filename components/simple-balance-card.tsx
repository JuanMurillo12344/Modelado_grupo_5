"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

interface BalanceCardProps {
  availableBalance: number
  totalIncome: number
  totalExpenses: number
  budgetRemaining?: number
  totalBudget?: number
}

export function SimpleBalanceCard({ 
  availableBalance, 
  totalIncome, 
  totalExpenses,
  budgetRemaining = 0,
  totalBudget = 0
}: BalanceCardProps) {
  const hasBudget = totalBudget > 0
  const displayBalance = hasBudget ? budgetRemaining : availableBalance
  
  // Calcular porcentaje basado en: Presupuesto inicial + Ingresos
  const totalAvailable = hasBudget ? totalBudget + totalIncome : 0
  const percentageUsed = hasBudget && totalAvailable > 0 
    ? Math.round((totalExpenses / totalAvailable) * 100)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Balance Disponible - El más importante */}
      <Card className="col-span-full md:col-span-1 border-2 border-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {hasBudget ? 'Presupuesto Disponible' : 'Dinero Disponible'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className={`text-4xl font-bold ${displayBalance < 0 ? 'text-red-600' : ''}`}>
              ${displayBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {hasBudget ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Esto es lo que te queda para gastar este mes
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        percentageUsed > 100 ? 'bg-red-600' :
                        percentageUsed > 80 ? 'bg-yellow-600' : 
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground min-w-[45px]">
                    {percentageUsed}% usado
                  </span>
                </div>
                {percentageUsed > 80 && percentageUsed <= 100 && (
                  <p className="text-xs text-yellow-600 font-medium mt-1">
                    ⚠️ Te estás acercando al límite
                  </p>
                )}
                {percentageUsed > 100 && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    🚨 Has excedido tu presupuesto
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-amber-600 font-medium">
                  💡 Aún no has configurado tu presupuesto
                </p>
                <p className="text-xs text-muted-foreground">
                  Ve a "Presupuesto" y la IA te ayudará a distribuirlo
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ingresos del mes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Recibiste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            +${totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Este mes
          </p>
        </CardContent>
      </Card>

      {/* Gastos del mes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Gastaste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            -${totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Este mes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
