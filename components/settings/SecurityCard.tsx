"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import { toast } from "sonner"
import { useChangePassword, useUpdateSecuritySettings } from "@/hooks/queries/use-users"

export function SecurityCard() {
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const updateSecurity = useUpdateSecuritySettings()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const changePassword = useChangePassword()

  const canChangePassword =
    currentPassword.length > 0 && newPassword.length >= 6 && newPassword === confirmPassword

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        },
      }
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-5 text-rose-500" />
          Security
        </CardTitle>
        <CardDescription>Manage your session and password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Session Timeout (minutes)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={5}
              max={1440}
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="max-w-32"
            />
            <Button
              variant="outline"
              disabled={updateSecurity.isPending}
              onClick={() => updateSecurity.mutate(Number(sessionTimeout))}
            >
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Stored for reference — not yet enforced against active sessions, which always expire
            24 hours after login.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <p className="font-medium text-sm">Change Password</p>
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            disabled={!canChangePassword || changePassword.isPending}
            onClick={handleChangePassword}
          >
            {changePassword.isPending ? "Updating..." : "Change Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
