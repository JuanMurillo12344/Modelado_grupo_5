"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/notification-context"
import { Pencil, Trash2, AlertCircle } from "lucide-react"

interface Category {
  id: number
  name: string
  icon: string
  type: string
}

interface Budget {
  id: number
  name: string
  icon: string
  amount: number
  period: string
  category_id: number
  spent?: number
  remaining?: number
  percentage?: number
}

export function BudgetManager({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast()
  const { showNotification } = useNotifications()
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState("month")
  const [isLoading, setIsLoading] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deleteBudget, setDeleteBudget] = useState<Budget | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchBudgets()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      const expenseCategories = data.categories.filter((c: Category) => c.type === "expense")
      setCategories(expenseCategories)
    } catch (err) {
      console.error("[v0] Error fetching categories:", err)
    }
  }

  // Filtrar categorías que aún no tienen presupuesto
  const availableCategories = categories.filter(
    cat => !budgets.some(budget => budget.category_id === cat.id)
  )

  const fetchBudgets = async () => {
    try {
      // Obtener mes y año actual
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()
      
      const response = await fetch(`/api/budgets?month=${month}&year=${year}`)
      const data = await response.json()
      setBudgets(data.budgets)
    } catch (err) {
      console.error("[v0] Error fetching budgets:", err)
    }
  }

  const handleAddBudget = async () => {
    if (!selectedCategory || !amount) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          amount: Number.parseFloat(amount),
          period,
        }),
      })

      if (response.ok) {
        const categoryName = categories.find(c => c.id === Number(selectedCategory))?.name
        
        // Mostrar notificación inmediatamente
        showNotification(
          "budget_created",
          "Presupuesto actualizado",
          `${categoryName}: $${Number.parseFloat(amount).toLocaleString()}`
        )
        
        setSelectedCategory("")
        setAmount("")
        fetchBudgets()
        onSuccess?.()
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Error",
          description: errorData.error || "No se pudo crear el presupuesto",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("[v0] Error adding budget:", err)
      toast({
        title: "❌ Error",
        description: "Ocurrió un error al crear el presupuesto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
  }

  const handleSaveEdit = async () => {
    if (!editingBudget) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/budgets/${editingBudget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: editingBudget.amount,
          period: editingBudget.period,
        }),
      })

      if (response.ok) {
        // Mostrar notificación inmediatamente
        showNotification(
          "budget_updated",
          "Presupuesto actualizado",
          `${editingBudget.name}: $${Number(editingBudget.amount).toLocaleString()}`
        )
        
        setEditingBudget(null)
        fetchBudgets()
        onSuccess?.()
      } else {
        toast({
          title: "❌ Error",
          description: "No se pudo actualizar el presupuesto",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("[v0] Error updating budget:", err)
      toast({
        title: "❌ Error",
        description: "Ocurrió un error al actualizar el presupuesto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteBudget) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/budgets/${deleteBudget.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Mostrar notificación inmediatamente
        showNotification(
          "budget_deleted",
          "Presupuesto eliminado",
          `${deleteBudget.name}: $${Number(deleteBudget.amount).toLocaleString()}`
        )
        
        setDeleteBudget(null)
        fetchBudgets()
        onSuccess?.()
      } else {
        toast({
          title: "❌ Error",
          description: "No se pudo eliminar el presupuesto",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("[v0] Error deleting budget:", err)
      toast({
        title: "❌ Error",
        description: "Ocurrió un error al eliminar el presupuesto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Definir Presupuesto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      <span className="mr-2">{cat.icon}</span>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Todas las categorías ya tienen presupuesto
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monto Mensual</label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setAmount(value)
                }
              }}
            />
          </div>

          <Button 
            onClick={handleAddBudget} 
            className="w-full" 
            disabled={isLoading || availableCategories.length === 0}
          >
            {isLoading ? "Guardando..." : availableCategories.length === 0 ? "No hay categorías disponibles" : "Crear Presupuesto"}
          </Button>
        </div>

        {budgets.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Presupuestos Existentes</h3>
            <div className="space-y-2">
              {budgets.map((budget) => {
                const spent = budget.spent || 0
                const remaining = budget.remaining || budget.amount
                const amount = budget.amount || 0
                const percentage = budget.percentage || 0
                const isOver = percentage > 100
                const isWarning = percentage >= 80 && percentage <= 100
                const isHealthy = percentage < 80
                
                return (
                  <div key={budget.id} className="space-y-3 p-4 rounded-lg border-2 group hover:border-primary/50 transition-all hover:shadow-md">
                    {/* Header con categoría y porcentaje */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{budget.icon}</div>
                        <div>
                          <p className="font-semibold text-base">{budget.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Presupuesto: ${amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          isOver ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" : 
                          isWarning ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" : 
                          "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        }`}>
                          {percentage.toFixed(0)}%
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleEdit(budget)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setDeleteBudget(budget)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso mejorada */}
                    <div className="space-y-1">
                      <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isOver ? "bg-gradient-to-r from-red-500 to-red-600" : 
                            isWarning ? "bg-gradient-to-r from-orange-400 to-orange-500" : 
                            "bg-gradient-to-r from-green-400 to-green-500"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Información de gastos mejorada */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground mb-0.5">💸 Gastado</p>
                        <p className="text-sm font-bold">${spent.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className={`rounded-lg p-2 ${
                        isOver ? "bg-red-50 dark:bg-red-950/30" : "bg-green-50 dark:bg-green-950/30"
                      }`}>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {isOver ? "⚠️ Excediste" : "✅ Disponible"}
                        </p>
                        <p className={`text-sm font-bold ${
                          isOver ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"
                        }`}>
                          ${Math.abs(remaining).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Alertas según estado */}
                    {isOver && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                          ¡Has superado tu presupuesto! Controla tus gastos para no pasarte más.
                        </p>
                      </div>
                    )}
                    {!isOver && percentage >= 100 && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900">
                        <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                          ¡Presupuesto completado! Ya gastaste todo lo planeado para este mes.
                        </p>
                      </div>
                    )}
                    {isWarning && percentage < 100 && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900">
                        <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                          ¡Cuidado! Te queda poco presupuesto. Modera tus gastos.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Presupuesto</DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <div className="flex items-center gap-2 p-2 rounded bg-muted">
                  <span>{editingBudget.icon}</span>
                  <span className="font-medium">{editingBudget.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Monto Mensual</label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editingBudget.amount}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setEditingBudget({
                        ...editingBudget,
                        amount: value === '' ? 0 : Number.parseFloat(value)
                      })
                    }
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setEditingBudget(null)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteBudget} onOpenChange={() => setDeleteBudget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el presupuesto de <strong>{deleteBudget?.name}</strong>?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
