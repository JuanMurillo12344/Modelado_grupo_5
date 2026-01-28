"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight,TrendingDown, TrendingUp, Check, X, Target, AlertTriangle } from "lucide-react"
import { formatEcuadorDate } from "@/lib/date-utils"
import { useToast } from "@/hooks/use-toast"
import { useMonth } from "@/contexts/month-context"
import { Progress } from "@/components/ui/progress"
import { MonthlyAIInsights } from "@/components/monthly-ai-insights"

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
  budgetAllocated?: number
  budgetRemaining?: number
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
  const [budgetData, setBudgetData] = useState<any>(null)
  const [hasBudget, setHasBudget] = useState(false)

  useEffect(() => {
    fetchData()
  }, [month, year])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Obtener configuración de presupuesto
      const budgetRes = await fetch(`/api/budget-config?month=${month}&year=${year}`)
      let budgetJson: any = null
      let hasBudgetConfig = false
      
      if (budgetRes.ok) {
        budgetJson = await budgetRes.json()
        if (budgetJson.configured) {
          setBudgetData(budgetJson)
          setHasBudget(true)
          hasBudgetConfig = true
          
          const totalBudget = budgetJson.config.totalBudget || 0
          const savingsAmount = budgetJson.config.savingsAmount || 0
          const availableForExpenses = totalBudget - savingsAmount
          setInitialBalance(availableForExpenses)
        } else {
          setHasBudget(false)
          // Obtener balance tradicional
          const balanceRes = await fetch(`/api/monthly-balance?month=${month}&year=${year}`)
          if (balanceRes.ok) {
            const balanceData = await balanceRes.json()
            setInitialBalance(balanceData.initialBalance || 0)
            setHasCustomBalance(balanceData.hasCustomBalance || false)
          }
        }
      }

      const summaryRes = await fetch(`/api/dashboard/summary?month=${month}&year=${year}`)
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        const income = summaryData.totalIncome || 0
        const expenses = summaryData.totalExpenses || 0
        
        setTotalIncome(income)
        setTotalExpenses(expenses)
        setBalance(income - expenses)
        
        // Calcular balance disponible
        if (hasBudgetConfig && budgetJson) {
          const totalBudget = budgetJson.config.totalBudget || 0
          const savingsAmount = budgetJson.config.savingsAmount || 0
          const availableForExpenses = totalBudget - savingsAmount
          setAvailableBalance(availableForExpenses + income - expenses)
        } else {
          setAvailableBalance(initialBalance + income - expenses)
        }

        const incomes = (summaryData.incomesByCategory || []).map((cat: any) => ({
          name: cat.name,
          icon: cat.icon,
          total: Number(cat.total),
          count: Number(cat.count),
          percentage: income > 0 ? (Number(cat.total) / income) * 100 : 0,
          transactions: []
        }))
        setIncomeCategories(incomes)

        // Mapear gastos con presupuesto
        const expenses_list = (summaryData.expensesByCategory || []).map((cat: any) => {
          let budgetCat = null
          
          if (hasBudgetConfig && budgetJson && budgetJson.categories) {
            budgetCat = budgetJson.categories.find((bc: any) => bc.categoryName === cat.name)
          }
          
          return {
            name: cat.name,
            icon: cat.icon,
            total: Number(cat.total),
            count: Number(cat.count),
            percentage: expenses > 0 ? (Number(cat.total) / expenses) * 100 : 0,
            transactions: [],
            budgetAllocated: budgetCat?.allocated || 0,
            budgetRemaining: budgetCat ? (budgetCat.allocated - Number(cat.total)) : 0
          }
        })
        setExpenseCategories(expenses_list)
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
        <Card className="border-2 border-primary">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              {hasBudget ? 'Presupuesto Disponible' : 'Dinero Disponible'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${availableBalance < 0 ? 'text-red-600' : ''}`}>
              ${availableBalance.toFixed(2)}
            </div>
            {hasBudget && budgetData && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Uso del presupuesto</span>
                  <span>
                    {budgetData.config.availableForExpenses > 0 
                      ? Math.round((totalExpenses / (budgetData.config.availableForExpenses + totalIncome)) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={
                    budgetData.config.availableForExpenses > 0 
                      ? (totalExpenses / (budgetData.config.availableForExpenses + totalIncome)) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>
            )}
            {!hasBudget && (
              <p className="text-xs text-amber-600 font-medium mt-2">
                💡 Configura tu presupuesto
              </p>
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
            <TrendingDown className="h-5 w-5 text-red-500" />
            Gastos por Categoría
            {hasBudget && <span className="text-sm font-normal text-muted-foreground ml-2">(vs Presupuesto)</span>}
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
            expenseCategories.map((category) => {
              const hasCategoryBudget = category.budgetAllocated && category.budgetAllocated > 0
              const budgetPercentage = hasCategoryBudget 
                ? Math.round((category.total / category.budgetAllocated!) * 100)
                : 0
              const isOverBudget = hasCategoryBudget && category.total > category.budgetAllocated!
              
              return (
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
                      <p className={`text-3xl font-bold ${isOverBudget ? 'text-red-600' : 'text-red-500'}`}>
                        ${category.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}% del total</p>
                    </div>
                  </div>
                  
                  {hasCategoryBudget && (
                    <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Presupuesto asignado: ${category.budgetAllocated!.toFixed(2)}
                        </span>
                        <span className={`font-bold ${isOverBudget ? 'text-red-600' : budgetPercentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {budgetPercentage}% usado
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(budgetPercentage, 100)}
                        className={`h-2 ${isOverBudget ? '[&>div]:bg-red-600' : budgetPercentage > 80 ? '[&>div]:bg-yellow-600' : '[&>div]:bg-green-600'}`}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                          {isOverBudget ? (
                            <>
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              Excedido en ${Math.abs(category.budgetRemaining!).toFixed(2)}
                            </>
                          ) : (
                            `Disponible: $${category.budgetRemaining!.toFixed(2)}`
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  
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
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Análisis de IA */}
      <MonthlyAIInsights month={month} year={year} />

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
