"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { CreditCard, Smartphone, Banknote, ArrowRight, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRecentTransactions } from "@/hooks/queries/use-dashboard"
import { formatCurrency, formatDateTime } from "@/lib/format"
import type { PaymentMethod } from "@/types/invoice"

const methodIcons: Record<PaymentMethod, typeof CreditCard> = {
  CARD: CreditCard,
  UPI: Smartphone,
  CASH: Banknote,
}

export function RecentTransactions() {
  const { data: transactions, isLoading } = useRecentTransactions(5)

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <Link href="/reports">
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
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <Receipt className="size-10 opacity-50" />
            <p className="text-sm font-medium">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const MethodIcon = methodIcons[transaction.paymentMethod] ?? Banknote
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-background shadow-sm">
                      <MethodIcon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transaction.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.invoiceNumber} • {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn("text-xs capitalize", "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}
                    >
                      {transaction.status.toLowerCase()}
                    </Badge>
                    <span className="text-sm font-semibold font-mono">
                      {formatCurrency(transaction.amount)}
                    </span>
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
