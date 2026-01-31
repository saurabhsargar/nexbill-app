"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  FileText,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

type TimeRange = "daily" | "weekly" | "monthly"

const salesData = [
  { name: "Jan", revenue: 45000, expenses: 32000 },
  { name: "Feb", revenue: 52000, expenses: 35000 },
  { name: "Mar", revenue: 48000, expenses: 31000 },
  { name: "Apr", revenue: 61000, expenses: 38000 },
  { name: "May", revenue: 55000, expenses: 34000 },
  { name: "Jun", revenue: 67000, expenses: 41000 },
  { name: "Jul", revenue: 72000, expenses: 43000 },
]

const categoryData = [
  { name: "Electronics", sales: 125000 },
  { name: "Accessories", sales: 89000 },
  { name: "Audio", sales: 67000 },
  { name: "Wearables", sales: 45000 },
  { name: "Home", sales: 32000 },
]

const taxReport = [
  { label: "Gross Sales", value: 358000, type: "revenue" },
  { label: "Returns & Refunds", value: -12500, type: "deduction" },
  { label: "Net Sales", value: 345500, type: "revenue" },
  { label: "GST Collected (18%)", value: 62190, type: "tax" },
  { label: "Input Tax Credit", value: -28500, type: "credit" },
  { label: "Net GST Payable", value: 33690, type: "tax" },
]

const stats = [
  { label: "Total Revenue", value: "$358,420", change: "+12.5%", trend: "up", icon: DollarSign, color: "emerald" },
  { label: "Total Orders", value: "2,847", change: "+8.2%", trend: "up", icon: ShoppingCart, color: "teal" },
  { label: "Avg Order Value", value: "$125.87", change: "+3.1%", trend: "up", icon: TrendingUp, color: "cyan" },
  { label: "New Customers", value: "186", change: "-2.4%", trend: "down", icon: Users, color: "amber" },
]

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">View detailed business insights and analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(["daily", "weekly", "monthly"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-all",
                  timeRange === range
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="size-4" />
            Date Range
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="size-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="size-4 text-rose-500" />
                    )}
                    <span className={cn("text-sm font-medium", stat.trend === "up" ? "text-emerald-500" : "text-rose-500")}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  "flex size-12 items-center justify-center rounded-xl",
                  stat.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                  stat.color === "teal" && "bg-teal-500/10 text-teal-500",
                  stat.color === "cyan" && "bg-cyan-500/10 text-cyan-500",
                  stat.color === "amber" && "bg-amber-500/10 text-amber-500"
                )}>
                  <stat.icon className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue vs Expenses */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    formatter={(value) => [
                      value !== undefined ? `$${Number(value).toLocaleString("en-IN")}` : "",
                      "",
                    ]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revenueGradient)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} fill="url(#expensesGradient)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    formatter={(value) => [
                      value !== undefined ? `$${Number(value).toLocaleString("en-IN")}` : "",
                      "Sales",
                    ]}

                  />
                  <Bar dataKey="sales" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Report */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">GST Tax Summary</CardTitle>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <FileText className="size-4" />
            Generate GST Report
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {taxReport.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl",
                  index === taxReport.length - 1
                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
                    : "bg-muted/50"
                )}
              >
                <span className={cn(
                  "font-medium",
                  index === taxReport.length - 1 && "text-emerald-600"
                )}>
                  {item.label}
                </span>
                <span className={cn(
                  "font-mono font-semibold",
                  item.type === "deduction" || item.type === "credit" ? "text-rose-500" : "",
                  index === taxReport.length - 1 && "text-lg text-emerald-600"
                )}>
                  {item.value < 0 ? "-" : ""}${Math.abs(item.value).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
