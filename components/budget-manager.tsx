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
import { Pencil, Trash2 } from "lucide-react"

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

  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/budgets")
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
          "Presupuesto creado",
          `${categoryName}: $${Number.parseFloat(amount).toLocaleString()} (${period === "month" ? "mensual" : "semanal"})`
        )
        
        setSelectedCategory("")
        setAmount("")
        fetchBudgets()
        onSuccess?.()
      } else {
        toast({
          title: "❌ Error",
          description: "No se pudo crear el presupuesto",
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
          `${editingBudget.name}: $${Number(editingBudget.amount).toLocaleString()} (${editingBudget.period === "month" ? "mensual" : "semanal"})`
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
        <CardTitle>Gestionar Presupuestos</CardTitle>
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
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Monto</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Período</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mensual</SelectItem>
                  <SelectItem value="week">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAddBudget} className="w-full" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Crear Presupuesto"}
          </Button>
        </div>

        {budgets.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Presupuestos Existentes</h3>
            <div className="space-y-2">
              {budgets.map((budget) => (
                <div key={budget.id} className="flex items-center justify-between p-3 rounded border group hover:bg-accent/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{budget.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{budget.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{budget.period === "month" ? "Mensual" : "Semanal"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">${Number(budget.amount).toFixed(2)}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(budget)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteBudget(budget)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
                <label className="block text-sm font-medium mb-1">Monto</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingBudget.amount}
                  onChange={(e) => setEditingBudget({
                    ...editingBudget,
                    amount: Number.parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Período</label>
                <Select 
                  value={editingBudget.period} 
                  onValueChange={(value) => setEditingBudget({...editingBudget, period: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mensual</SelectItem>
                    <SelectItem value="week">Semanal</SelectItem>
                  </SelectContent>
                </Select>
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
