import { apiClient } from "./client"
import { downloadBlob, filenameFromContentDisposition } from "@/lib/format"
import type { DateRangeParams } from "@/types/api"

export async function exportSalesXlsx(params?: DateRangeParams): Promise<void> {
  const res = await apiClient.get("/exports/sales", { params, responseType: "blob" })
  downloadBlob(
    res.data,
    filenameFromContentDisposition(res.headers["content-disposition"], "sales.xlsx")
  )
}

export async function exportInventoryCsv(): Promise<void> {
  const res = await apiClient.get("/exports/inventory", { responseType: "blob" })
  downloadBlob(
    res.data,
    filenameFromContentDisposition(res.headers["content-disposition"], "inventory.csv")
  )
}

export async function exportTaxReportsPdf(params?: DateRangeParams): Promise<void> {
  const res = await apiClient.get("/exports/tax-reports", { params, responseType: "blob" })
  downloadBlob(
    res.data,
    filenameFromContentDisposition(res.headers["content-disposition"], "gst-report.pdf")
  )
}
