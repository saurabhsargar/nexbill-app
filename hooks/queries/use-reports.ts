import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api/client"
import {
  exportReport,
  generateGstReportPdf,
  getGstSummary,
  getRevenueExpenses,
  getSalesByCategory,
  getSummaryStats,
} from "@/lib/api/reports"
import type { DateRangeParams, TrendRange } from "@/types/api"
import type { ExportFormat } from "@/types/reports"

export const reportKeys = {
  all: ["reports"] as const,
  summaryStats: (range: TrendRange) => [...reportKeys.all, "summary-stats", range] as const,
  revenueExpenses: (range: TrendRange) => [...reportKeys.all, "revenue-expenses", range] as const,
  salesByCategory: (params: DateRangeParams) =>
    [...reportKeys.all, "sales-by-category", params] as const,
  gstSummary: (params: DateRangeParams) => [...reportKeys.all, "gst-summary", params] as const,
}

export function useSummaryStats(range: TrendRange) {
  return useQuery({
    queryKey: reportKeys.summaryStats(range),
    queryFn: () => getSummaryStats(range),
  })
}

export function useRevenueExpenses(range: TrendRange) {
  return useQuery({
    queryKey: reportKeys.revenueExpenses(range),
    queryFn: () => getRevenueExpenses(range),
  })
}

export function useSalesByCategoryReport(params: DateRangeParams) {
  return useQuery({
    queryKey: reportKeys.salesByCategory(params),
    queryFn: () => getSalesByCategory(params),
  })
}

export function useGstSummary(params: DateRangeParams) {
  return useQuery({
    queryKey: reportKeys.gstSummary(params),
    queryFn: () => getGstSummary(params),
  })
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ format, params }: { format: ExportFormat; params?: DateRangeParams }) =>
      exportReport(format, params),
    onError: (error) => toast.error(getErrorMessage(error, "Export failed")),
  })
}

export function useGenerateGstReportPdf() {
  return useMutation({
    mutationFn: (params?: DateRangeParams) => generateGstReportPdf(params),
    onError: (error) => toast.error(getErrorMessage(error, "Failed to generate report")),
  })
}
