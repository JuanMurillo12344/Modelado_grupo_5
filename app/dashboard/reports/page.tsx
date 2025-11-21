"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight,TrendingDown, TrendingUp, Check, X } from "lucide-react"
import { formatEcuadorDate } from "@/lib/date-utils"
import { useToast } from "@/hooks/use-toast"
import { useMonth } from "@/contexts/month-context"

interface Transaction {
  id: number
  title: string
  amount: number
  type: string
  date: string
  category_name: string
  category_icon: string
}

interface CategorySummary {
  name: string
  icon: string
  total: number
  count: number
  percentage: number
  transactions: Transaction[]
}

export default function ReportsPage() {
  const { toast } = useToast()
  const { month, year, goToPreviousMonth, goToNextMonth, getMonthName } = useMonth()
  const [availableBalance, setAvailableBalance] = useState(0)
  const [initialBalance, setInitialBalance] = useState(0)
  const [hasCustomBalance, setHasCustomBalance] = useState(false)
  const [isEditingBalance, setIsEditingBalance] = useState(false)
  const [newBalanceInput, setNewBalanceInput] = useState('')
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [balance, setBalance] = useState(0)
  const [incomeCategories, setIncomeCategories] = useState<CategorySummary[]>([])
  const [expenseCategories, setExpenseCategories] = useState<CategorySummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [month, year])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const balanceRes = await fetch(`/api/monthly-balance?month=${month}&year=${year}`)
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setAvailableBalance(balanceData.availableBalance || 0)
        setInitialBalance(balanceData.initialBalance || 0)
        setHasCustomBalance(balanceData.hasCustomBalance || false)
      }

      const summaryRes = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setTotalIncome(summaryData.totalIncome || 0)
        setTotalExpenses(summaryData.totalExpenses || 0)
        setBalance(summaryData.balance || 0)

        const incomes = (summaryData.incomesByCategory || []).map((cat: any) => ({
          name: cat.name,
          icon: cat.icon,
          total: Number(cat.total),
          count: Number(cat.count),
          percentage: summaryData.totalIncome > 0 ? (Number(cat.total) / summaryData.totalIncome) * 100 : 0,
          transactions: []
        }))
        setIncomeCategories(incomes)

        const expenses = (summaryData.expensesByCategory || []).map((cat: any) => ({
          name: cat.name,
          icon: cat.icon,
          total: Number(cat.total),
          count: Number(cat.count),
          percentage: summaryData.totalExpenses > 0 ? (Number(cat.total) / summaryData.totalExpenses) * 100 : 0,
          transactions: []
        }))
        setExpenseCategories(expenses)
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBalance = async () => {
    const newBalance = parseFloat(newBalanceInput)
    if (isNaN(newBalance)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número válido",
        variant: "destructive"
      })
      return
    }

    try {
      const res = await fetch('/api/monthly-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, initialBalance: newBalance })
      })

      if (res.ok) {
        setIsEditingBalance(false)
        setNewBalanceInput('')
        toast({
          title: "✅ Balance guardado",
          description: `Balance inicial de ${getMonthName()}: $${newBalance.toFixed(2)}`
        })
        await fetchData()
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar el balance",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar el balance",
        variant: "destructive"
      })
    }
  }

  const monthName = new Date(year, month - 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cargando reporte...</p>
        </div>
      </div>
    )
  }

  const totalIncomeCount = incomeCategories.reduce((sum, cat) => sum + cat.count, 0)
  const totalExpenseCount = expenseCategories.reduce((sum, cat) => sum + cat.count, 0)
  const avgIncome = totalIncomeCount > 0 ? totalIncome / totalIncomeCount : 0
  const avgExpense = totalExpenseCount > 0 ? totalExpenses / totalExpenseCount : 0

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold"> Reportes</h1>
          <p className="text-muted-foreground">Análisis completo </p>
        </div>
        
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
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Dinero Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingBalance ? (
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.01"
                  value={newBalanceInput}
                  onChange={(e) => setNewBalanceInput(e.target.value)}
                  placeholder="Balance inicial"
                  className="h-10"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveBalance} className="flex-1">
                    <Check className="h-4 w-4 mr-1" />
                    Guardar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingBalance(false)
                      setNewBalanceInput('')
                    }}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${availableBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Inicial: ${initialBalance.toFixed(2)}
                  {!hasCustomBalance && " (calculado)"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-green-500" />
               Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totalIncomeCount} entradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">    
              <TrendingDown className="h-4 w-4 text-red-500" />
               Gastos
               </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totalExpenseCount} salidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance >= 0 ? '+' : ''}${balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{balance >= 0 ? 'Superávit' : 'Déficit'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             Ingresos por Categoría
          </CardTitle>
          <CardDescription>Total recibido: ${totalIncome.toFixed(2)} en {totalIncomeCount} transacciones</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {incomeCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💰</div>
              <p className="text-muted-foreground">No hay ingresos este mes</p>
            </div>
          ) : (
            incomeCategories.map((category) => (
              <div key={category.name} className="space-y-3 pb-6 border-b last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{category.icon}</div>
                    <div>
                      <h3 className="font-bold text-xl">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} {category.count === 1 ? 'ingreso' : 'ingresos'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">${category.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}% del total</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-muted p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground">Promedio</p>
                    <p className="font-bold">${(category.total / category.count).toFixed(2)}</p>
                  </div>
                  <div className="bg-muted p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-green-600">${category.total.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground">Cantidad</p>
                    <p className="font-bold">{category.count}</p>
                  </div>
                  <div className="bg-muted p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground">% Total</p>
                    <p className="font-bold">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Análisis de Gastos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             Gastos  por Categoría
          </CardTitle>
          <CardDescription>Total gastado: ${totalExpenses.toFixed(2)} en {totalExpenseCount} transacciones</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {expenseCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💸</div>
              <p className="text-muted-foreground">No hay gastos este mes</p>
            </div>
          ) : (
            expenseCategories.map((category) => (
              <div key={category.name} className="space-y-3 pb-6 border-b last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{category.icon}</div>
                    <div>
                      <h3 className="font-bold text-xl">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} {category.count === 1 ? 'gasto' : 'gastos'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-red-600">${category.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}% del total</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-muted p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground">Promedio</p>
                    <p className="font-bold">${(category.total / category.count).toFixed(2)}</p>
                  </div>
                  <div className="bg-muted p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-red-600">${category.total.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground">Cantidad</p>
                    <p className="font-bold">{category.count}</p>
                  </div>
                  <div className="bg-muted p-3 rounded text-center">
                    <p className="text-xs text-muted-foreground">% Total</p>
                    <p className="font-bold">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Resumen Final */}
      <Card>
        <CardHeader>
          <CardTitle> Análisis del Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Transacciones</p>
                <p className="text-3xl font-bold">{totalIncomeCount + totalExpenseCount}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Promedio Ingreso</p>
                <p className="text-2xl font-bold text-green-600">${avgIncome.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Promedio Gasto</p>
                <p className="text-2xl font-bold text-red-600">${avgExpense.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Categorías Usadas</p>
                <p className="text-3xl font-bold">{incomeCategories.length + expenseCategories.length}</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2"> Conclusión:</h4>
              {balance >= 0 ? (
                <p className="text-sm">
                  ✅ Tuviste un mes positivo con <strong className="text-green-600">${balance.toFixed(2)}</strong> de superávit. 
                  {totalExpenseCount > 0 && ` En promedio gastaste $${avgExpense.toFixed(2)} por transacción.`}
                </p>
              ) : (
                <p className="text-sm">
                   Tuviste un déficit de <strong className="text-red-600">${Math.abs(balance).toFixed(2)}</strong> este mes. 
                  Considera revisar tus gastos en las categorías con mayor consumo.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
