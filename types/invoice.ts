import type { Customer } from "./customer"

export type PaymentMethod = "CASH" | "UPI" | "CARD"

export interface InvoiceItem {
  id: string
  productName: string
  sku: string
  category: string
  unitPrice: number | string
  unitCost: number | string
  quantity: number
  taxRate: number | string
  taxAmount: number | string
  lineTotal: number | string
  invoiceId: string
  productId: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  subtotal: number | string
  discountPercent: number | string
  discountAmount: number | string
  taxAmount: number | string
  total: number | string
  paymentMethod: PaymentMethod
  createdAt: string
  organizationId: string
  customerId?: string | null
  cashierId: string
  items: InvoiceItem[]
  customer?: Customer | null
}

export interface CreateInvoiceInput {
  customerId?: string
  items: { productId: string; quantity: number }[]
  discountPercent?: number
  paymentMethod: PaymentMethod
}

export interface InvoiceQueryParams {
  page?: number
  pageSize?: number
  from?: string
  to?: string
}
