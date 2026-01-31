"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Search,
  Plus,
  Shield,
  Zap,
  MoreVertical,
  Edit2,
  Trash2,
  Mail,
  Phone,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@nexbill.com",
    phone: "+1 234 567 8900",
    role: "Admin" as const,
    status: "active" as const,
    permissions: ["billing", "inventory", "users", "reports", "settings"],
    lastActive: "Just now",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@nexbill.com",
    phone: "+1 234 567 8901",
    role: "Admin" as const,
    status: "active" as const,
    permissions: ["billing", "inventory", "reports"],
    lastActive: "5 min ago",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike.w@nexbill.com",
    phone: "+1 234 567 8902",
    role: "Cashier" as const,
    status: "active" as const,
    permissions: ["billing"],
    lastActive: "2 hours ago",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.d@nexbill.com",
    phone: "+1 234 567 8903",
    role: "Cashier" as const,
    status: "inactive" as const,
    permissions: ["billing", "inventory"],
    lastActive: "3 days ago",
  },
  {
    id: "5",
    name: "Robert Brown",
    email: "robert.b@nexbill.com",
    phone: "+1 234 567 8904",
    role: "Cashier" as const,
    status: "active" as const,
    permissions: ["billing"],
    lastActive: "1 hour ago",
  },
]

const permissionLabels: Record<string, string> = {
  billing: "Billing & POS",
  inventory: "Inventory",
  users: "User Management",
  reports: "Reports",
  settings: "Settings",
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage users and their access permissions.</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25">
          <Plus className="size-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Shield className="size-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-500/10">
              <Zap className="size-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Cashiers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Shield className="size-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 pl-11 rounded-xl"
        />
      </div>

      {/* User Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12 border-2 border-muted">
                    <AvatarFallback className={cn(
                      "text-white font-semibold",
                      user.role === "Admin"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                        : "bg-gradient-to-br from-cyan-500 to-blue-500"
                    )}>
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <Badge
                      className={cn(
                        "text-xs",
                        user.role === "Admin"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                      )}
                    >
                      {user.role === "Admin" ? <Shield className="mr-1 size-3" /> : <Zap className="mr-1 size-3" />}
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit2 className="mr-2 size-4" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  {user.phone}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "size-2 rounded-full",
                    user.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                  )} />
                  <span className="text-xs text-muted-foreground">{user.lastActive}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Active</span>
                  <Switch checked={user.status === "active"} />
                </div>
              </div>

              {/* Permissions */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {user.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-[10px] px-1.5">
                      {permissionLabels[perm]}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
