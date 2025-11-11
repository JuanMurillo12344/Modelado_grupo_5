"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Wallet, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingBudget, setIsSavingBudget] = useState(false)
  const [monthlyBudget, setMonthlyBudget] = useState<string>("")
  const [currency, setCurrency] = useState<string>("USD")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSaveBudget = async () => {
    setIsSavingBudget(true)
    try {
      const response = await fetch("/api/settings/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyBudget: Number(monthlyBudget),
          preferredCurrency: currency,
        }),
      })

      if (response.ok) {
        alert("Presupuesto actualizado correctamente")
      } else {
        alert("Error al actualizar el presupuesto")
      }
    } catch (err) {
      console.error("[v0] Error saving budget:", err)
      alert("Error al actualizar el presupuesto")
    } finally {
      setIsSavingBudget(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Presupuesto</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user?.fullName ? getInitials(user.fullName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Cambiar Foto</Button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG. Máx 2MB</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input id="name" defaultValue={user?.fullName} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" defaultValue={user?.email} disabled />
                  <p className="text-xs text-muted-foreground">
                    El correo no puede ser modificado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Input id="role" defaultValue={user?.role === "admin" ? "Administrador" : "Usuario"} disabled />
                </div>
              </div>

              <Button className="w-full sm:w-auto" disabled={isLoading}>
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Presupuesto</CardTitle>
              <CardDescription>Define tu presupuesto mensual y moneda preferida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-budget">Presupuesto Mensual</Label>
                  <Input 
                    id="monthly-budget" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define tu límite de gastos mensuales. Se generarán alertas al superar el 80%.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda Preferida</Label>
                  <select 
                    id="currency" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - Libra Esterlina</option>
                  </select>
                </div>
              </div>

              <Button 
                className="w-full sm:w-auto" 
                onClick={handleSaveBudget}
                disabled={isSavingBudget}
              >
                {isSavingBudget ? "Guardando..." : "Guardar Presupuesto"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>Configura cómo quieres recibir alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Presupuesto</Label>
                    <p className="text-xs text-muted-foreground">
                      Recibe notificaciones cuando superes el 80% de tu presupuesto
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumen Semanal</Label>
                    <p className="text-xs text-muted-foreground">
                      Recibe un resumen de tus finanzas cada semana
                    </p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de Transacciones</Label>
                    <p className="text-xs text-muted-foreground">
                      Recordatorios para registrar transacciones pendientes
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </div>

              <Button className="w-full sm:w-auto">Guardar Preferencias</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña Actual</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button className="w-full sm:w-auto">Actualizar Contraseña</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
              <CardDescription>Acciones irreversibles en tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Eliminar Cuenta</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
