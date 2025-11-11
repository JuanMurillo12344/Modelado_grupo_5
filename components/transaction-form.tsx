"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications } from "@/contexts/notification-context"

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

export function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const { showNotification } = useNotifications()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      setCategories(data.categories)
    } catch (err) {
      console.error("[v0] Error fetching categories:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          title,
          amount: Number.parseFloat(amount),
          description,
          type,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create transaction")
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
    <Card>
      <CardHeader>
        <CardTitle>Nueva Transacción</CardTitle>
      </CardHeader>
      <CardContent>
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
          </div>

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
            <label className="block text-sm font-medium mb-1">Monto</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
      </CardContent>
    </Card>
  )
}
