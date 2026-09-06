"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getSession, setSession, clearSession } from "@/lib/auth"
import { getMe } from "@/lib/api/auth"
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
  login: (token: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchAndSetUser = async () => {
    const data = await getMe()

    const fetchedUser: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    }

    setUser(fetchedUser)
    setOrganization(data.organization)

    return fetchedUser
  }

  useEffect(() => {
    const syncAuth = async () => {
      const token = getSession()

      if (!token) {
        setUser(null)
        setOrganization(null)
        setLoading(false)
        return
      }

      try {
        await fetchAndSetUser()
      } catch {
        clearSession()
        setUser(null)
        setOrganization(null)
      } finally {
        setLoading(false)
      }
    }

    syncAuth()
  }, [])

  const login = async (token: string) => {
    setSession(token)
    setLoading(true)

    try {
      return await fetchAndSetUser()
    } catch (err) {
      clearSession()
      setUser(null)
      setOrganization(null)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearSession()

    setUser(null)
    setOrganization(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, organization, loading, login, logout }}>
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
