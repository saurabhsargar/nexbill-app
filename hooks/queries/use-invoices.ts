import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api/client"
import { createInvoice, downloadInvoicePdf, listInvoices } from "@/lib/api/invoices"
import { productKeys } from "./use-products"
import { dashboardKeys } from "./use-dashboard"
import type { CreateInvoiceInput, InvoiceQueryParams } from "@/types/invoice"

export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (params: InvoiceQueryParams) => [...invoiceKeys.all, "list", params] as const,
}

export function useInvoices(params: InvoiceQueryParams) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => listInvoices(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => createInvoice(input),
    onSuccess: (invoice) => {
      toast.success(`Invoice ${invoice.invoiceNumber} created`)
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create invoice")),
  })
}

export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: ({ id, invoiceNumber }: { id: string; invoiceNumber?: string }) =>
      downloadInvoicePdf(id, invoiceNumber),
    onError: (error) => toast.error(getErrorMessage(error, "Failed to download PDF")),
  })
}
