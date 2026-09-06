export interface Customer {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  createdAt: string
  organizationId: string
}

export interface CreateCustomerInput {
  name: string
  phone?: string
  email?: string
  address?: string
}
