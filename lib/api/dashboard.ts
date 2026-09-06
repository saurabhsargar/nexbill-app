import { apiClient } from "./client"
import type { TrendRange } from "@/types/api"
import type {
  CategoryShare,
  DashboardStats,
  RecentTransaction,
  SalesTrendPoint,
  TopProduct,
} from "@/types/dashboard"

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>("/dashboard/stats")
  return data
}

export async function getSalesTrend(range: TrendRange = "daily"): Promise<SalesTrendPoint[]> {
  const { data } = await apiClient.get<SalesTrendPoint[]>("/dashboard/sales-trend", {
    params: { range },
  })
  return data
}

export async function getDashboardSalesByCategory(
  range: TrendRange = "daily"
): Promise<CategoryShare[]> {
  const { data } = await apiClient.get<CategoryShare[]>("/dashboard/sales-by-category", {
    params: { range },
  })
  return data
}

export async function getRecentTransactions(limit = 5): Promise<RecentTransaction[]> {
  const { data } = await apiClient.get<RecentTransaction[]>("/dashboard/recent-transactions", {
    params: { limit },
  })
  return data
}

export async function getTopProducts(range: TrendRange = "daily", limit = 5): Promise<TopProduct[]> {
  const { data } = await apiClient.get<TopProduct[]>("/dashboard/top-products", {
    params: { range, limit },
  })
  return data
}
