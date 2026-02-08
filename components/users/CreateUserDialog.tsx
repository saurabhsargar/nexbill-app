"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Role = "ADMIN" | "MANAGER" | "CASHIER"

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateUserDialog({ open, onClose, onCreated }: Props) {
  const { user } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("CASHIER")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allowedRoles: Role[] =
    user?.role === "ADMIN"
      ? ["ADMIN", "MANAGER", "CASHIER"]
      : ["CASHIER"]

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("access_token")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email, password, role }),
        }
      )

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to create user")
      }

      onCreated()
      onClose()

      // reset form
      setName("")
      setEmail("")
      setPassword("")
      setRole("CASHIER")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Label>Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              {allowedRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
