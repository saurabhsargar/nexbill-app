import { apiClient } from "./client"
import type { BusinessProfile, InvoicePreview, UpdateBusinessProfileInput } from "@/types/business"

export async function getBusinessProfile(): Promise<BusinessProfile> {
  const { data } = await apiClient.get<BusinessProfile>("/business/profile")
  return data
}

export async function updateBusinessProfile(
  input: UpdateBusinessProfileInput
): Promise<BusinessProfile> {
  const { data } = await apiClient.put<BusinessProfile>("/business/profile", input)
  return data
}

export async function uploadBusinessLogo(file: File): Promise<{ logoUrl: string }> {
  const formData = new FormData()
  formData.append("file", file)
  const { data } = await apiClient.post<{ logoUrl: string }>("/business/logo", formData)
  return data
}

export async function getInvoicePreview(): Promise<InvoicePreview> {
  const { data } = await apiClient.get<InvoicePreview>("/business/invoice-preview")
  return data
}
