export interface SummaryStats {
  totalRevenue: number
  totalRevenueChangePercent: number
  totalOrders: number
  totalOrdersChangePercent: number
  avgOrderValue: number
  avgOrderValueChangePercent: number
  newCustomers: number
  newCustomersChangePercent: number
}

export interface RevenueExpensePoint {
  period: string
  revenue: number
  expenses: number
}

export interface CategorySales {
  category: string
  sales: number
}

export interface GstSummary {
  grossSales: number
  returns: number
  netSales: number
  gstCollected: number
  inputTaxCredit: number
  netGstPayable: number
}

export type ExportFormat = "csv" | "xlsx"
