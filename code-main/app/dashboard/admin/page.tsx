"use client"

import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminUsersTab } from "@/components/admin-users-tab"
import { AdminCategoriesTab } from "@/components/admin-categories-tab"
import { AdminStats } from "@/components/admin-stats"
import { Shield } from "lucide-react"

export default function AdminPage() {
  const { user } = useAuth()

  console.log("Admin Page - User:", user)
  console.log("Admin Page - User Role:", user?.role)

  if (!user || user?.role !== "admin") {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground">
              No tienes permisos para acceder a esta página.
              {user && <span className="block mt-2 text-sm">Tu rol actual: {user.role}</span>}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">Gestión de usuarios, categorías y estadísticas del sistema</p>
      </div>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <AdminStats />
        </TabsContent>

        <TabsContent value="users">
          <AdminUsersTab />
        </TabsContent>

        <TabsContent value="categories">
          <AdminCategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
