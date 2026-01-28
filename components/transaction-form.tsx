"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications } from "@/contexts/notification-context"
import { AIMessageCard } from "@/components/ai-message-card"
import { analyzeExpense, analyzeIncome, type AIMessage } from "@/lib/ai-assistant"

interface Category {
  id: number
  name: string
  icon: string
  type: string
}

const titlePlaceholders: Record<string, Record<string, string>> = {
  income: {
    'Salario': 'Ej: Pago de salario quincenal',
    'Freelance': 'Ej: Proyecto de diseño web',
    'Inversiones': 'Ej: Dividendos de acciones',
    'default': 'Ej: Ingreso extra'
  },
  expense: {
    'Alimentación': 'Ej: Almuerzo en restaurante',
    'Transporte': 'Ej: Recarga de tarjeta de transporte',
    'Educación': 'Ej: Compra de libros',
    'Entretenimiento': 'Ej: Entrada al cine',
    'Salud': 'Ej: Consulta médica',
    'Vivienda': 'Ej: Pago de alquiler',
    'Servicios': 'Ej: Factura de internet',
    'Ropa': 'Ej: Compra de ropa',
    'default': 'Ej: Gasto general'
  }
}

interface TransactionFormProps {
  onSuccess: () => void
  month: number
  year: number
}

