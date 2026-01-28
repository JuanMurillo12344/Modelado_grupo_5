"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { suggestBudgetDistribution, type BudgetDistribution } from "@/lib/ai-assistant"
import { Sparkles, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AIBudgetAssistantProps {
  totalBudget: number
  savingsAmount: number
  categories: Array<{ id: number; name: string; type: string }>
  onApplySuggestion: (distribution: BudgetDistribution[]) => void
}

export function AIBudgetAssistant({
  totalBudget,
  savingsAmount,
  categories,
  onApplySuggestion
}: AIBudgetAssistantProps) {
  const [showAssistant, setShowAssistant] = useState(true) // Cambiar a true por defecto
  const [suggestions, setSuggestions] = useState<BudgetDistribution[]>([])
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    if (totalBudget > 0) {
      const distribution = suggestBudgetDistribution(totalBudget, savingsAmount, categories)
      setSuggestions(distribution)
    }
  }, [totalBudget, savingsAmount, categories])

  if (!showAssistant) {
    return (
      <Card className="border-dashed border-2 border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">¿Necesitas ayuda para distribuir tu presupuesto?</h3>
                <p className="text-sm text-muted-foreground">
                  La IA puede sugerirte cómo asignar tu dinero según tus necesidades
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAssistant(true)}
              disabled={totalBudget <= 0}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Activar Asistente IA
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleApply = () => {
    onApplySuggestion(suggestions)
    setApplied(true)
    setTimeout(() => setApplied(false), 3000)
  }

  const availableForExpenses = totalBudget - savingsAmount

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Asistente Financiero IA</CardTitle>
              <CardDescription>
                Distribución inteligente para estudiantes foráneos
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAssistant(false)}
          >
            Cerrar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Presupuesto total</p>
              <p className="text-lg font-bold">${totalBudget.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Para gastos</p>
              <p className="text-lg font-bold text-primary">${availableForExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Distribución recomendada:</h4>
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.categoryId}
              className="p-3 bg-card border rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{suggestion.categoryName}</span>
                  <Badge variant="secondary">{suggestion.percentage}%</Badge>
                </div>
                <span className="font-bold text-primary">
                  ${suggestion.suggestedAmount.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {suggestion.reason}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleApply}
            className="flex-1"
            disabled={applied}
          >
            {applied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Aplicado
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Aplicar Sugerencia
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowAssistant(false)}
          >
            Hacerlo yo mismo
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          💡 Puedes modificar estas cantidades después de aplicarlas
        </p>
      </CardContent>
    </Card>
  )
}
