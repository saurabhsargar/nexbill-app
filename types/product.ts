export type ProductStatus = "in-stock" | "low-stock" | "out-of-stock"

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number | string
  cost?: number | string
  stock: number
  minStock: number
  gstRate: number | string
  isActive: boolean
  createdAt: string
  updatedAt: string
  status: ProductStatus
}

export interface ProductCategory {
  name: string
  count: number
}

export interface ProductQueryParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  status?: ProductStatus
  sortBy?: "name" | "price" | "stock" | "category" | "createdAt"
  sortDir?: "asc" | "desc"
}

export interface CreateProductInput {
  name: string
  sku: string
  category: string
  price: number
  cost: number
  stock: number
  minStock: number
  gstRate?: number
}

export type UpdateProductInput = Partial<CreateProductInput>

export interface StockAdjustmentInput {
  delta: number
  reason: string
}
