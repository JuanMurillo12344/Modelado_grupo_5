"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bell, Check, CheckCheck, Trash2, TrendingDown, TrendingUp, Edit,
  PiggyBank, AlertTriangle, Info, DollarSign
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Notification {
  id: number
  type: "transaction" | "budget" | "system" | "alert"
  title: string
  message: string
  icon: string
  is_read: boolean
  created_at: string
}

interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function NotificationCenter({ open, onOpenChange, onUpdate }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, filter])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const url = filter === "unread" ? "/api/notifications?unread=true" : "/api/notifications"
      const response = await fetch(url)
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      console.error("Error fetching notifications:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })
      
      // Actualizar el estado local
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      
      // Notificar al sidebar para actualizar el badge
      onUpdate?.()
      
      // Si estamos en la pestaña "No leídas", refrescar para eliminar de la vista
      if (filter === "unread") {
        setTimeout(() => fetchNotifications(), 300)
      }
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      })
      
      // Actualizar todas como leídas
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      
      // Notificar al sidebar
      onUpdate?.()
      
      // Si estamos en "No leídas", refrescar
      if (filter === "unread") {
        setTimeout(() => fetchNotifications(), 300)
      }
    } catch (err) {
      console.error("Error marking all as read:", err)
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      TrendingDown: <TrendingDown className="h-6 w-6 text-red-500" />,
      TrendingUp: <TrendingUp className="h-6 w-6 text-green-500" />,
      Edit: <Edit className="h-6 w-6 text-blue-500" />,
      Trash2: <Trash2 className="h-6 w-6 text-red-500" />,
      PiggyBank: <PiggyBank className="h-6 w-6 text-yellow-500" />,
      AlertTriangle: <AlertTriangle className="h-6 w-6 text-orange-500" />,
      Info: <Info className="h-6 w-6 text-blue-500" />,
      Bell: <Bell className="h-6 w-6 text-gray-500" />,
      DollarSign: <DollarSign className="h-6 w-6 text-green-500" />,
    }
    return iconMap[iconName] || <Bell className="h-6 w-6 text-gray-500" />
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "expense_added":
        return "bg-red-500"
      case "income_added":
        return "bg-green-500"
      case "transaction_updated":
        return "bg-blue-500"
      case "transaction_deleted":
        return "bg-red-600"
      case "budget_created":
      case "budget_updated":
        return "bg-yellow-500"
      case "budget_deleted":
        return "bg-orange-500"
      case "budget_exceeded":
        return "bg-red-500"
      case "transaction":
        return "bg-blue-500"
      case "budget":
        return "bg-yellow-500"
      case "alert":
        return "bg-red-500"
      case "system":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Centro de Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              No leídas ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {filter === "unread" ? "No tienes notificaciones sin leer" : "No hay notificaciones"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        notification.is_read
                          ? "bg-background"
                          : "bg-accent/50 border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono y badge de tipo */}
                        <div className="relative flex-shrink-0">
                          <div className="p-2 rounded-full bg-muted/50">
                            {getIconComponent(notification.icon)}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getTypeColor(
                              notification.type
                            )}`}
                          />
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            {!notification.is_read && (
                              <Badge variant="outline" className="flex-shrink-0">
                                Nuevo
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Marcar como leída
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