export function TransactionForm({ onSuccess, month, year }: TransactionFormProps) {
  const { showNotification } = useNotifications()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [budgetAvailable, setBudgetAvailable] = useState<number | null>(null)
  const [budgetAllocated, setBudgetAllocated] = useState<number>(0)
  const [budgetSpent, setBudgetSpent] = useState<number>(0)
  const [loadingBudget, setLoadingBudget] = useState(false)
  const [aiMessage, setAiMessage] = useState<AIMessage | null>(null)
  const [availableBalance, setAvailableBalance] = useState<number>(0)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (type === "expense" && selectedCategory) {
      fetchBudgetAvailable()
    } else {
      setBudgetAvailable(null)
    }
  }, [selectedCategory, type, month, year])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      setCategories(data.categories)
    } catch (err) {
      console.error("[v0] Error fetching categories:", err)
    }
  }

  const fetchBudgetAvailable = async () => {
    if (!selectedCategory) return
    setLoadingBudget(true)
    try {
      const toMonthlyAmount = (amount: number, period?: string) => {
        if (period === "week") return amount * 4
        return amount
      }

      const response = await fetch(`/api/budget-config?month=${month}&year=${year}`)
      const data = await response.json()
      
      if (data.configured && data.categories) {
        const categoryBudget = data.categories.find((cat: any) => cat.categoryId === Number(selectedCategory))
        if (categoryBudget) {
          const allocated = categoryBudget.allocated
          const spent = categoryBudget.spent
          const available = allocated - spent
          
          setBudgetAllocated(allocated)
          setBudgetSpent(spent)
          setBudgetAvailable(available)
        } else {
          // Fallback a presupuestos fijos por categoría
          const fixedBudgetsRes = await fetch(`/api/budgets?month=${month}&year=${year}`)
          const fixedBudgetsData = await fixedBudgetsRes.json()
          const fixedBudget = (fixedBudgetsData.budgets || []).find(
            (budget: any) => budget.category_id === Number(selectedCategory)
          )

          if (fixedBudget) {
            const allocated = toMonthlyAmount(Number(fixedBudget.amount || 0), fixedBudget.period)
            const spent = Number(fixedBudget.spent || 0)
            const available = allocated - spent

            setBudgetAllocated(allocated)
            setBudgetSpent(spent)
            setBudgetAvailable(available)
          } else {
            setBudgetAvailable(null)
            setBudgetAllocated(0)
            setBudgetSpent(0)
          }
        }
      } else {
        const fixedBudgetsRes = await fetch(`/api/budgets?month=${month}&year=${year}`)
        const fixedBudgetsData = await fixedBudgetsRes.json()
        const fixedBudget = (fixedBudgetsData.budgets || []).find(
          (budget: any) => budget.category_id === Number(selectedCategory)
        )

        if (fixedBudget) {
          const allocated = toMonthlyAmount(Number(fixedBudget.amount || 0), fixedBudget.period)
          const spent = Number(fixedBudget.spent || 0)
          const available = allocated - spent

          setBudgetAllocated(allocated)
          setBudgetSpent(spent)
          setBudgetAvailable(available)
        } else {
          setBudgetAvailable(null)
          setBudgetAllocated(0)
          setBudgetSpent(0)
        }
      }

      // Obtener balance disponible
      const balanceRes = await fetch(`/api/monthly-balance?month=${month}&year=${year}`)
      const balanceData = await balanceRes.json()
      setAvailableBalance(balanceData.availableBalance || 0)
    } catch (err) {
      console.error("Error fetching budget:", err)
      setBudgetAvailable(null)
    } finally {
      setLoadingBudget(false)
    }
  }

  // Analizar el monto cuando cambia (solo para gastos)
  useEffect(() => {
    // Show AI messages for expenses and incomes
    if (type === "expense" && amount && selectedCategory && budgetAllocated > 0) {
      const amountValue = parseFloat(amount)
      if (!isNaN(amountValue) && amountValue > 0) {
        const category = categories.find(c => c.id === Number(selectedCategory))
        const message = analyzeExpense(
          amountValue,
          category?.name || "esta categoría",
          budgetAllocated,
          budgetSpent,
          availableBalance
        )
        setAiMessage(message)
      } else {
        setAiMessage(null)
      }
    } else if (type === "income" && amount) {
      const amountValue = parseFloat(amount)
      if (!isNaN(amountValue) && amountValue > 0) {
        // For income we provide a saving suggestion
        // currentSavings is approximated from availableBalance difference (best effort)
        const message = analyzeIncome(amountValue, 0, availableBalance + amountValue)
        setAiMessage(message)
      } else {
        setAiMessage(null)
      }
    } else {
      setAiMessage(null)
    }
  }, [amount, type, selectedCategory, budgetAllocated, budgetSpent, categories, availableBalance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validación previa para gastos
    if (type === "expense") {
      const amountValue = Number.parseFloat(amount)

      // Si hay un presupuesto por categoría, usar esa disponibilidad como prioridad
      if (budgetAvailable !== null) {
        if (amountValue > budgetAvailable) {
          setError(`⚠️ Este gasto ($${amountValue.toFixed(2)}) supera el presupuesto disponible ($${budgetAvailable.toFixed(2)}). Puedes ajustar tu presupuesto en la sección "Presupuesto" o registrar un monto menor.`)
          return
        }
      } else {
        // Si no hay presupuesto por categoría, validar contra el balance mensual
        if (availableBalance <= 0 || amountValue > availableBalance) {
          setError(`⚠️ No puedes registrar este gasto. Tu dinero disponible es $${availableBalance.toFixed(2)}.`)
          return
        }
      }
    }

    setIsLoading(true)

    try {
      // Crear fecha con el mes y año seleccionado
      const transactionDate = new Date(year, month - 1, new Date().getDate())
      
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          title,
          amount: Number.parseFloat(amount),
          description,
          type,
          date: transactionDate.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Manejar errores de validación de presupuesto
        if (data.requiresBudget) {
          setError("💡 Primero configura tu presupuesto mensual. Ve a la sección \"Presupuesto\" en el menú lateral.")
          return
        }
        if (data.requiresBalance) {
          setError(data.message || "⚠️ No puedes registrar este gasto por saldo insuficiente.")
          return
        }
        if (data.requiresIncome) {
          setError("💡 Debes registrar al menos un ingreso primero. Cambia a \"Ingreso\" arriba y registra tu mesada, beca o apoyo familiar.")
          return
        }
        throw new Error(data.message || data.error || "Error al crear transacción")
      }

      // Mostrar notificación inmediatamente
      const notificationType = type === "expense" ? "expense_added" : "income_added"
      const notificationTitle = type === "expense" ? "Gasto registrado" : "Ingreso registrado"
      const notificationMessage = `${title}: $${Number.parseFloat(amount).toLocaleString()}`
      
      showNotification(notificationType, notificationTitle, notificationMessage)

      setTitle("")
      setAmount("")
      setDescription("")
      setSelectedCategory("")
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating transaction")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCategories = categories.filter((c) => c.type === type)

  const getTitlePlaceholder = () => {
    if (!selectedCategory) return titlePlaceholders[type].default
    const category = categories.find((c) => c.id === Number(selectedCategory))
    if (!category) return titlePlaceholders[type].default
    return titlePlaceholders[type][category.name] || titlePlaceholders[type].default
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => {
                setType("income")
                setSelectedCategory("")
              }}
              className="flex-1"
            >
              Ingreso
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => {
                setType("expense")
                setSelectedCategory("")
              }}
              className="flex-1"
            >
              Gasto
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {type === "expense" && selectedCategory && (
              <div className="mt-2 text-sm">
                {loadingBudget ? (
                  <span className="text-muted-foreground">Cargando presupuesto...</span>
                ) : budgetAvailable !== null ? (
                  budgetAvailable > 0 ? (
                    <span className="text-green-600 font-medium">
                      💰 Disponible: ${budgetAvailable.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      ⚠️ Sin presupuesto disponible en esta categoría
                    </span>
                  )
                ) : (
                  <span className="text-amber-600 font-medium">
                    💡 Esta categoría no tiene presupuesto asignado
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monto</label>
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
              required
            />
          </div>

          {/* Mensaje de IA */}
          {aiMessage && (
            <AIMessageCard
              message={aiMessage}
              dismissible={true}
              onAction={(value) => {
                // Apply suggestion actions from AI messages
                if (typeof value === 'number') {
                  // If it's an amount suggestion, set it into the amount field
                  setAmount(String(value))
                } else if (typeof value === 'object' && value !== null) {
                  // Allow more complex actions in the future
                  if (value.amount !== undefined) setAmount(String(value.amount))
                }
              }}
            />
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input
              type="text"
              placeholder={getTitlePlaceholder()}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Input
              type="text"
              placeholder="Opcional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Agregar Transacción"}
          </Button>
        </form>
  )
}
