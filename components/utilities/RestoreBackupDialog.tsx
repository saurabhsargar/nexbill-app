"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { useRestoreBackup } from "@/hooks/queries/use-backups"
import type { Backup } from "@/types/backup"

const CONFIRM_PHRASE = "RESTORE"

interface Props {
  open: boolean
  onClose: () => void
  backup: Backup | null
}

export function RestoreBackupDialog({ open, onClose, backup }: Props) {
  const [confirmText, setConfirmText] = useState("")
  const restoreBackup = useRestoreBackup()

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setConfirmText("")
      onClose()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">Restore entire database?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This overwrites the <strong>entire shared database</strong> — every organization&apos;s
            data, not just yours — with the state from this backup. It runs immediately, cannot be
            undone, and there is no automatic backup-before-restore safety net.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label>
            Type <span className="font-mono font-semibold">{CONFIRM_PHRASE}</span> to confirm
          </Label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={confirmText !== CONFIRM_PHRASE || restoreBackup.isPending}
            onClick={(e) => {
              e.preventDefault()
              if (!backup) return
              restoreBackup.mutate(backup.id, {
                onSettled: () => {
                  setConfirmText("")
                  onClose()
                },
              })
            }}
          >
            {restoreBackup.isPending ? "Restoring..." : "Restore Database"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
