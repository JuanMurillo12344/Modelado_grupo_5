"use client"

import { useState } from "react"
import { TransactionsList } from "@/components/transactions-list"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionFilters, type FilterValues } from "@/components/transaction-filters"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export default function TransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const handleTransactionSuccess = () => {
    setRefreshKey((k) => k + 1)
    setIsDialogOpen(false)
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Transacciones</h1>
          <p className="text-muted-foreground">Historial completo de ingresos y gastos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Transacción
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Transacción</DialogTitle>
            </DialogHeader>
            <TransactionForm onSuccess={handleTransactionSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros Avanzados */}
      <TransactionFilters onFilterChange={handleFilterChange} />

      {/* Lista de Transacciones */}
      <TransactionsList refreshKey={refreshKey} filters={filters} />
    </div>
  )
}
