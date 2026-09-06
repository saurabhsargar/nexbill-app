"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateUser } from "@/hooks/queries/use-users"
import type { Role } from "@/types/auth"

interface Props {
  open: boolean
  onClose: () => void
}

export function CreateUserDialog({ open, onClose }: Props) {
  const { user } = useAuth()
  const createUser = useCreateUser()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("CASHIER")

  const allowedRoles: Role[] = user?.role === "ADMIN" ? ["ADMIN", "MANAGER", "CASHIER"] : ["CASHIER"]

  const reset = () => {
    setName("")
    setEmail("")
    setPassword("")
    setRole("CASHIER")
  }

  const handleSubmit = () => {
    createUser.mutate(
      { name, email, password, role },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      }
    )
  }

  const isValid = name.trim().length > 0 && /\S+@\S+\.\S+/.test(email) && password.length >= 6

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            New team members are added to your organization with the role you choose below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            >
              {allowedRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createUser.isPending || !isValid}>
            {createUser.isPending ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
