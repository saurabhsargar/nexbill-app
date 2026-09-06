"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTopProducts } from "@/hooks/queries/use-dashboard"
import { formatCurrency, toNumber } from "@/lib/format"

const COLORS = ["bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-violet-500", "bg-amber-500"]

export function TopProducts() {
  const [range] = useState<"daily" | "weekly" | "monthly">("weekly")
  const { data: products, isLoading } = useTopProducts(range, 5)

  const maxRevenue = Math.max(1, ...(products ?? []).map((p) => toNumber(p.revenue)))

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Top Selling Products</CardTitle>
        <Link href="/inventory">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            View all
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <Package className="size-10 opacity-50" />
            <p className="text-sm font-medium">No sales in this period yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => {
              const revenue = toNumber(product.revenue)
              const progress = Math.round((revenue / maxRevenue) * 100)
              return (
                <div key={product.productId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.unitsSold} units sold</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold font-mono">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${COLORS[index % COLORS.length]}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
