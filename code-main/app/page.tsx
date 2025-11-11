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
      router.push(user.role === "admin" ? "/admin" : "/dashboard")
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="text-center space-y-6 max-w-md px-4">
        <h1 className="text-4xl font-bold">FINANZAPP</h1>
        <p className="text-lg text-muted-foreground">
          Manage your finances like a pro. Track spending, set budgets, and achieve your financial goals.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button variant="outline" size="lg">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg">Registrarse</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
