"use client"

import { useState, useEffect } from "react"
import { useMonth } from "@/contexts/month-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, AlertCircle, TrendingUp, PiggyBank, Wallet, DollarSign } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AIBudgetAssistant } from "@/components/ai-budget-assistant"
import { AIMessageCard } from "@/components/ai-message-card"
import { getBudgetCompleteMessage, type BudgetDistribution } from "@/lib/ai-assistant"

interface Category {
  id: number
  name: string
  icon: string
  color: string
  type: string
}

interface CategoryAllocation {
  categoryId: number
  amount: number
}

export default function BudgetConfigPage() {
  const { month, year, getMonthName } = useMonth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configured, setConfigured] = useState(false)
  
  // Configuración de presupuesto
  const [totalBudget, setTotalBudget] = useState("")
  const [savingsAmount, setSavingsAmount] = useState("")
  
  // Categorías disponibles y sus asignaciones
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [categoryAllocations, setCategoryAllocations] = useState<Record<number, string>>({})

  useEffect(() => {
    loadData()
  }, [month, year])

  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar configuración existente
      const budgetRes = await fetch(`/api/budget-config?month=${month}&year=${year}`)
      const budgetData = await budgetRes.json()

      if (budgetData.configured) {
        setConfigured(true)
        setTotalBudget(budgetData.config.totalBudget.toString())
        setSavingsAmount(budgetData.config.savingsAmount.toString())
        
        const allocations: Record<number, string> = {}
        budgetData.categories.forEach((cat: any) => {
          allocations[cat.categoryId] = cat.allocated.toString()
        })
        setCategoryAllocations(allocations)
      }

      // Cargar categorías de gasto
      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()
      const expenses = categoriesData.categories.filter((c: any) => c.type === 'expense')
      setExpenseCategories(expenses)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const total = Number(totalBudget)
    const savings = Number(savingsAmount || 0)

    // Validaciones
    if (isNaN(total) || total < 0) {
      toast({
        title: "Error de validación",
        description: "El presupuesto total debe ser un número válido mayor o igual a 0",
        variant: "destructive"
      })
      return
    }

    if (savings < 0) {
      toast({
        title: "Error de validación",
        description: "El ahorro debe ser mayor o igual a 0",
        variant: "destructive"
      })
      return
    }

    if (savings > total) {
      toast({
        title: "Error de validación",
        description: "El ahorro mensual no puede superar el presupuesto general",
        variant: "destructive"
      })
      return
    }

    const available = total - savings
    
    // Preparar categorías
    const categories = Object.entries(categoryAllocations)
      .filter(([_, amount]) => amount && Number(amount) > 0)
      .map(([categoryId, amount]) => ({
        categoryId: Number(categoryId),
        amount: Number(amount)
      }))

    const totalAllocated = categories.reduce((sum, cat) => sum + cat.amount, 0)

    if (totalAllocated > available) {
      toast({
        title: "Error de validación",
        description: `La suma de categorías ($${totalAllocated.toFixed(2)}) excede el presupuesto disponible ($${available.toFixed(2)})`,
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/budget-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          year,
          totalBudget: total,
          savingsAmount: savings,
          categories
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      toast({
        title: "✅ Éxito",
        description: data.message
      })

      setConfigured(true)
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updateCategoryAllocation = (categoryId: number, value: string) => {
    setCategoryAllocations(prev => ({
      ...prev,
      [categoryId]: value
    }))
  }

  const handleApplyAISuggestion = (distribution: BudgetDistribution[]) => {
    const newAllocations: Record<number, string> = {}
    distribution.forEach(item => {
      newAllocations[item.categoryId] = item.suggestedAmount.toString()
    })
    // Merge with existing allocations so user values are not lost
    setCategoryAllocations(prev => ({ ...prev, ...newAllocations }))
    
    toast({
      title: "✨ Sugerencia aplicada",
      description: "Puedes ajustar las cantidades según tus necesidades"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const total = Number(totalBudget || 0)
  const savings = Number(savingsAmount || 0)
  const available = total - savings
  const totalAllocated = Object.values(categoryAllocations).reduce(
    (sum, val) => sum + Number(val || 0),
    0
  )
  const remaining = available - totalAllocated

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración de Presupuesto</h1>
        <p className="text-muted-foreground mt-1">
          Configura tu presupuesto mensual para {getMonthName()}
        </p>
      </div>

      {/* Alerta informativa */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Debes configurar tu presupuesto y tener al menos un ingreso registrado antes de poder registrar gastos.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Presupuesto General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Presupuesto General
            </CardTitle>
            <CardDescription>
              Define tu presupuesto total para este mes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="totalBudget">Presupuesto Mensual</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="totalBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="savingsAmount">Ahorro Mensual</Label>
              <div className="relative mt-1">
                <PiggyBank className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="savingsAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                No puede superar el presupuesto general
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Presupuesto Total:</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ahorro:</span>
                <span className="font-semibold text-green-600">-${savings.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Disponible para Gastos:</span>
                <span className="text-primary">${available.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Resumen
            </CardTitle>
            <CardDescription>
              Estado de tu distribución presupuestaria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Disponible:</span>
                <span className="font-semibold">${available.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Asignado a categorías:</span>
                <span className="font-semibold">${totalAllocated.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Por asignar:</span>
                <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${remaining.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Distribución</span>
                <span>{available > 0 ? Math.round((totalAllocated / available) * 100) : 0}%</span>
              </div>
              <Progress 
                value={available > 0 ? (totalAllocated / available) * 100 : 0}
                className="h-2"
              />
            </div>

            {remaining < 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Has excedido el presupuesto disponible en ${Math.abs(remaining).toFixed(2)}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Asistente de IA - Mostrar automáticamente si hay presupuesto y no está configurado */}
      {total > 0 && (
        <AIBudgetAssistant
          totalBudget={total}
          savingsAmount={savings}
          categories={expenseCategories}
          onApplySuggestion={handleApplyAISuggestion}
        />
      )}

      {/* Distribución por Categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Categorías</CardTitle>
          <CardDescription>
            Asigna presupuesto a cada categoría de gasto. La suma no debe superar el disponible (${available.toFixed(2)})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                <Label htmlFor={`category-${category.id}`} className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={`category-${category.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={categoryAllocations[category.id] || ""}
                    onChange={(e) => updateCategoryAllocation(category.id, e.target.value)}
                    placeholder="0.00"
                    className="pl-9"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botón de Guardar */}
      <div className="flex justify-end gap-3">
        <Button onClick={loadData} variant="outline" disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
