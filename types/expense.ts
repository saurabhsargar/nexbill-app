export interface Expense {
  id: string
  category: string
  amount: number | string
  note?: string | null
  incurredAt: string
  createdAt: string
  organizationId: string
}

export interface CreateExpenseInput {
  category: string
  amount: number
  note?: string
  incurredAt?: string
}

export interface ExpenseQueryParams {
  from?: string
  to?: string
}
