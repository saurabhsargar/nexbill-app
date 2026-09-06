"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { TopProducts } from "@/components/dashboard/top-products"
import { useDashboardStats } from "@/hooks/queries/use-dashboard"
import { formatCurrency, formatPercent } from "@/lib/format"

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  const cards = stats
    ? [
        {
          title: "Today's Sales",
          value: formatCurrency(stats.todaysSales),
          change: formatPercent(stats.todaysSalesChangePercent, { withSign: true }),
          trend: stats.todaysSalesChangePercent >= 0 ? ("up" as const) : ("down" as const),
          icon: DollarSign,
          color: "bg-emerald-500",
        },
        {
          title: "Net Profit",
          value: formatCurrency(stats.netProfit),
          change: formatPercent(stats.netProfitChangePercent, { withSign: true }),
          trend: stats.netProfitChangePercent >= 0 ? ("up" as const) : ("down" as const),
          icon: TrendingUp,
          color: "bg-teal-500",
        },
        {
          title: "Expenses",
          value: formatCurrency(stats.expenses),
          change: formatPercent(stats.expensesChangePercent, { withSign: true }),
          trend: stats.expensesChangePercent > 0 ? ("down" as const) : ("up" as const),
          icon: TrendingDown,
          color: "bg-amber-500",
        },
        {
          title: "Low Stock Alerts",
          value: `${stats.lowStockCount} Items`,
          change: `${stats.lowStockDelta > 0 ? "+" : ""}${stats.lowStockDelta} vs yesterday`,
          trend: "warning" as const,
          icon: AlertTriangle,
          color: "bg-rose-500",
        },
      ]
    : []

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
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[140px] rounded-xl" />)
          : cards.map((stat) => (
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
                        {stat.trend !== "warning" && (
                          <span className="text-xs text-muted-foreground">vs yesterday</span>
                        )}
                      </div>
                    </div>
                    <div className={`flex size-12 items-center justify-center rounded-xl ${stat.color}`}>
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
