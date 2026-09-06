import { apiClient } from "./client"
import { downloadBlob, filenameFromContentDisposition } from "@/lib/format"
import type { PaginatedResult } from "@/types/api"
import type {
  CreateProductInput,
  Product,
  ProductCategory,
  ProductQueryParams,
  StockAdjustmentInput,
  UpdateProductInput,
} from "@/types/product"

export async function listProducts(
  params: ProductQueryParams
): Promise<PaginatedResult<Product>> {
  const { data } = await apiClient.get<PaginatedResult<Product>>("/products", { params })
  return data
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  const { data } = await apiClient.get<ProductCategory[]>("/products/categories")
  return data
}

export async function lookupProductByBarcode(barcode: string): Promise<Product> {
  const { data } = await apiClient.get<Product>("/products/lookup", { params: { barcode } })
  return data
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`)
  return data
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data } = await apiClient.post<Product>("/products", input)
  return data
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, input)
  return data
}

export async function deleteProduct(id: string): Promise<Product> {
  const { data } = await apiClient.delete<Product>(`/products/${id}`)
  return data
}

export async function adjustStock(id: string, input: StockAdjustmentInput): Promise<Product> {
  const { data } = await apiClient.post<Product>(`/products/${id}/stock-adjustment`, input)
  return data
}

export async function exportProductsCsv(): Promise<void> {
  const res = await apiClient.get("/products/export", { responseType: "blob" })
  downloadBlob(
    res.data,
    filenameFromContentDisposition(res.headers["content-disposition"], "products.csv")
  )
}
