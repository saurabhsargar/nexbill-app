"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const products = [
  {
    name: "iPhone 15 Pro Max",
    sales: 156,
    revenue: 187200,
    progress: 100,
    color: "bg-emerald-500",
  },
  {
    name: "Samsung Galaxy S24",
    sales: 134,
    revenue: 134000,
    progress: 86,
    color: "bg-teal-500",
  },
  {
    name: "MacBook Air M3",
    sales: 89,
    revenue: 115700,
    progress: 72,
    color: "bg-cyan-500",
  },
  {
    name: "AirPods Pro 2",
    sales: 245,
    revenue: 61250,
    progress: 58,
    color: "bg-violet-500",
  },
  {
    name: "iPad Pro 12.9",
    sales: 67,
    revenue: 80400,
    progress: 45,
    color: "bg-amber-500",
  },
]

export function TopProducts() {
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
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.sales} units sold
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold font-mono">
                  ${(product.revenue / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${product.color}`}
                  style={{ width: `${product.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
