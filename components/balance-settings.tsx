"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMonth } from "@/contexts/month-context"

export function BalanceSettings() {
  const { month, year } = useMonth()
  const [currentBalance, setCurrentBalance] = useState(0)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchBalance()
  }, [month, year])

  const fetchBalance = async () => {
    try {
      const res = await fetch(`/api/monthly-balance?month=${month}&year=${year}`)
      const data = await res.json()
      setCurrentBalance(data.availableBalance || 0)
    } catch (error) {
      console.error("Error al cargar balance:", error)
    }
  }

  const handleUpdateBalance = async () => {
    const value = parseFloat(amount)
    
    if (isNaN(value) || value < 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto válido",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch("/api/monthly-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, initialBalance: value })
      })

      const data = await res.json()

      if (res.ok) {
        await fetchBalance() // Recargar balance completo
        setAmount("")
        
        toast({
          title: "✅ Balance del mes actualizado",
          description: `Balance inicial definido: $${value.toFixed(2)}`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el balance",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Dinero Disponible Mensual
        </CardTitle>
        <CardDescription>
          Ingresa cuánto dinero tienes disponible para gastar este mes. Las transacciones sumarán o restarán automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Actual */}
        <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
          <p className="text-sm text-muted-foreground mb-2">💵 Tienes Actualmente</p>
          <p className="text-4xl font-bold text-primary">
            ${currentBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Disponible para gastar</p>
        </div>

        {/* Input de monto */}
        <div className="space-y-2">
          <Label htmlFor="amount">Monto</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
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
              className="pl-9"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button
            onClick={handleUpdateBalance}
            disabled={loading || !amount}
            className="w-full"
            size="lg"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Definir mi dinero inicial del mes: ${amount || "0.00"}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            💡 Este será el balance inicial de <strong>este mes</strong>. Las transacciones que registres sumarán o restarán automáticamente.
          </p>
        </div>

      </CardContent>
    </Card>
  )
}
