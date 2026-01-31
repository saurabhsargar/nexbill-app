"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Calculator,
  Receipt,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  IndianRupee,
  Percent,
  Building2,
} from "lucide-react"

const taxTypes = [
  { id: "gst", name: "GST", rate: "18%", enabled: true, description: "Goods and Services Tax" },
  { id: "cgst", name: "CGST", rate: "9%", enabled: true, description: "Central GST" },
  { id: "sgst", name: "SGST", rate: "9%", enabled: true, description: "State GST" },
  { id: "igst", name: "IGST", rate: "18%", enabled: false, description: "Integrated GST" },
]

const invoicePreview = {
  invoiceNo: "INV-2024-001",
  date: "Jan 27, 2024",
  items: [
    { name: "iPhone 15 Pro Max", qty: 1, price: 1199.00, gst: 215.82 },
    { name: "AirPods Pro 2", qty: 2, price: 498.00, gst: 89.64 },
  ],
  subtotal: 1697.00,
  totalGst: 305.46,
  total: 2002.46,
}

const steps = [
  { id: 1, title: "Business Details", description: "Company information", completed: true },
  { id: 2, title: "Tax Configuration", description: "GST settings", completed: true },
  { id: 3, title: "Invoice Settings", description: "Invoice format", completed: false },
  { id: 4, title: "Review", description: "Final review", completed: false },
]

export default function AccountingPage() {
  const [currentStep, setCurrentStep] = useState(2)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounting & Tax</h1>
          <p className="text-sm text-muted-foreground">Configure tax settings and manage compliance.</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex size-10 items-center justify-center rounded-full font-semibold text-sm transition-all",
                    step.completed
                      ? "bg-emerald-500 text-white"
                      : currentStep === step.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step.completed ? <CheckCircle2 className="size-5" /> : step.id}
                  </div>
                  <div className="hidden md:block">
                    <p className={cn(
                      "font-medium text-sm",
                      currentStep === step.id && "text-emerald-600"
                    )}>{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="mx-4 size-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            {taxTypes.map((tax) => (
              <div
                key={tax.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  tax.enabled ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    tax.enabled ? "bg-emerald-500/10" : "bg-muted"
                  )}>
                    <Percent className={cn("size-5", tax.enabled ? "text-emerald-500" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{tax.name}</p>
                      <Badge variant="secondary" className="text-xs">{tax.rate}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tax.description}</p>
                  </div>
                </div>
                <Switch checked={tax.enabled} />
              </div>
            ))}

            {/* Custom Tax Rate */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium">Custom GST Rate (%)</Label>
              <div className="flex gap-2 mt-2">
                <Input type="number" placeholder="18" defaultValue="18" className="max-w-24" />
                <Button variant="outline">Apply</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-teal-500" />
              Business Details
            </CardTitle>
            <CardDescription>Your business information for invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input defaultValue="NexBill Electronics Pvt. Ltd." />
            </div>
            <div className="space-y-2">
              <Label>GSTIN</Label>
              <Input defaultValue="29ABCDE1234F1ZH" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <Input defaultValue="Karnataka" />
              </div>
              <div className="space-y-2">
                <Label>State Code</Label>
                <Input defaultValue="29" className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input defaultValue="123 Tech Park, Bengaluru 560001" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Preview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5 text-cyan-500" />
            Invoice Tax Preview
          </CardTitle>
          <CardDescription>Preview how taxes appear on invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-muted/30 p-6">
            <div className="flex justify-between mb-6">
              <div>
                <p className="font-bold text-lg">NexBill Electronics Pvt. Ltd.</p>
                <p className="text-sm text-muted-foreground">GSTIN: 29ABCDE1234F1ZH</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold">{invoicePreview.invoiceNo}</p>
                <p className="text-sm text-muted-foreground">{invoicePreview.date}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Item</th>
                    <th className="text-center p-3 font-semibold">Qty</th>
                    <th className="text-right p-3 font-semibold">Price</th>
                    <th className="text-right p-3 font-semibold">GST (18%)</th>
                    <th className="text-right p-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicePreview.items.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3 text-center">{item.qty}</td>
                      <td className="p-3 text-right font-mono">${item.price.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-emerald-600">${item.gst.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-semibold">${(item.price + item.gst).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">${invoicePreview.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST (9%)</span>
                  <span className="font-mono text-emerald-600">${(invoicePreview.totalGst / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST (9%)</span>
                  <span className="font-mono text-emerald-600">${(invoicePreview.totalGst / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total</span>
                  <span className="font-mono text-lg">${invoicePreview.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
