"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Search,
  Plus,
  Filter,
  Package,
  AlertTriangle,
  Edit2,
  Trash2,
  ArrowUpDown,
  Download,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const categories = [
  { name: "All", count: 156, color: "bg-slate-500" },
  { name: "Electronics", count: 45, color: "bg-emerald-500" },
  { name: "Accessories", count: 38, color: "bg-cyan-500" },
  { name: "Audio", count: 24, color: "bg-violet-500" },
  { name: "Wearables", count: 18, color: "bg-amber-500" },
  { name: "Home", count: 31, color: "bg-rose-500" },
]

const products = [
  { id: "1", name: "iPhone 15 Pro Max 256GB", sku: "APL-IP15PM-256", category: "Electronics", price: 1199.00, cost: 950.00, stock: 45, minStock: 10, status: "in-stock" },
  { id: "2", name: "Samsung Galaxy S24 Ultra", sku: "SAM-GS24U-256", category: "Electronics", price: 1099.00, cost: 850.00, stock: 32, minStock: 10, status: "in-stock" },
  { id: "3", name: "MacBook Air M3", sku: "APL-MBA-M3", category: "Electronics", price: 1299.00, cost: 1050.00, stock: 18, minStock: 15, status: "in-stock" },
  { id: "4", name: "AirPods Pro 2nd Gen", sku: "APL-APP2", category: "Accessories", price: 249.00, cost: 180.00, stock: 89, minStock: 20, status: "in-stock" },
  { id: "5", name: "Apple Watch Series 9", sku: "APL-AWS9", category: "Wearables", price: 399.00, cost: 320.00, stock: 8, minStock: 10, status: "low-stock" },
  { id: "6", name: "iPad Pro 12.9 M2", sku: "APL-IPDP-129", category: "Electronics", price: 1199.00, cost: 950.00, stock: 5, minStock: 10, status: "low-stock" },
  { id: "7", name: "Sony WH-1000XM5", sku: "SNY-WH1000", category: "Audio", price: 349.00, cost: 250.00, stock: 56, minStock: 15, status: "in-stock" },
  { id: "8", name: "USB-C Fast Charger 65W", sku: "ACC-USBC-65", category: "Accessories", price: 29.99, cost: 12.00, stock: 120, minStock: 30, status: "in-stock" },
  { id: "9", name: "Bose QuietComfort Ultra", sku: "BOS-QCU", category: "Audio", price: 429.00, cost: 310.00, stock: 3, minStock: 10, status: "low-stock" },
  { id: "10", name: "Samsung T7 SSD 1TB", sku: "SAM-T7-1TB", category: "Accessories", price: 109.99, cost: 70.00, stock: 0, minStock: 15, status: "out-of-stock" },
]

const stats = [
  { label: "Total Products", value: "156", icon: Package, color: "text-emerald-500" },
  { label: "Low Stock Items", value: "8", icon: AlertTriangle, color: "text-amber-500" },
  { label: "Out of Stock", value: "3", icon: AlertTriangle, color: "text-rose-500" },
]

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">In Stock</Badge>
      case "low-stock":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Low Stock</Badge>
      case "out-of-stock":
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Out of Stock</Badge>
      default:
        return null
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
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="size-4" />
            Export
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25">
            <Plus className="size-4" />
            Add Product
          </Button>
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
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
              selectedCategory === category.name
                ? "bg-foreground text-background shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span className={cn("size-2 rounded-full", category.color)} />
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-11 rounded-xl"
          />
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="size-4" />
          Filters
        </Button>
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">
                <div className="flex items-center gap-1">
                  Product
                  <ArrowUpDown className="size-3" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">SKU</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold text-right">Cost</TableHead>
              <TableHead className="font-semibold text-right">Price</TableHead>
              <TableHead className="font-semibold text-center">Stock</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
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
                <TableCell className="text-right font-mono">${product.cost.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono font-semibold">${product.price.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "font-mono font-semibold",
                    product.stock <= product.minStock && product.stock > 0 && "text-amber-500",
                    product.stock === 0 && "text-rose-500"
                  )}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="size-8 p-0">
                        <Edit2 className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit2 className="mr-2 size-4" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Package className="mr-2 size-4" />
                        Adjust Stock
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
