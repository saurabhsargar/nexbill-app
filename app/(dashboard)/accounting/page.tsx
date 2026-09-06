"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"
import { Calculator, Receipt, Info, Percent } from "lucide-react"
import { useTaxConfig, useUpdateTaxConfig } from "@/hooks/queries/use-settings"
import { useInvoicePreview } from "@/hooks/queries/use-business"
import { useSyncedState } from "@/hooks/use-synced-state"
import type { TaxConfig } from "@/types/settings"

const emptyTaxForm = {
  gstEnabled: true,
  cgstEnabled: false,
  sgstEnabled: false,
  igstEnabled: false,
  defaultGstRate: "18",
}

export default function AccountingPage() {
  const { data: taxConfig, isLoading: taxLoading } = useTaxConfig()
  const updateTaxConfig = useUpdateTaxConfig()
  const { data: preview, isLoading: previewLoading } = useInvoicePreview()

  const [form, setForm] = useSyncedState<TaxConfig, typeof emptyTaxForm>(
    taxConfig,
    (c) => ({
      gstEnabled: c.gstEnabled,
      cgstEnabled: c.cgstEnabled,
      sgstEnabled: c.sgstEnabled,
      igstEnabled: c.igstEnabled,
      defaultGstRate: String(c.defaultGstRate),
    }),
    emptyTaxForm
  )
  const { gstEnabled, cgstEnabled, sgstEnabled, igstEnabled, defaultGstRate } = form
  const setDefaultGstRate = (value: string) => setForm((prev) => ({ ...prev, defaultGstRate: value }))

  const save = (overrides: Partial<Record<"gstEnabled" | "cgstEnabled" | "sgstEnabled" | "igstEnabled", boolean>>) => {
    const next = { ...form, ...overrides }
    setForm(next)
    updateTaxConfig.mutate({
      gstEnabled: next.gstEnabled,
      cgstEnabled: next.cgstEnabled,
      sgstEnabled: next.sgstEnabled,
      igstEnabled: next.igstEnabled,
      defaultGstRate: Number(next.defaultGstRate),
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tax & Compliance</h1>
        <p className="text-sm text-muted-foreground">
          Configure GST behavior and preview how it applies to invoices.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tax Configuration */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="size-5 text-emerald-500" />
              Tax Configuration
            </CardTitle>
            <CardDescription>Configure applicable taxes for your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {taxLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                {[
                  { id: "gst", name: "GST", enabled: gstEnabled, description: "Master switch for GST on this org" },
                  { id: "cgst", name: "CGST", enabled: cgstEnabled, description: "Central GST component" },
                  { id: "sgst", name: "SGST", enabled: sgstEnabled, description: "State GST component" },
                  { id: "igst", name: "IGST", enabled: igstEnabled, description: "Integrated GST component" },
                ].map((tax) => (
                  <div
                    key={tax.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      tax.enabled ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex size-10 items-center justify-center rounded-lg ${tax.enabled ? "bg-emerald-500/10" : "bg-muted"}`}>
                        <Percent className={`size-5 ${tax.enabled ? "text-emerald-500" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-semibold">{tax.name}</p>
                        <p className="text-sm text-muted-foreground">{tax.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={tax.enabled}
                      onCheckedChange={(checked) =>
                        save({ [`${tax.id}Enabled`]: checked } as Record<string, boolean>)
                      }
                    />
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Default GST Rate (%)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={defaultGstRate}
                      onChange={(e) => setDefaultGstRate(e.target.value)}
                      className="max-w-28"
                    />
                    <Button variant="outline" disabled={updateTaxConfig.isPending} onClick={() => save({})}>
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Used as the default rate for new products that don&apos;t specify their own GST rate.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Invoice Tax Preview */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-5 text-cyan-500" />
              Invoice Tax Preview
            </CardTitle>
            <CardDescription>How a sample line item is taxed with your current settings</CardDescription>
          </CardHeader>
          <CardContent>
            {previewLoading || !preview ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sample Unit Price</span>
                  <span className="font-mono">{formatCurrency(preview.sampleUnitPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-mono">{preview.sampleQuantity}</span>
                </div>
                <div className="flex justify-between text-sm pb-3 border-b">
                  <span className="text-muted-foreground">Taxable Value</span>
                  <span className="font-mono">{formatCurrency(preview.taxableValue)}</span>
                </div>

                {cgstEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CGST</span>
                    <span className="font-mono text-emerald-600">{formatCurrency(preview.cgstAmount)}</span>
                  </div>
                )}
                {sgstEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SGST</span>
                    <span className="font-mono text-emerald-600">{formatCurrency(preview.sgstAmount)}</span>
                  </div>
                )}
                {igstEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IGST</span>
                    <span className="font-mono text-emerald-600">{formatCurrency(preview.igstAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm pt-1">
                  <span className="font-medium">Total Tax</span>
                  <span className="font-mono font-semibold text-emerald-600">
                    {formatCurrency(preview.totalTax)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t font-semibold">
                  <span>Total</span>
                  <span className="font-mono text-lg">{formatCurrency(preview.total)}</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2 rounded-lg bg-blue-500/5 border border-blue-500/20 p-3 text-xs text-muted-foreground">
              <Info className="size-4 shrink-0 text-blue-500" />
              <p>
                This preview reflects the same tax engine used for real invoices, but real invoices
                currently compute a single blended tax amount per line item (from the product&apos;s
                GST rate) rather than a separate CGST/SGST/IGST split.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
