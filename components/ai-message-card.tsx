"use client"

import { AIMessage } from "@/lib/ai-assistant"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Info, AlertTriangle, CheckCircle, Lightbulb, X } from "lucide-react"
import { useState } from "react"

interface AIMessageCardProps {
  message: AIMessage
  onAction?: (value: any) => void
  dismissible?: boolean
}

export function AIMessageCard({ message, onAction, dismissible = true }: AIMessageCardProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const getIcon = () => {
    switch (message.type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'suggestion':
        return <Lightbulb className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getVariant = () => {
    if (message.type === 'warning') return 'destructive'
    return 'default'
  }

  return (
    <Alert variant={getVariant()} className="relative">
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <div className="flex items-start gap-3 pr-8">
        <div className="mt-0.5 flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-base font-semibold leading-tight mb-1.5">
            {message.title}
          </AlertTitle>
          {/* Render bullets horizontally when message contains lines starting with • */}
          {(() => {
            const raw = message.message || ''
            const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
            const bulletLines = lines.filter(l => l.startsWith('•'))
            const otherLines = lines.filter(l => !l.startsWith('•'))

            if (bulletLines.length > 0) {
              return (
                <div className="space-y-5">
                  <div className="w-full flex flex-wrap gap-2 items-center text-sm">
                    {bulletLines.map((b, idx) => (
                      <Badge key={idx} variant="secondary" className="whitespace-nowrap">
                        {b.replace(/^•\s*/, '')}
                      </Badge>
                    ))}
                  </div>
                  {otherLines.map((p, i) => (
                    <div key={i} className="w-full">
                      <AlertDescription className="text-sm leading-snug">
                        {p}
                      </AlertDescription>
                    </div>
                  ))}
                </div>
              )
            }

            return (
              <AlertDescription className="text-sm leading-snug whitespace-pre-line">
                {raw}
              </AlertDescription>
            )
          })()}
          
          {message.action && onAction && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction(message.action!.value)}
              className="mt-2.5"
            >
              {message.action.label}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}
