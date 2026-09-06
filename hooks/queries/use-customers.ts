import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api/client"
import { createCustomer, searchCustomers } from "@/lib/api/customers"
import type { CreateCustomerInput } from "@/types/customer"

export const customerKeys = {
  all: ["customers"] as const,
  search: (q?: string) => [...customerKeys.all, "search", q ?? ""] as const,
}

export function useCustomerSearch(search?: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.search(search),
    queryFn: () => searchCustomers(search),
    enabled,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: () => {
      toast.success("Customer added")
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to add customer")),
  })
}
