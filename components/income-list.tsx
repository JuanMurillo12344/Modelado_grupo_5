"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TrendingUp } from "lucide-react"

interface Transaction {
  id: number
  amount: number
  description: string
  date: string
  category_name: string
  category_icon: string
}

export function IncomeList({ month, year, refreshKey }: { month: number; year: number; refreshKey?: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchData()
  }, [month, year, refreshKey])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/transactions?month=${month}&year=${year}&type=income`)
      const data = await response.json()

      const incomeTransactions = data.transactions || []
      setTransactions(incomeTransactions)
      setTotal(incomeTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0))
    } catch (err) {
      console.error("Error fetching income transactions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ingresos</CardTitle>
          <CardDescription>Todas tus entradas del mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ingresos</CardTitle>
          <CardDescription>Todas tus entradas del mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-1">No hay ingresos registrados</p>
            <p className="text-sm text-muted-foreground">Agrega transacciones de ingreso para verlas aquí</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Ingresos</CardTitle>
        <CardDescription>
          {transactions.length} {transactions.length === 1 ? "ingreso" : "ingresos"} • Total: 
          <span className="font-bold text-green-600 ml-1">${total.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                  <span className="text-xl">{transaction.category_icon}</span>
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{transaction.category_name}</span>
                    <span>•</span>
                    <span>{format(new Date(transaction.date), "d MMM yyyy", { locale: es })}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 text-lg">+${Number(transaction.amount).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
