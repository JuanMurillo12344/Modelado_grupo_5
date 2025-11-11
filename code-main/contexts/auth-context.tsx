"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  email: string
  fullName: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in and validate token
    const validateToken = async () => {
      const storedToken = localStorage.getItem("auth_token")
      const storedUser = localStorage.getItem("auth_user")

      if (storedToken && storedUser) {
        try {
          // Validate token by making a test request
          const response = await fetch("/api/categories")
          
          if (response.status === 401) {
            // Token is invalid, clear everything including cookies
            localStorage.removeItem("auth_token")
            localStorage.removeItem("auth_user")
            
            // Clear the server-side cookie
            await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
            
            setToken(null)
            setUser(null)
            setIsLoading(false)
            
            // Force immediate redirect with full page reload
            window.location.href = "/login"
            return
          } else {
            // Token is valid
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
          }
        } catch (err) {
          console.error("Error validating token:", err)
          // Clear invalid data
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
          setToken(null)
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    validateToken()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    const data = await response.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem("auth_token", data.token)
    localStorage.setItem("auth_user", JSON.stringify(data.user))

    router.push("/dashboard")
  }

  const register = async (email: string, password: string, fullName: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    })

    if (!response.ok) {
      throw new Error("Registration failed")
    }

    const data = await response.json()
    router.push("/login")
  }

  const logout = async () => {
    // Clear server-side cookie
    await fetch("/api/auth/logout", { method: "POST" })
    
    // Clear client-side data
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    
    // Force full page reload to clear any cached state
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
