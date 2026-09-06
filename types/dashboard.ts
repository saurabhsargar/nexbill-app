import type { PaymentMethod } from "./invoice"

export interface DashboardStats {
  todaysSales: number
  todaysSalesChangePercent: number
  netProfit: number
  netProfitChangePercent: number
  expenses: number
  expensesChangePercent: number
  lowStockCount: number
  lowStockDelta: number
}

export interface SalesTrendPoint {
  period: string
  sales: number
}

export interface CategoryShare {
  category: string
  sharePercent: number
}

export interface RecentTransaction {
  id: string
  invoiceNumber: string
  customerName: string
  amount: number
  paymentMethod: PaymentMethod
  status: "PAID"
  createdAt: string
}

export interface TopProduct {
  productId: string
  name: string
  unitsSold: number
  revenue: number
}
