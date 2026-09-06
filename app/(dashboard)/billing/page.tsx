"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatCurrency, toNumber } from "@/lib/format"
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
  CheckCircle2,
  Download,
  PackageSearch,
} from "lucide-react"
import { useProductLookup, useProducts } from "@/hooks/queries/use-products"
import { useCreateInvoice, useDownloadInvoicePdf } from "@/hooks/queries/use-invoices"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api/client"
import { toast } from "sonner"
import { CustomerPicker } from "@/components/billing/CustomerPicker"
import type { Product } from "@/types/product"
import type { Customer } from "@/types/customer"
import type { Invoice, PaymentMethod } from "@/types/invoice"

interface CartItem {
  productId: string
  name: string
  sku: string
  price: number
  gstRate: number
  stock: number
  quantity: number
}

const PAYMENT_OPTIONS: {
  value: PaymentMethod
  label: string
  hint: string
  icon: typeof Banknote
  selectedClass: string
  iconWrapClass: string
  iconClass: string
  checkClass: string
}[] = [
  {
    value: "CASH",
    label: "Cash",
    hint: "Pay with cash",
    icon: Banknote,
    selectedClass: "border-emerald-500 bg-emerald-500/5",
    iconWrapClass: "bg-emerald-500/10",
    iconClass: "text-emerald-500",
    checkClass: "text-emerald-500",
  },
  {
    value: "UPI",
    label: "UPI",
    hint: "Google Pay, PhonePe",
    icon: Smartphone,
    selectedClass: "border-cyan-500 bg-cyan-500/5",
    iconWrapClass: "bg-cyan-500/10",
    iconClass: "text-cyan-500",
    checkClass: "text-cyan-500",
  },
  {
    value: "CARD",
    label: "Card",
    hint: "Credit / Debit card",
    icon: CreditCard,
    selectedClass: "border-violet-500 bg-violet-500/5",
    iconWrapClass: "bg-violet-500/10",
    iconClass: "text-violet-500",
    checkClass: "text-violet-500",
  },
]

