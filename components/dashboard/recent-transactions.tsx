"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CreditCard, Smartphone, Banknote, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const transactions = [
  {
    id: "INV-001",
    customer: "John Smith",
    amount: 245.50,
    method: "card" as const,
    status: "completed" as const,
    time: "2 min ago",
  },
  {
    id: "INV-002",
    customer: "Sarah Johnson",
    amount: 89.99,
    method: "upi" as const,
    status: "completed" as const,
    time: "15 min ago",
  },
  {
    id: "INV-003",
    customer: "Mike Brown",
    amount: 567.00,
    method: "cash" as const,
    status: "pending" as const,
    time: "32 min ago",
  },
  {
    id: "INV-004",
    customer: "Emily Davis",
    amount: 123.75,
    method: "card" as const,
    status: "completed" as const,
    time: "1 hr ago",
  },
  {
    id: "INV-005",
    customer: "Robert Wilson",
    amount: 890.00,
    method: "upi" as const,
    status: "completed" as const,
    time: "2 hr ago",
  },
]

const methodIcons = {
  card: CreditCard,
  upi: Smartphone,
  cash: Banknote,
}

const statusColors = {
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  failed: "bg-rose-500/10 text-rose-500 border-rose-500/20",
}

export function RecentTransactions() {
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
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const MethodIcon = methodIcons[transaction.method]
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
                    <p className="text-sm font-medium">{transaction.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.id} • {transaction.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize", statusColors[transaction.status])}
                  >
                    {transaction.status}
                  </Badge>
                  <span className="text-sm font-semibold font-mono">
                    ${transaction.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
