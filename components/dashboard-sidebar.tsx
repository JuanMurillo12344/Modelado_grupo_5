"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useBudgetAlerts } from "@/contexts/budget-alerts-context"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { NotificationCenter } from "@/components/notification-center"
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  PieChart, 
  Wallet, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Users,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transacciones",
    href: "/dashboard/transactions",
    icon: ArrowUpDown,
  },
  {
    name: "Presupuestos",
    href: "/dashboard/budgets",
    icon: Wallet,
  },
  {
    name: "Reportes",
    href: "/dashboard/reports",
    icon: PieChart,
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

const adminNavigation = [
  {
    name: "Panel Admin",
    href: "/dashboard/admin",
    icon: Users,
  },
]

export function DashboardSidebar() {
  const { user, logout } = useAuth()
  const { alertCount, refreshAlerts } = useBudgetAlerts()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    refreshAlerts()
    fetchUnreadCount()
    // Actualizar cada 60 segundos
    const interval = setInterval(() => {
      refreshAlerts()
      fetchUnreadCount()
    }, 60000)
    return () => clearInterval(interval)
  }, [refreshAlerts])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications?unread=true")
      const data = await response.json()
      const notifications = data.notifications || []
      const newCount = notifications.length
      
      // Solo actualizar el contador del badge (el toast ya se muestra al crear la acción)
      setUnreadCount(newCount)
    } catch (err) {
      console.error("Error fetching unread count:", err)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">FinanzApp</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("hidden lg:flex", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.fullName ? getInitials(user.fullName) : "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
        
        {/* Notifications Button */}
        <div className={cn("mt-3", collapsed ? "flex justify-center" : "")}>
          <Button
            variant="outline"
            size={collapsed ? "icon" : "default"}
            onClick={() => setNotificationOpen(true)}
            className={cn("relative", !collapsed && "w-full justify-start")}
          >
            <Bell className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Notificaciones</span>}
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const showBadge = item.name === "Presupuestos" && alertCount > 0
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="flex-1">{item.name}</span>}
                {!collapsed && showBadge && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500 text-white font-semibold">
                    {alertCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Admin Section */}
        {user?.role === "admin" && (
          <>
            <Separator className="my-4" />
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administración
              </p>
            )}
            <div className="space-y-1 mt-2">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      collapsed && "justify-center"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="flex-1">{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t space-y-2">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <ThemeToggle />
          {!collapsed && <span className="text-sm text-muted-foreground">Tema</span>}
        </div>

        <Button
          variant="ghost"
          className={cn("w-full justify-start", collapsed && "justify-center px-2")}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card border-r transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-30 lg:hidden shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Notification Center */}
      <NotificationCenter
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
        onUpdate={fetchUnreadCount}
      />
    </>
  )
}