export default function BillingPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [barcode, setBarcode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null)

  const debouncedSearch = useDebouncedValue(searchQuery, 300)
  const { data: productPage, isLoading: productsLoading } = useProducts({
    search: debouncedSearch || undefined,
    pageSize: 20,
    sortBy: "name",
    sortDir: "asc",
  })
  const products = productPage?.data ?? []

  const lookup = useProductLookup()
  const createInvoice = useCreateInvoice()
  const downloadPdf = useDownloadInvoicePdf()

  const addToCart = (product: Product) => {
    const stock = toNumber(product.stock)
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        if (existing.quantity >= stock) {
          toast.warning(`Only ${stock} in stock for ${product.name}`)
          return prev
        }
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      if (stock <= 0) {
        toast.warning(`${product.name} is out of stock`)
        return prev
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: toNumber(product.price),
          gstRate: toNumber(product.gstRate),
          stock,
          quantity: 1,
        },
      ]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, Math.min(item.stock, item.quantity + delta)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleBarcodeSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !barcode.trim()) return
    try {
      const product = await lookup.mutateAsync(barcode.trim())
      addToCart(product)
      setBarcode("")
    } catch (error) {
      toast.error(getErrorMessage(error, "Product not found"))
    }
  }

  const totals = useMemo(() => {
    let subtotal = 0
    let discountAmount = 0
    let taxAmount = 0
    for (const item of cart) {
      const lineSubtotal = item.price * item.quantity
      const lineDiscount = lineSubtotal * (discount / 100)
      const taxable = lineSubtotal - lineDiscount
      const lineTax = taxable * (item.gstRate / 100)
      subtotal += lineSubtotal
      discountAmount += lineDiscount
      taxAmount += lineTax
    }
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total: subtotal - discountAmount + taxAmount,
    }
  }, [cart, discount])

  const resetSale = () => {
    setCart([])
    setDiscount(0)
    setCustomer(null)
    setPaymentMethod(null)
  }

  const handleGenerateInvoice = () => {
    if (cart.length === 0 || !paymentMethod) return
    createInvoice.mutate(
      {
        customerId: customer?.id,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        discountPercent: discount || undefined,
        paymentMethod,
      },
      {
        onSuccess: (invoice) => {
          setCompletedInvoice(invoice)
          resetSale()
        },
      }
    )
  }

  const filteredCount = products.length

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Left Panel - Product Search */}
      <div className="flex w-96 flex-col gap-4">
        <Card className="border border-border">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-emerald-500" />
                <Input
                  placeholder="Scan barcode or enter SKU, then press Enter..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleBarcodeSubmit}
                  className="h-12 pl-11 rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 font-mono text-sm focus-visible:border-emerald-500 focus-visible:bg-emerald-500/10"
                />
              </div>
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

        <Card className="flex-1 border border-border overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products ({filteredCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 overflow-y-auto h-[calc(100%-3rem)]">
            {productsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <PackageSearch className="size-10 opacity-50" />
                <p className="text-sm font-medium">No products found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => {
                  const stock = toNumber(product.stock)
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={stock <= 0}
                      className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-md group disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-xs font-mono text-muted-foreground">
                        {product.sku.slice(0, 3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{product.sku}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5">
                            {stock > 0 ? `${stock} in stock` : "Out of stock"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono">{formatCurrency(product.price)}</p>
                        <Plus className="size-4 text-muted-foreground group-hover:text-emerald-500 transition-colors ml-auto mt-1" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
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
          <CustomerPicker value={customer} onChange={setCustomer} />
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[calc(100%-8rem)]">
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
                  <div key={item.productId} className="flex items-center gap-4 rounded-xl bg-muted/50 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-lg bg-transparent"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-8 text-center font-mono font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-lg bg-transparent"
                        disabled={item.quantity >= item.stock}
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <div className="text-right w-20">
                      <p className="text-sm font-bold font-mono">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.productId)}
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
        <Card className="border border-border bg-slate-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Discount ({discount}%)</span>
                  <span className="font-mono text-emerald-400">
                    -{formatCurrency(totals.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax (GST)</span>
                <span className="font-mono">{formatCurrency(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/10">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PAYMENT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                className={cn(
                  "w-full h-14 justify-start gap-4 rounded-xl border-2 bg-transparent",
                  paymentMethod === option.value
                    ? option.selectedClass
                    : "hover:border-muted-foreground/30"
                )}
                disabled={cart.length === 0}
                onClick={() => setPaymentMethod(option.value)}
              >
                <div className={cn("flex size-10 items-center justify-center rounded-lg", option.iconWrapClass)}>
                  <option.icon className={cn("size-5", option.iconClass)} />
                </div>
                <div className="text-left">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.hint}</p>
                </div>
                {paymentMethod === option.value && (
                  <CheckCircle2 className={cn("size-5 ml-auto", option.checkClass)} />
                )}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Button
          className="h-14 rounded-xl bg-emerald-500 text-white text-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          disabled={cart.length === 0 || !paymentMethod || createInvoice.isPending}
          onClick={handleGenerateInvoice}
        >
          <Receipt className="mr-2 size-5" />
          {createInvoice.isPending ? "Processing..." : "Generate Invoice"}
        </Button>
      </div>

      <Dialog open={!!completedInvoice} onOpenChange={(open) => !open && setCompletedInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="size-8 text-emerald-500" />
            </div>
            <DialogTitle className="text-center text-xl">Sale Complete</DialogTitle>
            <DialogDescription className="text-center">
              Invoice {completedInvoice?.invoiceNumber} for{" "}
              {formatCurrency(completedInvoice?.total ?? 0)} was created successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setCompletedInvoice(null)}>
              New Sale
            </Button>
            <Button
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
              disabled={downloadPdf.isPending}
              onClick={() =>
                completedInvoice &&
                downloadPdf.mutate({
                  id: completedInvoice.id,
                  invoiceNumber: completedInvoice.invoiceNumber,
                })
              }
            >
              <Download className="size-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
