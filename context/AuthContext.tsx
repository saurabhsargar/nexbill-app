"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getSession, clearSession } from "@/lib/auth"
import { getMe } from "@/lib/api"
import { useRouter } from "next/navigation"

type Role = "ADMIN" | "MANAGER" | "CASHIER"

interface Organization {
  id: string
  name: string
  slug: string
}

interface User {
  id: string
  name: string
  email: string
  role: Role
}

interface AuthContextType {
  user: User | null
  organization: Organization | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = getSession()
    if (!token) {
      setLoading(false)
      return
    }

    getMe(token)
      .then((data) => {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
        setOrganization(data.organization)
      })
      .catch(() => {
        clearSession()
        setUser(null)
        setOrganization(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const logout = () => {
    clearSession()

    setUser(null)
    setOrganization(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, organization, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return ctx
}
