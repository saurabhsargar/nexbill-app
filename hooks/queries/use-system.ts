import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api/client"
import { clearCache, getSystemHealth, optimizeDatabase } from "@/lib/api/system"
import { exportInventoryCsv, exportSalesXlsx, exportTaxReportsPdf } from "@/lib/api/exports"

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system", "health"],
    queryFn: getSystemHealth,
    refetchInterval: 10_000,
  })
}

export function useOptimizeDatabase() {
  return useMutation({
    mutationFn: optimizeDatabase,
    onSuccess: (res) => toast.success(res.message),
    onError: (error) => toast.error(getErrorMessage(error, "Optimization failed")),
  })
}

export function useClearCache() {
  return useMutation({
    mutationFn: clearCache,
    onSuccess: (res) => toast.message(res.message),
    onError: (error) => toast.error(getErrorMessage(error, "Failed to clear cache")),
  })
}

export function useExportSales() {
  return useMutation({
    mutationFn: exportSalesXlsx,
    onSuccess: () => toast.success("Sales export downloaded"),
    onError: (error) => toast.error(getErrorMessage(error, "Export failed")),
  })
}

export function useExportInventory() {
  return useMutation({
    mutationFn: exportInventoryCsv,
    onSuccess: () => toast.success("Inventory export downloaded"),
    onError: (error) => toast.error(getErrorMessage(error, "Export failed")),
  })
}

export function useExportTaxReports() {
  return useMutation({
    mutationFn: exportTaxReportsPdf,
    onSuccess: () => toast.success("Tax report downloaded"),
    onError: (error) => toast.error(getErrorMessage(error, "Export failed")),
  })
}
