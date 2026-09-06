import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api/client"
import {
  adjustStock,
  createProduct,
  deleteProduct,
  exportProductsCsv,
  getProductCategories,
  listProducts,
  lookupProductByBarcode,
  updateProduct,
} from "@/lib/api/products"
import type {
  CreateProductInput,
  ProductQueryParams,
  StockAdjustmentInput,
  UpdateProductInput,
} from "@/types/product"

export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductQueryParams) => [...productKeys.all, "list", params] as const,
  categories: () => [...productKeys.all, "categories"] as const,
}

export function useProducts(params: ProductQueryParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts(params),
    placeholderData: (prev) => prev,
  })
}

export function useProductCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: getProductCategories,
  })
}

export function useProductLookup() {
  return useMutation({
    mutationFn: (barcode: string) => lookupProductByBarcode(barcode),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      toast.success("Product created")
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create product")),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      updateProduct(id, input),
    onSuccess: () => {
      toast.success("Product updated")
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update product")),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product removed")
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to remove product")),
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StockAdjustmentInput }) =>
      adjustStock(id, input),
    onSuccess: () => {
      toast.success("Stock adjusted")
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to adjust stock")),
  })
}

export function useExportProducts() {
  return useMutation({
    mutationFn: exportProductsCsv,
    onError: (error) => toast.error(getErrorMessage(error, "Export failed")),
  })
}
