import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api/client"
import {
  getBusinessProfile,
  getInvoicePreview,
  updateBusinessProfile,
  uploadBusinessLogo,
} from "@/lib/api/business"
import type { UpdateBusinessProfileInput } from "@/types/business"

export const businessKeys = {
  profile: ["business", "profile"] as const,
  invoicePreview: ["business", "invoice-preview"] as const,
}

export function useBusinessProfile() {
  return useQuery({ queryKey: businessKeys.profile, queryFn: getBusinessProfile })
}

export function useInvoicePreview(enabled = true) {
  return useQuery({
    queryKey: businessKeys.invoicePreview,
    queryFn: getInvoicePreview,
    enabled,
  })
}

export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateBusinessProfileInput) => updateBusinessProfile(input),
    onSuccess: () => {
      toast.success("Business profile updated")
      queryClient.invalidateQueries({ queryKey: businessKeys.profile })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update profile")),
  })
}

export function useUploadBusinessLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadBusinessLogo(file),
    onSuccess: () => {
      toast.success("Logo uploaded")
      queryClient.invalidateQueries({ queryKey: businessKeys.profile })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to upload logo")),
  })
}
