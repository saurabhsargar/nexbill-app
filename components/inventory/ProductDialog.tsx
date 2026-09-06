"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateProduct, useUpdateProduct } from "@/hooks/queries/use-products"
import { useResetOnOpen } from "@/hooks/use-synced-state"
import type { Product } from "@/types/product"

interface Props {
  open: boolean
  onClose: () => void
  product?: Product | null
}

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  price: "",
  cost: "",
  stock: "",
  minStock: "",
  gstRate: "",
}

export function ProductDialog({ open, onClose, product }: Props) {
  const [form, setForm] = useState(emptyForm)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const isEditing = !!product
  const isPending = createProduct.isPending || updateProduct.isPending

  useResetOnOpen(open, () => {
    setForm(
      product
        ? {
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: String(product.price),
            cost: String(product.cost ?? ""),
            stock: String(product.stock),
            minStock: String(product.minStock),
            gstRate: String(product.gstRate ?? ""),
          }
        : emptyForm
    )
  })

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const isValid =
    form.name.trim() &&
    form.sku.trim() &&
    form.category.trim() &&
    form.price !== "" &&
    form.cost !== "" &&
    form.stock !== "" &&
    form.minStock !== ""

  const handleSubmit = () => {
    const input = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      cost: Number(form.cost),
      stock: Math.trunc(Number(form.stock)),
      minStock: Math.trunc(Number(form.minStock)),
      gstRate: form.gstRate === "" ? undefined : Number(form.gstRate),
    }

    if (isEditing && product) {
      updateProduct.mutate({ id: product.id, input }, { onSuccess: onClose })
    } else {
      createProduct.mutate(input, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the catalog details for this product."
              : "Add a new product to your inventory catalog."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={set("name")} placeholder="Widget A" />
          </div>
          <div className="space-y-1.5">
            <Label>SKU</Label>
            <Input value={form.sku} onChange={set("sku")} placeholder="WID-001" className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input value={form.category} onChange={set("category")} placeholder="Hardware" />
          </div>
          <div className="space-y-1.5">
            <Label>Price</Label>
            <Input type="number" min={0} step="0.01" value={form.price} onChange={set("price")} />
          </div>
          <div className="space-y-1.5">
            <Label>Cost</Label>
            <Input type="number" min={0} step="0.01" value={form.cost} onChange={set("cost")} />
          </div>
          <div className="space-y-1.5">
            <Label>Stock</Label>
            <Input type="number" min={0} step="1" value={form.stock} onChange={set("stock")} />
          </div>
          <div className="space-y-1.5">
            <Label>Min Stock</Label>
            <Input type="number" min={0} step="1" value={form.minStock} onChange={set("minStock")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>GST Rate (%)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.gstRate}
              onChange={set("gstRate")}
              placeholder={isEditing ? undefined : "Defaults to org tax rate if left blank"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
