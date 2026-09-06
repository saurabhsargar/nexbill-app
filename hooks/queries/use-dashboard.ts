import { useQuery } from "@tanstack/react-query"
import {
  getDashboardSalesByCategory,
  getDashboardStats,
  getRecentTransactions,
  getSalesTrend,
  getTopProducts,
} from "@/lib/api/dashboard"
import type { TrendRange } from "@/types/api"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  salesTrend: (range: TrendRange) => [...dashboardKeys.all, "sales-trend", range] as const,
  salesByCategory: (range: TrendRange) =>
    [...dashboardKeys.all, "sales-by-category", range] as const,
  recentTransactions: (limit: number) =>
    [...dashboardKeys.all, "recent-transactions", limit] as const,
  topProducts: (range: TrendRange, limit: number) =>
    [...dashboardKeys.all, "top-products", range, limit] as const,
}

export function useDashboardStats() {
  return useQuery({ queryKey: dashboardKeys.stats(), queryFn: getDashboardStats })
}

export function useSalesTrend(range: TrendRange) {
  return useQuery({
    queryKey: dashboardKeys.salesTrend(range),
    queryFn: () => getSalesTrend(range),
  })
}

export function useDashboardSalesByCategory(range: TrendRange) {
  return useQuery({
    queryKey: dashboardKeys.salesByCategory(range),
    queryFn: () => getDashboardSalesByCategory(range),
  })
}

export function useRecentTransactions(limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.recentTransactions(limit),
    queryFn: () => getRecentTransactions(limit),
  })
}

export function useTopProducts(range: TrendRange, limit = 5) {
  return useQuery({
    queryKey: dashboardKeys.topProducts(range, limit),
    queryFn: () => getTopProducts(range, limit),
  })
}
