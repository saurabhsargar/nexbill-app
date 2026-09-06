"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Receipt } from "lucide-react"
import { useInvoiceConfig, useUpdateInvoiceConfig } from "@/hooks/queries/use-settings"
import { useSyncedState } from "@/hooks/use-synced-state"
import type { InvoiceConfig } from "@/types/settings"

const emptyForm = { prefix: "", footerNote: "", startingNumber: "" }

export function InvoiceSettingsCard() {
  const { data: config, isLoading } = useInvoiceConfig()
  const updateConfig = useUpdateInvoiceConfig()

  const [{ prefix, footerNote, startingNumber }, setForm] = useSyncedState<InvoiceConfig, typeof emptyForm>(
    config,
    (c) => ({ prefix: c.prefix, footerNote: c.footerNote ?? "", startingNumber: String(c.nextNumber) }),
    emptyForm
  )
  const setPrefix = (value: string) => setForm((prev) => ({ ...prev, prefix: value }))
  const setFooterNote = (value: string) => setForm((prev) => ({ ...prev, footerNote: value }))
  const setStartingNumber = (value: string) => setForm((prev) => ({ ...prev, startingNumber: value }))

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="size-5 text-teal-500" />
          Invoice Settings
        </CardTitle>
        <CardDescription>Numbering and footer note printed on every invoice</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Invoice Prefix</Label>
            <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Next Invoice Number</Label>
            <Input
              type="number"
              value={startingNumber}
              onChange={(e) => setStartingNumber(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Can only be changed before your organization&apos;s first invoice is created.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Footer Note</Label>
          <Input
            value={footerNote}
            onChange={(e) => setFooterNote(e.target.value)}
            placeholder="Thank you for your business!"
          />
        </div>

        <Button
          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          disabled={updateConfig.isPending}
          onClick={() =>
            updateConfig.mutate({
              prefix,
              footerNote,
              startingNumber: startingNumber ? Number(startingNumber) : undefined,
            })
          }
        >
          {updateConfig.isPending ? "Saving..." : "Save Invoice Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
