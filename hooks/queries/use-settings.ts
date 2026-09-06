import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api/client"
import {
  getInvoiceConfig,
  getRegionalSettings,
  getTaxConfig,
  updateInvoiceConfig,
  updateRegionalSettings,
  updateTaxConfig,
} from "@/lib/api/settings"
import type {
  UpdateInvoiceConfigInput,
  UpdateRegionalSettingsInput,
  UpdateTaxConfigInput,
} from "@/types/settings"

export const settingsKeys = {
  taxConfig: ["settings", "tax-config"] as const,
  invoiceConfig: ["settings", "invoice-config"] as const,
  regional: ["settings", "regional"] as const,
}

export function useTaxConfig() {
  return useQuery({ queryKey: settingsKeys.taxConfig, queryFn: getTaxConfig })
}

export function useUpdateTaxConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateTaxConfigInput) => updateTaxConfig(input),
    onSuccess: () => {
      toast.success("Tax configuration saved")
      queryClient.invalidateQueries({ queryKey: settingsKeys.taxConfig })
      queryClient.invalidateQueries({ queryKey: ["business", "invoice-preview"] })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to save tax configuration")),
  })
}

export function useInvoiceConfig() {
  return useQuery({ queryKey: settingsKeys.invoiceConfig, queryFn: getInvoiceConfig })
}

export function useUpdateInvoiceConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateInvoiceConfigInput) => updateInvoiceConfig(input),
    onSuccess: () => {
      toast.success("Invoice settings saved")
      queryClient.invalidateQueries({ queryKey: settingsKeys.invoiceConfig })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to save invoice settings")),
  })
}

export function useRegionalSettings() {
  return useQuery({ queryKey: settingsKeys.regional, queryFn: getRegionalSettings })
}

export function useUpdateRegionalSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateRegionalSettingsInput) => updateRegionalSettings(input),
    onSuccess: () => {
      toast.success("Regional settings saved")
      queryClient.invalidateQueries({ queryKey: settingsKeys.regional })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to save regional settings")),
  })
}
