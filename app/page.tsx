"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              FINANZAPP
            </h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Controla tu plata como un{" "}
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                experto
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              La app más sencilla para manejar tus finanzas personales. Registra gastos e ingresos, 
              define presupuestos mensuales, y alcanza tus metas financieras sin complicaciones.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold mb-1">Reportes Detallados</h3>
                  <p className="text-sm text-muted-foreground">
                    Ve en qué gastaste cada mes, categoría por categoría con gráficos claros
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold mb-1">Presupuestos Inteligentes</h3>
                  <p className="text-sm text-muted-foreground">
                    Define límites por categoría y recibe alertas cuando te estés pasando
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold mb-1">Balance Mensual</h3>
                  <p className="text-sm text-muted-foreground">
                    Define cuánta plata tienes al inicio del mes y ve cuánto te queda en tiempo real
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold mb-1">Fácil y Rápido</h3>
                  <p className="text-sm text-muted-foreground">
                    Interfaz simple en español, sin complicaciones ni términos raros
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 pt-6">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  🚀 Comenzar Gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative">
            <div className="bg-muted/50 rounded-3xl p-8 shadow-2xl border">
              <div className="space-y-4">
                {/* Mock Dashboard Card */}
                <div className="bg-card rounded-xl p-4 shadow-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">💰 Dinero Disponible</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">$1,250.00</p>
                </div>

                {/* Mock Transaction */}
                <div className="bg-card rounded-xl p-4 shadow-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">🍔</span>
                      </div>
                      <div>
                        <p className="font-medium">Almuerzo</p>
                        <p className="text-xs text-muted-foreground">Alimentación</p>
                      </div>
                    </div>
                    <p className="font-bold text-red-600">-$12.50</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">💰</span>
                      </div>
                      <div>
                        <p className="font-medium">Pago de Mes</p>
                        <p className="text-xs text-muted-foreground">Salario</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">+$1,500.00</p>
                  </div>
                </div>

                {/* Mock Chart */}
                <div className="bg-card rounded-xl p-4 shadow-lg border">
                  <p className="text-sm text-muted-foreground mb-3">Gastos del Mes</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-red-500 rounded-full" style={{width: '60%'}}></div>
                      <span className="text-xs text-muted-foreground">Alimentación</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-blue-500 rounded-full" style={{width: '40%'}}></div>
                      <span className="text-xs text-muted-foreground">Transporte</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-green-500 rounded-full" style={{width: '30%'}}></div>
                      <span className="text-xs text-muted-foreground">Entretenimiento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 FINANZAPP - Maneja tu plata de forma simple y efectiva 💰</p>
        </div>
      </footer>
    </div>
  )
}
