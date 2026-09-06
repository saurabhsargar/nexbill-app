export interface BusinessProfile {
  id: string
  name: string
  gstin?: string | null
  pan?: string | null
  state?: string | null
  stateCode?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  logoUrl?: string | null
  updatedAt: string
  organizationId: string
}

export interface UpdateBusinessProfileInput {
  name?: string
  gstin?: string
  pan?: string
  state?: string
  stateCode?: string
  address?: string
  phone?: string
  email?: string
}

export interface InvoicePreview {
  sampleUnitPrice: number
  sampleQuantity: number
  taxableValue: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  totalTax: number
  total: number
}
