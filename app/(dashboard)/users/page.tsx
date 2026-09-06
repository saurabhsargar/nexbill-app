"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Search, Plus, Shield, Zap, MoreVertical, Users as UsersIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CreateUserDialog } from "@/components/users/CreateUserDialog"
import { useDeactivateUser, useUpdateUserRole, useUsers } from "@/hooks/queries/use-users"
import type { Role } from "@/types/auth"
import type { TeamMember } from "@/types/user"

export default function UsersPage() {
  const { user } = useAuth()
  const { data: users = [], isLoading } = useUsers()
  const updateRole = useUpdateUserRole()
  const deactivate = useDeactivateUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<TeamMember | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, searchQuery])

  const roleAvatarClass = (role: Role) =>
    role === "ADMIN"
      ? "bg-gradient-to-br from-emerald-500 to-teal-500"
      : role === "MANAGER"
        ? "bg-gradient-to-br from-blue-500 to-indigo-500"
        : "bg-gradient-to-br from-cyan-500 to-blue-500"

  const roleBadgeClass = (role: Role) =>
    role === "ADMIN"
      ? "bg-emerald-500/10 text-emerald-600"
      : role === "MANAGER"
        ? "bg-blue-500/10 text-blue-600"
        : "bg-cyan-500/10 text-cyan-600"

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage users and their access permissions.
          </p>
        </div>

        {user?.role !== "CASHIER" && (
          <Button
            onClick={() => setOpenCreate(true)}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"
          >
            <Plus className="size-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Shield className="size-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "ADMIN").length}
              </p>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
              <Shield className="size-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "MANAGER").length}
              </p>
              <p className="text-sm text-muted-foreground">Managers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-500/10">
              <Zap className="size-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "CASHIER").length}
              </p>
              <p className="text-sm text-muted-foreground">Cashiers</p>
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

      {/* Users Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-12 text-muted-foreground">
            <UsersIcon className="size-10 opacity-50" />
            <p className="font-medium">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((u) => (
            <Card
              key={u.id}
              className={cn("border-0 shadow-lg overflow-hidden", !u.isActive && "opacity-60")}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 border-2 border-muted">
                      <AvatarFallback className={cn("text-white font-semibold", roleAvatarClass(u.role))}>
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <Badge className={cn("text-xs", roleBadgeClass(u.role))}>
                        {u.role === "ADMIN" ? (
                          <Shield className="mr-1 size-3" />
                        ) : (
                          <Zap className="mr-1 size-3" />
                        )}
                        {u.role}
                      </Badge>
                    </div>
                  </div>

                  {user?.role === "ADMIN" && u.isActive && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(["ADMIN", "MANAGER", "CASHIER"] as Role[]).map((role) => (
                          <DropdownMenuItem
                            key={role}
                            disabled={u.id === user?.id || u.role === role || updateRole.isPending}
                            onClick={() => updateRole.mutate({ userId: u.id, role })}
                          >
                            Set as {role}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={u.id === user?.id}
                          onClick={() => setDeactivateTarget(u)}
                        >
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full", u.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                    <span className="text-xs text-muted-foreground">
                      {u.isActive ? "Active User" : "Deactivated"}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">{u.email}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateUserDialog open={openCreate} onClose={() => setOpenCreate(false)} />

      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deactivateTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This takes effect immediately, even on their current session, and cannot be
              undone from this screen &mdash; there is no reactivate action yet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deactivateTarget) deactivate.mutate(deactivateTarget.id)
                setDeactivateTarget(null)
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
