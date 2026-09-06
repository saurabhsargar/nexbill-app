"use client"

import { Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessProfileCard } from "@/components/settings/BusinessProfileCard"
import { InvoiceSettingsCard } from "@/components/settings/InvoiceSettingsCard"
import { RegionalSettingsCard } from "@/components/settings/RegionalSettingsCard"
import { NotificationsCard } from "@/components/settings/NotificationsCard"
import { SecurityCard } from "@/components/settings/SecurityCard"
import { AppearanceCard } from "@/components/settings/AppearanceCard"

function SettingsTabs() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const canSeeOrgSettings = user?.role === "ADMIN" || user?.role === "MANAGER"
  const isAdmin = user?.role === "ADMIN"

  const requestedTab = searchParams.get("tab")
  const defaultTab = useMemo(() => {
    if (requestedTab) return requestedTab
    return canSeeOrgSettings ? "business" : "notifications"
  }, [requestedTab, canSeeOrgSettings])

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="flex-wrap h-auto">
        {canSeeOrgSettings && <TabsTrigger value="business">Business</TabsTrigger>}
        {canSeeOrgSettings && <TabsTrigger value="invoicing">Invoicing</TabsTrigger>}
        {canSeeOrgSettings && <TabsTrigger value="regional">Regional</TabsTrigger>}
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>

      {canSeeOrgSettings && (
        <TabsContent value="business">
          <BusinessProfileCard canEdit={isAdmin} />
        </TabsContent>
      )}
      {canSeeOrgSettings && (
        <TabsContent value="invoicing">
          <InvoiceSettingsCard />
        </TabsContent>
      )}
      {canSeeOrgSettings && (
        <TabsContent value="regional">
          <RegionalSettingsCard />
        </TabsContent>
      )}
      <TabsContent value="notifications">
        <NotificationsCard />
      </TabsContent>
      <TabsContent value="security">
        <SecurityCard />
      </TabsContent>
      <TabsContent value="appearance">
        <AppearanceCard />
      </TabsContent>
    </Tabs>
  )
}

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your business and account preferences.</p>
      </div>

      <Suspense fallback={null}>
        <SettingsTabs />
      </Suspense>
    </div>
  )
}
