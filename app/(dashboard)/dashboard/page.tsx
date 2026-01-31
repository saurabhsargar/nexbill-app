"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { TopProducts } from "@/components/dashboard/top-products"

const stats = [
  {
    title: "Today's Sales",
    value: "$12,426",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    color: "bg-emerald-500",
    textColor: "text-emerald-500",
  },
  {
    title: "Net Profit",
    value: "$3,847",
    change: "+8.2%",
    trend: "up" as const,
    icon: TrendingUp,
    color: "bg-teal-500",
    textColor: "text-teal-500",
  },
  {
    title: "Expenses",
    value: "$2,156",
    change: "-3.1%",
    trend: "down" as const,
    icon: TrendingDown,
    color: "bg-amber-500",
    textColor: "text-amber-500",
  },
  {
    title: "Low Stock Alerts",
    value: "8 Items",
    change: "+2 new",
    trend: "warning" as const,
    icon: AlertTriangle,
    color: "bg-rose-500",
    textColor: "text-rose-500",
  },
]

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here&apos;s your business overview.</p>
        </div>
        <Link href="/billing">
          <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
            <Plus className="size-4" />
            Create New Bill
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border border-border bg-card hover:border-border/80 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="size-4 text-emerald-500" />
                    ) : stat.trend === "down" ? (
                      <ArrowDownRight className="size-4 text-amber-500" />
                    ) : (
                      <AlertTriangle className="size-4 text-rose-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        stat.trend === "up"
                          ? "text-emerald-500"
                          : stat.trend === "down"
                          ? "text-amber-500"
                          : "text-rose-500"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs yesterday</span>
                  </div>
                </div>
                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <stat.icon className="size-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <TopProducts />
      </div>
    </div>
  )
}
