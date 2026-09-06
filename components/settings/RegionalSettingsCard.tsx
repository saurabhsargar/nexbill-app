"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Globe } from "lucide-react"
import { useRegionalSettings, useUpdateRegionalSettings } from "@/hooks/queries/use-settings"
import { useSyncedState } from "@/hooks/use-synced-state"
import type { RegionalSettings } from "@/types/settings"

const emptyForm = { language: "", currency: "", dateFormat: "" }

export function RegionalSettingsCard() {
  const { data: settings, isLoading } = useRegionalSettings()
  const updateSettings = useUpdateRegionalSettings()

  const [{ language, currency, dateFormat }, setForm] = useSyncedState<RegionalSettings, typeof emptyForm>(
    settings,
    (s) => ({ language: s.language, currency: s.currency, dateFormat: s.dateFormat }),
    emptyForm
  )
  const setLanguage = (value: string) => setForm((prev) => ({ ...prev, language: value }))
  const setCurrency = (value: string) => setForm((prev) => ({ ...prev, currency: value }))
  const setDateFormat = (value: string) => setForm((prev) => ({ ...prev, dateFormat: value }))

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="size-5 text-blue-500" />
          Regional Settings
        </CardTitle>
        <CardDescription>Configure language, currency, and date formatting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Language</Label>
          <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en-IN" />
        </div>
        <div className="space-y-2">
          <Label>Currency Code</Label>
          <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="INR" />
        </div>
        <div className="space-y-2">
          <Label>Date Format</Label>
          <Input value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} placeholder="DD/MM/YYYY" />
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          disabled={updateSettings.isPending}
          onClick={() => updateSettings.mutate({ language, currency, dateFormat })}
        >
          {updateSettings.isPending ? "Saving..." : "Save Regional Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
