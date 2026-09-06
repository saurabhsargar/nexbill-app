import { apiClient } from "./client"
import type {
  InvoiceConfig,
  RegionalSettings,
  TaxConfig,
  UpdateInvoiceConfigInput,
  UpdateRegionalSettingsInput,
  UpdateTaxConfigInput,
} from "@/types/settings"

export async function getTaxConfig(): Promise<TaxConfig> {
  const { data } = await apiClient.get<TaxConfig>("/settings/tax-config")
  return data
}

export async function updateTaxConfig(input: UpdateTaxConfigInput): Promise<TaxConfig> {
  const { data } = await apiClient.put<TaxConfig>("/settings/tax-config", input)
  return data
}

export async function getInvoiceConfig(): Promise<InvoiceConfig> {
  const { data } = await apiClient.get<InvoiceConfig>("/settings/invoice-config")
  return data
}

export async function updateInvoiceConfig(
  input: UpdateInvoiceConfigInput
): Promise<InvoiceConfig> {
  const { data } = await apiClient.put<InvoiceConfig>("/settings/invoice-config", input)
  return data
}

export async function getRegionalSettings(): Promise<RegionalSettings> {
  const { data } = await apiClient.get<RegionalSettings>("/settings/regional")
  return data
}

export async function updateRegionalSettings(
  input: UpdateRegionalSettingsInput
): Promise<RegionalSettings> {
  const { data } = await apiClient.put<RegionalSettings>("/settings/regional", input)
  return data
}
