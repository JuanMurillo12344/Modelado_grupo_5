"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

interface BalanceCardProps {
  availableBalance: number
  totalIncome: number
  totalExpenses: number
}

export function SimpleBalanceCard({ 
  availableBalance, 
  totalIncome, 
  totalExpenses
}: BalanceCardProps) {

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Balance Disponible - El más importante */}
      <Card className="col-span-full md:col-span-1 border-2 border-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
             Dinero Disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-4xl font-bold">
              ${availableBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">
              Esto es lo que tienes ahora para gastar
            </p>
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
