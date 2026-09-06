import { apiClient } from "./client"
import type { CreateCustomerInput, Customer } from "@/types/customer"

export async function searchCustomers(search?: string): Promise<Customer[]> {
  const { data } = await apiClient.get<Customer[]>("/customers", {
    params: search ? { search } : undefined,
  })
  return data
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const { data } = await apiClient.post<Customer>("/customers", input)
  return data
}
