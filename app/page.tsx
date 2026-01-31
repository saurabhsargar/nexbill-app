"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Receipt, Eye, EyeOff, Shield, Zap } from "lucide-react"

type Role = "Admin" | "Cashier"

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("Admin")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500">
            <Receipt className="size-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">NexBill</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight text-balance">
            Enterprise Billing & POS System
          </h1>
          <p className="text-lg text-slate-400 max-w-md">
            Streamline your business operations with real-time inventory tracking, smart billing, and comprehensive analytics.
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-emerald-400">10K+</p>
              <p className="text-sm text-slate-500">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">99.9%</p>
              <p className="text-sm text-slate-500">Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">24/7</p>
              <p className="text-sm text-slate-500">Support</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-slate-600">
          NexBill v1.0.0 - Enterprise Edition
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500">
              <Receipt className="size-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">NexBill</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-slate-400">Sign in to your account to continue</p>
          </div>

          {/* Role Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-300">Select Role</Label>
            <div className="flex gap-3">
              {(["Admin", "Cashier"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 border",
                    role === r
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
                  )}
                >
                  {r === "Admin" ? <Shield className="size-4" /> : <Zap className="size-4" />}
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@nexbill.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-slate-950"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <button type="button" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                `Sign in as ${role}`
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Secure login with 256-bit encryption
          </p>
        </div>
      </div>
    </div>
  )
}
