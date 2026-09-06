import { apiClient } from "./client"
import { downloadBlob, filenameFromContentDisposition } from "@/lib/format"
import type { DateRangeParams, TrendRange } from "@/types/api"
import type { CategorySales, ExportFormat, GstSummary, RevenueExpensePoint, SummaryStats } from "@/types/reports"

export async function getSummaryStats(range: TrendRange = "daily"): Promise<SummaryStats> {
  const { data } = await apiClient.get<SummaryStats>("/reports/summary-stats", {
    params: { range },
  })
  return data
}

export async function getRevenueExpenses(range: TrendRange = "daily"): Promise<RevenueExpensePoint[]> {
  const { data } = await apiClient.get<RevenueExpensePoint[]>("/reports/revenue-expenses", {
    params: { range },
  })
  return data
}

export async function getSalesByCategory(params?: DateRangeParams): Promise<CategorySales[]> {
  const { data } = await apiClient.get<CategorySales[]>("/reports/sales-by-category", { params })
  return data
}

export async function getGstSummary(params?: DateRangeParams): Promise<GstSummary> {
  const { data } = await apiClient.get<GstSummary>("/reports/gst-summary", { params })
  return data
}

export async function exportReport(format: ExportFormat, params?: DateRangeParams): Promise<void> {
  const res = await apiClient.get("/reports/export", {
    params: { format, ...params },
    responseType: "blob",
  })
  downloadBlob(
    res.data,
    filenameFromContentDisposition(res.headers["content-disposition"], `report.${format}`)
  )
}

export async function generateGstReportPdf(params?: DateRangeParams): Promise<void> {
  const res = await apiClient.post("/reports/gst/generate", null, {
    params,
    responseType: "blob",
  })
  downloadBlob(
    res.data,
    filenameFromContentDisposition(res.headers["content-disposition"], "gst-report.pdf")
  )
}
