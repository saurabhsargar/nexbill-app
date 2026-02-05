"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  BarChart3,
  Calculator,
  Settings,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Bell,
  LogOut,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { clearSession } from "@/lib/auth"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER"] },
  { name: "Billing", href: "/billing", icon: Receipt, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { name: "Inventory", href: "/inventory", icon: Package, roles: ["ADMIN", "MANAGER"] },
  { name: "Users", href: "/users", icon: Users, roles: ["ADMIN"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
  { name: "Accounting", href: "/accounting", icon: Calculator, roles: ["ADMIN"] },
  { name: "Utilities", href: "/utilities", icon: HardDrive, roles: ["ADMIN"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN", "MANAGER"] },
]

interface AppShellProps {
  children: ReactNode
  user: {
    name: string
    role: "ADMIN" | "MANAGER" | "CASHIER"
    avatar?: string
  }
}

export function AppShell({
  children,
  user,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };


  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "relative flex flex-col bg-white text-slate-700 border-r border-slate-200 shadow-sm transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center px-4 border-b border-slate-200">
          {collapsed ? (
            <Image
              src="/icon.png"
              alt="NexBill Icon"
              width={48}
              height={48}
              className="mx-auto object-contain"
            />
          ) : (
            <Image
              src="/logo.png"
              alt="NexBill Logo"
              width={140}
              height={36}
              className="object-contain"
              priority
            />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navigation
            .filter(item => item.roles.includes(user.role))
            .map((item) => {
              const isActive =
                pathname === item.href ||
                pathname?.startsWith(item.href + "/")

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 transform-gpu",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 scale-[1.01]"
                      : "text-slate-500 opacity-80 hover:opacity-100 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-emerald-500 transition-all duration-300" />
                  )}

                  <item.icon
                    className={cn(
                      "size-5 shrink-0 transition-colors duration-200",
                      isActive ? "text-emerald-600" : "text-slate-400"
                    )}
                  />

                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
        </nav>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 size-6 rounded-full border border-slate-200 bg-white shadow-md hover:bg-slate-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="size-3" />
          ) : (
            <ChevronLeft className="size-3" />
          )}
        </Button>

        {/* User Section */}
        <div className="border-t border-slate-200 p-3">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="size-9 border border-slate-200">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-emerald-500 text-white text-xs">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    user.role === "ADMIN"
                      ? "bg-emerald-500/20 text-emerald-600"
                      : user.role === "MANAGER"
                        ? "bg-blue-500/20 text-blue-600"
                        : "bg-cyan-500/20 text-cyan-600"
                  )}
                >
                  {user.role}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="size-4 text-emerald-500" />
            ) : (
              <WifiOff className="size-4 text-destructive" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                isOnline ? "text-emerald-500" : "text-destructive"
              )}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Clock */}
            <div className="text-right">
              <p className="text-sm font-semibold font-mono">
                {mounted
                  ? currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                  : "--:--:--"}
              </p>
              <p className="text-xs text-muted-foreground">
                {mounted
                  ? currentTime.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                  : ""}
              </p>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-emerald-500 text-white text-xs">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
