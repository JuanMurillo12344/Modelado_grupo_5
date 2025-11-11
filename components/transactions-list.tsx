"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useNotifications } from "@/contexts/notification-context"

interface Transaction {
  id: number
  title: string
  amount: number
  description: string
  type: string
  date: string
  category_id: number
  category_name: string
  icon: string
}

interface Category {
  id: number
  name: string
  icon: string
  type: string
}

interface TransactionsListProps {
  month?: number
  year?: number
  refreshKey?: number
  filters?: {
    categoryId?: number
    type?: "income" | "expense" | "all"
    startDate?: Date
    endDate?: Date
  }
  allowEdit?: boolean // Controla si se pueden editar transacciones
}

export function TransactionsList({ month, year, refreshKey, filters, allowEdit = true }: TransactionsListProps) {
  const { showNotification } = useNotifications()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [month, year, refreshKey, filters])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      
      if (month) params.append("month", month.toString())
      if (year) params.append("year", year.toString())
      if (filters?.categoryId) params.append("categoryId", filters.categoryId.toString())
      if (filters?.type && filters.type !== "all") params.append("type", filters.type)
      if (filters?.startDate) params.append("startDate", filters.startDate.toISOString())
      if (filters?.endDate) params.append("endDate", filters.endDate.toISOString())

      const response = await fetch(`/api/transactions?${params.toString()}`)
      
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (err) {
      console.error("[v0] Error fetching transactions:", err)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error("[v0] Error fetching categories:", err)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleSaveEdit = async () => {
    if (!editingTransaction) return
    setIsSaving(true)

    try {
      const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: editingTransaction.category_id,
          title: editingTransaction.title,
          amount: editingTransaction.amount,
          description: editingTransaction.description,
          type: editingTransaction.type,
        }),
      })

      if (response.ok) {
        // Mostrar notificación inmediatamente
        showNotification(
          "transaction_updated",
          "Transacción actualizada",
          `${editingTransaction.title}: $${Number(editingTransaction.amount).toLocaleString()}`
        )
        
        setEditingTransaction(null)
        fetchTransactions()
      } else {
        alert("Error al actualizar la transacción")
      }
    } catch (err) {
      console.error("[v0] Error updating transaction:", err)
      alert("Error al actualizar la transacción")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTransaction) return
    setIsSaving(true)

    try {
      const response = await fetch(`/api/transactions/${deleteTransaction.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Mostrar notificación inmediatamente
        showNotification(
          "transaction_deleted",
          "Transacción eliminada",
          `${deleteTransaction.title}: $${Number(deleteTransaction.amount).toLocaleString()}`
        )
        
        setDeleteTransaction(null)
        fetchTransactions()
      } else {
        alert("Error al eliminar la transacción")
      }
    } catch (err) {
      console.error("[v0] Error deleting transaction:", err)
      alert("Error al eliminar la transacción")
    } finally {
      setIsSaving(false)
    }
  }

  const filteredCategories = editingTransaction 
    ? categories.filter((c) => c.type === editingTransaction.type)
    : []

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">No hay transacciones</p>
              <p className="text-sm text-muted-foreground mb-4">
                Comienza agregando tu primera transacción usando el botón "Nueva Transacción"
              </p>
              {(month && year) && (
                <p className="text-xs text-muted-foreground">
                  Mostrando datos de {new Date(year, month - 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border group hover:bg-accent/50">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{tx.icon}</span>
                  <div>
                    <p className="font-medium">{tx.title}</p>
                    <p className="text-sm text-muted-foreground">{tx.category_name}</p>
                    <p className="text-xs text-muted-foreground">{tx.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {allowEdit && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(tx)}
                        title="Editar transacción"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteTransaction(tx)}
                      title="Eliminar transacción"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Transacción</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <Select 
                  value={editingTransaction.type} 
                  onValueChange={(value) => setEditingTransaction({...editingTransaction, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <Select 
                  value={String(editingTransaction.category_id)} 
                  onValueChange={(value) => setEditingTransaction({...editingTransaction, category_id: Number(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <Input
                  value={editingTransaction.title}
                  onChange={(e) => setEditingTransaction({...editingTransaction, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Monto</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({...editingTransaction, amount: Number(e.target.value)})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Input
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={isSaving} className="flex-1">
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
                <Button variant="outline" onClick={() => setEditingTransaction(null)} disabled={isSaving}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deleteTransaction} onOpenChange={() => setDeleteTransaction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la transacción:
              <br />
              <strong>{deleteTransaction?.title}</strong> - ${deleteTransaction?.amount}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSaving}>
              {isSaving ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
