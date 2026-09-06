import { apiClient } from "./client"
import { downloadBlob, filenameFromContentDisposition } from "@/lib/format"
import type { PaginatedResult } from "@/types/api"
import type { CreateInvoiceInput, Invoice, InvoiceQueryParams } from "@/types/invoice"

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>("/invoices", input)
  return data
}

export async function listInvoices(
  params: InvoiceQueryParams
): Promise<PaginatedResult<Invoice>> {
  const { data } = await apiClient.get<PaginatedResult<Invoice>>("/invoices", { params })
  return data
}

export async function getInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.get<Invoice>(`/invoices/${id}`)
  return data
}

export async function downloadInvoicePdf(id: string, invoiceNumber?: string): Promise<void> {
  const res = await apiClient.get(`/invoices/${id}/pdf`, { responseType: "blob" })
  downloadBlob(
    res.data,
    filenameFromContentDisposition(
      res.headers["content-disposition"],
      `${invoiceNumber || id}.pdf`
    )
  )
}
