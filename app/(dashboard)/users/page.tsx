"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Search, Plus, Shield, Zap, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateUserDialog } from "@/components/users/CreateUserDialog"

type User = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "MANAGER" | "CASHIER"
}

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [openCreate, setOpenCreate] = useState(false)

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error("User fetch failed", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, searchQuery])

  if (loading) {
    return <div className="p-6">Loading users…</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage users in your organization
          </p>
        </div>

        {user?.role !== "CASHIER" && (
          <Button
            className="gap-2"
            onClick={() => setOpenCreate(true)}
            disabled={loading}
          >
            <Plus className="size-4" />
            Add User
          </Button>
        )}
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

      {/* Users Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((u) => (
          <Card key={u.id} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback
                      className={cn(
                        "text-white font-semibold",
                        u.role === "ADMIN"
                          ? "bg-emerald-500"
                          : u.role === "MANAGER"
                            ? "bg-blue-500"
                            : "bg-cyan-500"
                      )}
                    >
                      {u.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <Badge
                      className={cn(
                        "text-xs",
                        u.role === "ADMIN"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : u.role === "MANAGER"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-cyan-500/10 text-cyan-600"
                      )}
                    >
                      {u.role === "ADMIN" ? (
                        <Shield className="mr-1 size-3" />
                      ) : (
                        <Zap className="mr-1 size-3" />
                      )}
                      {u.role}
                    </Badge>
                  </div>
                </div>

                {user?.role === "ADMIN" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{u.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateUserDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={fetchUsers}
      />
    </div>
  )
}
