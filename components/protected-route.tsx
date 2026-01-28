"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    // Prevent rapid back-and-forth redirects by using a short-lived sessionStorage flag
    const safeToRedirect = () => {
      if (typeof window === "undefined") return false
      try {
        const last = parseInt(sessionStorage.getItem("protectedRedirect") || "0", 10)
        if (Date.now() - last < 3000) return false
        return true
      } catch (e) {
        return true
      }
    }

    const markRedirect = () => {
      try {
        sessionStorage.setItem("protectedRedirect", String(Date.now()))
      } catch (e) {
        // ignore
      }
    }

    // If there's no user, force a full-page redirect to login (avoid app-router fetch loops)
    if (!user) {
      if (typeof window !== "undefined" && pathname !== "/login" && safeToRedirect()) {
        markRedirect()
        window.location.replace("/login")
      }
      return
    }

    // If adminOnly and user is not admin, force full-page redirect to dashboard
    if (adminOnly && user?.role !== "admin") {
      if (typeof window !== "undefined" && !pathname?.startsWith("/dashboard") && safeToRedirect()) {
        markRedirect()
        window.location.replace("/dashboard")
      }
      return
    }
  }, [user, isLoading, adminOnly, pathname])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  // If not authenticated or not authorized, don't render children (we've redirected above)
  if (!user || (adminOnly && user.role !== "admin")) {
    return null
  }

  return <>{children}</>
}
