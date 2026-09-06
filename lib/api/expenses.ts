import { apiClient } from "./client"
import type { CreateExpenseInput, Expense, ExpenseQueryParams } from "@/types/expense"

export async function listExpenses(params?: ExpenseQueryParams): Promise<Expense[]> {
  const { data } = await apiClient.get<Expense[]>("/expenses", { params })
  return data
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { data } = await apiClient.post<Expense>("/expenses", input)
  return data
}
