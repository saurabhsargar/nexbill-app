"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useExportReport,
  useGenerateGstReportPdf,
  useGstSummary,
  useRevenueExpenses,
  useSalesByCategoryReport,
  useSummaryStats,
} from "@/hooks/queries/use-reports"
import type { TrendRange } from "@/types/api"

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<TrendRange>("monthly")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const dateParams = { from: from || undefined, to: to || undefined }

  const { data: stats, isLoading: statsLoading } = useSummaryStats(timeRange)
  const { data: trend, isLoading: trendLoading } = useRevenueExpenses(timeRange)
  const { data: categorySales, isLoading: categoryLoading } = useSalesByCategoryReport(dateParams)
  const { data: gstSummary, isLoading: gstLoading } = useGstSummary(dateParams)

  const exportReport = useExportReport()
  const generateGst = useGenerateGstReportPdf()

  const statCards = stats
    ? [
        { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), change: stats.totalRevenueChangePercent, icon: DollarSign, color: "emerald" },
        { label: "Total Orders", value: formatNumber(stats.totalOrders), change: stats.totalOrdersChangePercent, icon: ShoppingCart, color: "teal" },
        { label: "Avg Order Value", value: formatCurrency(stats.avgOrderValue), change: stats.avgOrderValueChangePercent, icon: TrendingUp, color: "cyan" },
        { label: "New Customers", value: formatNumber(stats.newCustomers), change: stats.newCustomersChangePercent, icon: Users, color: "amber" },
      ]
    : []

  const taxReport = gstSummary
    ? [
        { label: "Gross Sales", value: gstSummary.grossSales },
        { label: "Returns & Refunds", value: -Math.abs(gstSummary.returns) },
        { label: "Net Sales", value: gstSummary.netSales },
        { label: "GST Collected", value: gstSummary.gstCollected },
        { label: "Input Tax Credit", value: -Math.abs(gstSummary.inputTaxCredit) },
        { label: "Net GST Payable", value: gstSummary.netGstPayable },
      ]
    : []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">View detailed business insights and analytics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          <div className="flex items-center gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-36" />
            <span className="text-muted-foreground text-sm">to</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-36" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent" disabled={exportReport.isPending}>
                <Download className="size-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportReport.mutate({ format: "csv", params: dateParams })}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportReport.mutate({ format: "xlsx", params: dateParams })}>
                Export as XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading || !stats
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : statCards.map((stat) => (
              <Card key={stat.label} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stat.change >= 0 ? (
                          <TrendingUp className="size-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="size-4 text-rose-500" />
                        )}
                        <span className={cn("text-sm font-medium", stat.change >= 0 ? "text-emerald-500" : "text-rose-500")}>
                          {formatPercent(stat.change, { withSign: true })}
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-xl",
                        stat.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                        stat.color === "teal" && "bg-teal-500/10 text-teal-500",
                        stat.color === "cyan" && "bg-cyan-500/10 text-cyan-500",
                        stat.color === "amber" && "bg-amber-500/10 text-amber-500"
                      )}
                    >
                      <stat.icon className="size-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {trendLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend ?? []}>
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
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value?: number) => [formatCurrency(value ?? 0), ""]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revenueGradient)" name="Revenue" />
                    <Area type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} fill="url(#expensesGradient)" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {categoryLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (categorySales ?? []).length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No sales in this date range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                    <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value?: number) => [formatCurrency(value ?? 0), "Sales"]}
                    />
                    <Bar dataKey="sales" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Report */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">GST Tax Summary</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            disabled={generateGst.isPending}
            onClick={() => generateGst.mutate(dateParams)}
          >
            <FileText className="size-4" />
            Generate GST Report
          </Button>
        </CardHeader>
        <CardContent>
          {gstLoading || !gstSummary ? (
            <Skeleton className="h-64 w-full" />
          ) : (
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
                  <span className={cn("font-medium", index === taxReport.length - 1 && "text-emerald-600")}>
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      item.value < 0 && "text-rose-500",
                      index === taxReport.length - 1 && "text-lg text-emerald-600"
                    )}
                  >
                    {item.value < 0 ? "-" : ""}
                    {formatCurrency(Math.abs(item.value))}
                  </span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-1">
                Returns and Input Tax Credit are always ₹0 today — there&apos;s no refund or purchase-invoice
                model in NexBill yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
