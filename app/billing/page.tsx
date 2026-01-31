"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Smartphone,
  Banknote,
  Receipt,
  Percent,
  User,
} from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  sku: string
}

const sampleProducts = [
  { id: "1", name: "iPhone 15 Pro Max 256GB", price: 1199.00, sku: "APL-IP15PM-256", category: "Electronics", stock: 45 },
  { id: "2", name: "Samsung Galaxy S24 Ultra", price: 1099.00, sku: "SAM-GS24U-256", category: "Electronics", stock: 32 },
  { id: "3", name: "MacBook Air M3", price: 1299.00, sku: "APL-MBA-M3", category: "Electronics", stock: 18 },
  { id: "4", name: "AirPods Pro 2nd Gen", price: 249.00, sku: "APL-APP2", category: "Accessories", stock: 89 },
  { id: "5", name: "Apple Watch Series 9", price: 399.00, sku: "APL-AWS9", category: "Wearables", stock: 24 },
  { id: "6", name: "iPad Pro 12.9 M2", price: 1199.00, sku: "APL-IPDP-129", category: "Electronics", stock: 15 },
  { id: "7", name: "Sony WH-1000XM5", price: 349.00, sku: "SNY-WH1000", category: "Audio", stock: 56 },
  { id: "8", name: "USB-C Fast Charger 65W", price: 29.99, sku: "ACC-USBC-65", category: "Accessories", stock: 120 },
]

export default function BillingPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [discount, setDiscount] = useState(0)
  const [customerName, setCustomerName] = useState("")

  const filteredProducts = sampleProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToCart = (product: typeof sampleProducts[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, sku: product.sku }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = subtotal * (discount / 100)
  const tax = (subtotal - discountAmount) * 0.18 // 18% GST
  const total = subtotal - discountAmount + tax

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Left Panel - Product Search */}
      <div className="flex w-96 flex-col gap-4">
        {/* Search Section */}
        <Card className="border border-border">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Barcode Input */}
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-emerald-500" />
                <Input
                  placeholder="Scan barcode or enter SKU..."
                  className="h-12 pl-11 rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 font-mono text-sm focus:border-emerald-500 focus:bg-emerald-500/10"
                />
              </div>
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-11 rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product List */}
        <Card className="flex-1 border border-border overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 overflow-y-auto h-[calc(100%-3rem)]">
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-md group"
                >
                  <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-xs font-mono text-muted-foreground">
                    {product.sku.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{product.sku}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {product.stock} in stock
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono">${product.price.toFixed(2)}</p>
                    <Plus className="size-4 text-muted-foreground group-hover:text-emerald-500 transition-colors ml-auto mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center - Cart */}
      <Card className="flex-1 border border-border overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Current Bill</CardTitle>
            <Badge variant="outline" className="font-mono">
              {cart.length} items
            </Badge>
          </div>
          {/* Customer Name */}
          <div className="relative mt-2">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-9 pl-9 rounded-lg text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[calc(100%-8rem)]">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Receipt className="size-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No items in cart</p>
                <p className="text-sm">Scan a barcode or search for products</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl bg-muted/50 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-lg bg-transparent"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-8 text-center font-mono font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-lg bg-transparent"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <div className="text-right w-20">
                      <p className="text-sm font-bold font-mono">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Summary */}
      <div className="w-80 flex flex-col gap-4">
        {/* Bill Summary */}
        <Card className="border border-border bg-slate-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Discount Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  type="number"
                  placeholder="Discount %"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="h-10 pl-9 rounded-lg bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Discount ({discount}%)</span>
                  <span className="font-mono text-emerald-400">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax (18% GST)</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/10">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="flex-1 border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-14 justify-start gap-4 rounded-xl border-2 hover:border-emerald-500/50 hover:bg-emerald-500/5 bg-transparent"
              disabled={cart.length === 0}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Banknote className="size-5 text-emerald-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Cash</p>
                <p className="text-xs text-muted-foreground">Pay with cash</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 justify-start gap-4 rounded-xl border-2 hover:border-cyan-500/50 hover:bg-cyan-500/5 bg-transparent"
              disabled={cart.length === 0}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
                <Smartphone className="size-5 text-cyan-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">UPI</p>
                <p className="text-xs text-muted-foreground">Google Pay, PhonePe</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 justify-start gap-4 rounded-xl border-2 hover:border-violet-500/50 hover:bg-violet-500/5 bg-transparent"
              disabled={cart.length === 0}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                <CreditCard className="size-5 text-violet-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">Card</p>
                <p className="text-xs text-muted-foreground">Credit / Debit card</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Generate Invoice Button */}
        <Button
          className="h-14 rounded-xl bg-emerald-500 text-white text-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          disabled={cart.length === 0}
        >
          <Receipt className="mr-2 size-5" />
          Generate Invoice
        </Button>
      </div>
    </div>
  )
}
