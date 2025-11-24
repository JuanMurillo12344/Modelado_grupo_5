"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Lock } from "lucide-react"

export function ChangePasswordModal() {
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Validar si las contraseñas coinciden en tiempo real
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== ""
  const passwordsDontMatch = confirmPassword !== "" && newPassword !== confirmPassword

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Completa todos los campos",
        variant: "destructive"
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      })
      return
    }

    if (newPassword.length < 5) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 5 caracteres",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "✅ Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente",
        })

        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setOpen(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo cambiar la contraseña",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cambiar la contraseña",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Lock className="mr-2 h-4 w-4" />
          Cambiar Contraseña
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu contraseña actual y la nueva contraseña
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current">Contraseña Actual</Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new">Nueva Contraseña</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={newPassword.length > 0 && newPassword.length < 5 ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 5 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={
                passwordsDontMatch 
                  ? "border-destructive" 
                  : passwordsMatch 
                  ? "border-green-500" 
                  : ""
              }
            />
            {passwordsDontMatch && (
              <p className="text-xs text-destructive">
                ❌ Las contraseñas no coinciden
              </p>
            )}
            {passwordsMatch && (
              <p className="text-xs text-green-600">
                ✅ Las contraseñas coinciden
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleChangePassword} 
            disabled={loading || !passwordsMatch || newPassword.length < 5}
          >
            {loading ? "Cambiando..." : "Cambiar Contraseña"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
