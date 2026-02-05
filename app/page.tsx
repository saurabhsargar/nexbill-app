"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Receipt, Eye, EyeOff, Shield, Zap } from "lucide-react"
import Image from "next/image"
import { loginUser } from "@/lib/api"
import { setSession } from "@/lib/auth"


export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = await loginUser(email, password)

      // backend returns { access_token }
      setSession(data.access_token)

      // fetch user from backend (authoritative)
      const payload = JSON.parse(
        atob(data.access_token.split(".")[1])
      )

      const backendRole = payload.role as "ADMIN" | "MANAGER" | "CASHIER"

      // role-based redirect (REAL)
      if (backendRole === "ADMIN") {
        router.push("/dashboard")
      } else if (backendRole === "MANAGER") {
        router.push("/inventory")
      } else {
        router.push("/billing")
      }

    } catch (err) {
      alert("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 bg-gradient-to-br from-emerald-50 to-slate-100">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="NexBill Logo"
          width={200}
          height={200}
        />
        {/* Heading */}
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-slate-900 leading-tight">
            Billing & POS Simplified.
          </h1>
          <p className="text-lg text-slate-600 max-w-md">
            Manage sales, GST invoices, inventory, and business analytics —
            all in one modern platform.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-white shadow-sm border p-4 text-center"
              >
                <p className="text-2xl font-bold text-emerald-600">
                  {item.value}
                </p>
                <p className="text-sm text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-400">
          NexBill v1.0.0 — Enterprise Edition
        </p>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border p-10 space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center items-center gap-3">
            <Image
              src="/logo.png"
              alt="NexBill Logo"
              width={200}
              height={200}
            />
          </div>

          {/* Title */}
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Welcome Back 👋
            </h2>
            <p className="text-slate-500 text-sm">
              Login to continue managing your business
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-slate-700">Email Address</Label>
              <Input
                type="email"
                placeholder="admin@nexbill.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-slate-700">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-emerald-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300 text-emerald-500"
                />
                Remember me
              </label>

              <button
                type="button"
                className="text-sm text-emerald-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400">
            Secure login protected with encryption 🔒
          </p>
        </div>
      </div>
    </div>
  )
}
