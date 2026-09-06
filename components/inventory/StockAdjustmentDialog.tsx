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
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdjustStock } from "@/hooks/queries/use-products"
import { useResetOnOpen } from "@/hooks/use-synced-state"
import type { Product } from "@/types/product"

interface Props {
  open: boolean
  onClose: () => void
  product: Product | null
}

export function StockAdjustmentDialog({ open, onClose, product }: Props) {
  const [direction, setDirection] = useState<"add" | "remove">("add")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const adjustStock = useAdjustStock()

  useResetOnOpen(open, () => {
    setDirection("add")
    setAmount("")
    setReason("")
  })

  const isValid = product && Number(amount) > 0 && reason.trim().length > 0

  const handleSubmit = () => {
    if (!product || !isValid) return
    const delta = direction === "add" ? Math.trunc(Number(amount)) : -Math.trunc(Number(amount))
    adjustStock.mutate({ id: product.id, input: { delta, reason: reason.trim() } }, { onSuccess: onClose })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            {product ? `${product.name} — currently ${product.stock} in stock` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "flex-1 gap-2",
                direction === "add" && "border-emerald-500 bg-emerald-500/5 text-emerald-600"
              )}
              onClick={() => setDirection("add")}
            >
              <Plus className="size-4" /> Add stock
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "flex-1 gap-2",
                direction === "remove" && "border-rose-500 bg-rose-500/5 text-rose-600"
              )}
              onClick={() => setDirection("remove")}
            >
              <Minus className="size-4" /> Remove stock
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Damaged in transit, new stock received"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || adjustStock.isPending}>
            {adjustStock.isPending ? "Saving..." : "Confirm Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
