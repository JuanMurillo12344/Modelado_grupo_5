"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  email: string
  fullName: string
  role: string
  profilePicture?: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in and validate token/server cookie
    const validateToken = async () => {
      const storedToken = localStorage.getItem("auth_token")
      const storedUser = localStorage.getItem("auth_user")

      // If we have client-side data, initialize it optimistically
      if (storedToken && storedUser) {
        setToken(storedToken)
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          setUser(null)
        }
      }

      try {
        // Prefer server-side validation via cookie by requesting the current user
        const resp = await fetch("/api/users/me")
        if (resp.status === 200) {
          const data = await resp.json()
          setUser(data.user)
          // keep localStorage in sync
          localStorage.setItem("auth_user", JSON.stringify(data.user))
        } else if (resp.status === 401) {
          // Not authorized on server, clear both client and server state
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
          setToken(null)
          setUser(null)
        }
      } catch (err) {
        console.error("Error validating server session:", err)
        // If server check fails (network), keep optimistic client-side state if any
      } finally {
        setIsLoading(false)
      }
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

  const refreshUser = async () => {
    try {
      // Fetch updated user info from the database
      const response = await fetch("/api/users/me")
      
      if (response.ok) {
        const data = await response.json()
        const updatedUser = data.user
        
        setUser(updatedUser)
        localStorage.setItem("auth_user", JSON.stringify(updatedUser))
      }
    } catch (err) {
      console.error("Error refreshing user:", err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
