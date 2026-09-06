"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, Upload } from "lucide-react"
import { API_URL } from "@/lib/api/client"
import { useBusinessProfile, useUpdateBusinessProfile, useUploadBusinessLogo } from "@/hooks/queries/use-business"
import { useSyncedState } from "@/hooks/use-synced-state"
import type { BusinessProfile } from "@/types/business"

interface Props {
  canEdit: boolean
}

const emptyForm = { name: "", gstin: "", pan: "", state: "", stateCode: "", address: "", phone: "", email: "" }

export function BusinessProfileCard({ canEdit }: Props) {
  const { data: profile, isLoading } = useBusinessProfile()
  const updateProfile = useUpdateBusinessProfile()
  const uploadLogo = useUploadBusinessLogo()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useSyncedState<BusinessProfile, typeof emptyForm>(
    profile,
    (p) => ({
      name: p.name ?? "",
      gstin: p.gstin ?? "",
      pan: p.pan ?? "",
      state: p.state ?? "",
      stateCode: p.stateCode ?? "",
      address: p.address ?? "",
      phone: p.phone ?? "",
      email: p.email ?? "",
    }),
    emptyForm
  )

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const initials = (form.name || "NB")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-5 text-emerald-500" />
          Business Profile
        </CardTitle>
        <CardDescription>
          {canEdit ? "Your business information for invoices" : "Read-only — only an admin can edit this"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {profile?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${API_URL}${profile.logoUrl}`}
              alt="Business logo"
              className="size-20 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-2xl font-bold shadow-lg shadow-emerald-500/30">
              {initials}
            </div>
          )}
          {canEdit && (
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadLogo.mutate(file)
                  e.target.value = ""
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                disabled={uploadLogo.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                {uploadLogo.isPending ? "Uploading..." : "Upload Logo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 2MB</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Business Name</Label>
          <Input value={form.name} onChange={set("name")} disabled={!canEdit} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>GSTIN</Label>
            <Input value={form.gstin} onChange={set("gstin")} disabled={!canEdit} className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label>PAN</Label>
            <Input value={form.pan} onChange={set("pan")} disabled={!canEdit} className="font-mono" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>State</Label>
            <Input value={form.state} onChange={set("state")} disabled={!canEdit} />
          </div>
          <div className="space-y-2">
            <Label>State Code</Label>
            <Input value={form.stateCode} onChange={set("stateCode")} disabled={!canEdit} className="font-mono" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={set("phone")} disabled={!canEdit} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={set("email")} disabled={!canEdit} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={form.address} onChange={set("address")} disabled={!canEdit} />
        </div>
        {canEdit && (
          <Button
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            disabled={updateProfile.isPending}
            onClick={() =>
              updateProfile.mutate({
                name: form.name,
                gstin: form.gstin || undefined,
                pan: form.pan || undefined,
                state: form.state || undefined,
                stateCode: form.stateCode || undefined,
                address: form.address || undefined,
                phone: form.phone || undefined,
                email: form.email || undefined,
              })
            }
          >
            {updateProfile.isPending ? "Saving..." : "Save Business Profile"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
