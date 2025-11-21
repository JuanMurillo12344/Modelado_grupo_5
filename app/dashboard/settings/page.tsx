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
import { User, Wallet, Shield } from "lucide-react"
import { BalanceSettings } from "@/components/balance-settings"
import { ChangePasswordModal } from "@/components/change-password-modal"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingBudget, setIsSavingBudget] = useState(false)
  const [monthlyBudget, setMonthlyBudget] = useState<string>("")
  const [currency, setCurrency] = useState<string>("USD")
  const [firstName, setFirstName] = useState(user?.fullName?.split(" ")[0] || "")
  const [lastName, setLastName] = useState(user?.fullName?.split(" ").slice(1).join(" ") || "")
  const [email, setEmail] = useState(user?.email || "")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen es muy grande. Máximo 2MB",
        variant: "destructive"
      })
      return
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten imágenes",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Convertir a base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const imageData = reader.result as string

        const res = await fetch('/api/users/profile-picture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData })
        })

        if (res.ok) {
          await refreshUser()
          toast({
            title: "✅ Foto actualizada",
            description: "Tu foto de perfil se actualizó correctamente"
          })
        } else {
          throw new Error('Error al subir imagen')
        }
      }

      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveImage = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/users/profile-picture', {
        method: 'DELETE'
      })

      if (res.ok) {
        await refreshUser()
        toast({
          title: "✅ Foto eliminada",
          description: "Tu foto de perfil se eliminó correctamente"
        })
      } else {
        throw new Error('Error al eliminar imagen')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Error",
        description: "El nombre y apellido son requeridos",
        variant: "destructive",
      })
      return
    }

    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Información actualizada",
          description: "Tus datos se han guardado correctamente",
        })
        // Actualizar el contexto de usuario
        await refreshUser()
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar la información",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error saving profile:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Mi Dinero</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Foto de perfil" className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {user?.fullName ? getInitials(user.fullName) : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-picture-input"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('profile-picture-input')?.click()}
                    disabled={isLoading}
                  >
                    Cambiar Foto de Perfil
                  </Button>
                  {user?.profilePicture && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                      className="text-red-600"
                    >
                      Eliminar Foto
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG. Máximo 2MB
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Nombre</Label>
                  <p className="text-lg font-medium">{user?.fullName || "Sin nombre"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Correo Electrónico</Label>
                  <p className="text-lg font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 Para cambiar tu nombre o correo, ve a la pestaña <strong>Seguridad</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          {/* Balance Disponible */}
          <BalanceSettings />

        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {/* Información Personal Editable */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu nombre, apellido y correo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Juan" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Pérez" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-edit">Correo Electrónico</Label>
                <Input 
                  id="email-edit" 
                  type="email" 
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button 
                className="w-full sm:w-auto" 
                onClick={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardContent>
          </Card>

          {/* Cambiar Contraseña */}
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordModal />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
