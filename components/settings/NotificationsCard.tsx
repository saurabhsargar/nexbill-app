"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell } from "lucide-react"
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/queries/use-users"
import type { NotificationPreferences } from "@/types/settings"

const ROWS: { key: keyof Omit<NotificationPreferences, "id" | "userId">; label: string; description: string }[] = [
  { key: "lowStockAlerts", label: "Low Stock Alerts", description: "Get notified when stock is low" },
  { key: "dailySalesSummary", label: "Daily Sales Summary", description: "Receive a daily sales report" },
  { key: "newTransactionAlerts", label: "New Transaction Alerts", description: "Notify for each transaction" },
  { key: "systemUpdates", label: "System Updates", description: "Updates and maintenance alerts" },
]

export function NotificationsCard() {
  const { data: prefs, isLoading } = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-5 text-amber-500" />
          Notifications
        </CardTitle>
        <CardDescription>Configure your personal notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || !prefs
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
          : ROWS.map((row) => (
              <div key={row.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{row.label}</p>
                  <p className="text-sm text-muted-foreground">{row.description}</p>
                </div>
                <Switch
                  checked={prefs[row.key]}
                  disabled={updatePrefs.isPending}
                  onCheckedChange={(checked) => updatePrefs.mutate({ [row.key]: checked })}
                />
              </div>
            ))}
      </CardContent>
    </Card>
  )
}
