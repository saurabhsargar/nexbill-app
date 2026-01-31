"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Building2,
  Receipt,
  Palette,
  Bell,
  Shield,
  Globe,
  Sun,
  Moon,
  Monitor,
  Upload,
  Save,
} from "lucide-react"

const themes = [
  { id: "light", name: "Light", icon: Sun, colors: ["bg-white", "bg-slate-100", "bg-emerald-500"] },
  { id: "dark", name: "Dark", icon: Moon, colors: ["bg-slate-900", "bg-slate-800", "bg-emerald-500"] },
  { id: "gradient", name: "Gradient", icon: Palette, colors: ["bg-slate-900", "bg-gradient-to-r from-emerald-500 to-teal-500", "bg-cyan-500"] },
]

export default function SettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState("light")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your application preferences.</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25">
          <Save className="size-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business Profile */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-emerald-500" />
              Business Profile
            </CardTitle>
            <CardDescription>Your business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-2xl font-bold shadow-lg shadow-emerald-500/30">
                NB
              </div>
              <div className="flex-1">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Upload className="size-4" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 2MB</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input defaultValue="NexBill Electronics" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="+1 234 567 8900" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="contact@nexbill.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input defaultValue="123 Tech Park, Silicon Valley, CA 94000" />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Branding */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-5 text-teal-500" />
              Invoice Branding
            </CardTitle>
            <CardDescription>Customize your invoice appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Invoice Preview */}
            <div className="rounded-xl border p-4 bg-muted/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm font-bold">
                    NB
                  </div>
                  <div>
                    <p className="font-bold">NexBill Electronics</p>
                    <p className="text-xs text-muted-foreground">contact@nexbill.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Invoice</p>
                  <p className="font-mono text-sm">#INV-001</p>
                </div>
              </div>
              <div className="h-20 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                Invoice Items Preview
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Prefix</Label>
                <Input defaultValue="INV-" className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Starting Number</Label>
                <Input type="number" defaultValue="1001" className="font-mono" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Footer Note</Label>
              <Input defaultValue="Thank you for your business!" />
            </div>
          </CardContent>
        </Card>

        {/* Theme Selector */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-5 text-violet-500" />
              Appearance
            </CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all",
                    selectedTheme === theme.id
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  {selectedTheme === theme.id && (
                    <div className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex gap-1">
                    {theme.colors.map((color, i) => (
                      <div key={i} className={cn("size-6 rounded-full", color)} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <theme.icon className="size-4" />
                    <span className="text-sm font-medium">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-amber-500" />
              Notifications
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when stock is low</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Daily Sales Summary</p>
                <p className="text-sm text-muted-foreground">Receive daily sales report</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">New Transaction Alerts</p>
                <p className="text-sm text-muted-foreground">Notify for each transaction</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">System Updates</p>
                <p className="text-sm text-muted-foreground">Updates and maintenance alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security & Language */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-rose-500" />
              Security
            </CardTitle>
            <CardDescription>Manage security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add extra security layer</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="outline" className="w-full bg-transparent">Change Password</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5 text-blue-500" />
              Regional Settings
            </CardTitle>
            <CardDescription>Configure language and regional preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Input defaultValue="English (US)" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input defaultValue="USD ($)" />
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Input defaultValue="MM/DD/YYYY" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
