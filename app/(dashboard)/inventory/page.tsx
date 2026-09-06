"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Edit2,
  Trash2,
  Download,
  PackagePlus,
  PackageSearch,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PaginationBar } from "@/components/common/PaginationBar"
import { ProductDialog } from "@/components/inventory/ProductDialog"
import { StockAdjustmentDialog } from "@/components/inventory/StockAdjustmentDialog"
import { useAuth } from "@/context/AuthContext"
import {
  useDeleteProduct,
  useExportProducts,
  useProductCategories,
  useProducts,
} from "@/hooks/queries/use-products"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type { Product, ProductStatus } from "@/types/product"

const PAGE_SIZE = 10

export default function InventoryPage() {
  const { user } = useAuth()
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [productDialog, setProductDialog] = useState<{ open: boolean; product?: Product | null }>({
    open: false,
  })
  const [stockDialogProduct, setStockDialogProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  const { data: categories = [] } = useProductCategories()
  const totalProducts = categories.reduce((sum, c) => sum + c.count, 0)

  const { data: productPage, isLoading } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    category: selectedCategory === "All" ? undefined : selectedCategory,
    status: statusFilter === "all" ? undefined : statusFilter,
    sortBy: "createdAt",
    sortDir: "desc",
  })

  const { data: lowStockPage } = useProducts({ page: 1, pageSize: 1, status: "low-stock" })
  const { data: outOfStockPage } = useProducts({ page: 1, pageSize: 1, status: "out-of-stock" })

  const deleteProduct = useDeleteProduct()
  const exportProducts = useExportProducts()

  const products = productPage?.data ?? []
  const total = productPage?.total ?? 0

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package, color: "text-emerald-500" },
    { label: "Low Stock Items", value: lowStockPage?.total ?? 0, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Out of Stock", value: outOfStockPage?.total ?? 0, icon: AlertTriangle, color: "text-rose-500" },
  ]

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">In Stock</Badge>
      case "low-stock":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Low Stock</Badge>
      case "out-of-stock":
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Out of Stock</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-sm text-muted-foreground">Manage your product inventory and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            disabled={exportProducts.isPending}
            onClick={() => exportProducts.mutate()}
          >
            <Download className="size-4" />
            Export
          </Button>
          {canManage && (
            <Button
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
              onClick={() => setProductDialog({ open: true, product: null })}
            >
              <Plus className="size-4" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={cn("flex size-12 items-center justify-center rounded-xl bg-muted", stat.color)}>
                <stat.icon className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setSelectedCategory("All")
            setPage(1)
          }}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
            selectedCategory === "All"
              ? "bg-foreground text-background shadow-lg"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
          <span className="text-xs opacity-70">({totalProducts})</span>
        </button>
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => {
              setSelectedCategory(category.name)
              setPage(1)
            }}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
              selectedCategory === category.name
                ? "bg-foreground text-background shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {category.name}
            <span className="text-xs opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="h-11 pl-11 rounded-xl"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as ProductStatus | "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-48 h-11 rounded-xl">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-16 text-muted-foreground">
            <PackageSearch className="size-10 opacity-50" />
            <p className="font-medium">No products found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">SKU</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  {canManage && <TableHead className="font-semibold text-right">Cost</TableHead>}
                  <TableHead className="font-semibold text-right">Price</TableHead>
                  <TableHead className="font-semibold text-center">Stock</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  {canManage && <TableHead className="font-semibold text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className={cn(
                      "transition-colors",
                      product.status === "low-stock" && "bg-amber-500/5",
                      product.status === "out-of-stock" && "bg-rose-500/5"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-xs font-mono">
                          {product.sku.slice(0, 3)}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {product.category}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right font-mono">
                        {product.cost !== undefined ? formatCurrency(product.cost) : "—"}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "font-mono font-semibold",
                          product.status === "low-stock" && "text-amber-500",
                          product.status === "out-of-stock" && "text-rose-500"
                        )}
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="size-8 p-0">
                              <Edit2 className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setProductDialog({ open: true, product })}
                            >
                              <Edit2 className="mr-2 size-4" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStockDialogProduct(product)}>
                              <PackagePlus className="mr-2 size-4" />
                              Adjust Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTarget(product)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <ProductDialog
        open={productDialog.open}
        product={productDialog.product}
        onClose={() => setProductDialog({ open: false })}
      />

      <StockAdjustmentDialog
        open={!!stockDialogProduct}
        product={stockDialogProduct}
        onClose={() => setStockDialogProduct(null)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This deactivates the product — it disappears from listings and POS search, but its
              invoice and stock-adjustment history is preserved. This cannot be undone from the UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteProduct.mutate(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
