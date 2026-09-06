import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api/client"
import {
  createBackup,
  downloadBackup,
  getBackupSchedule,
  listBackups,
  restoreBackup,
  updateBackupSchedule,
} from "@/lib/api/backups"
import type { PaginationParams } from "@/types/api"
import type { Backup, BackupType, UpdateBackupScheduleInput } from "@/types/backup"

export const backupKeys = {
  all: ["backups"] as const,
  list: (params: PaginationParams) => [...backupKeys.all, "list", params] as const,
  schedule: ["backups", "schedule"] as const,
}

const ACTIVE_STATUSES = new Set(["PENDING", "RUNNING"])

export function useBackups(params: PaginationParams) {
  return useQuery({
    queryKey: backupKeys.list(params),
    queryFn: () => listBackups(params),
    refetchInterval: (query) => {
      const data = query.state.data as { data: Backup[] } | undefined
      const hasActive = data?.data?.some((b) => ACTIVE_STATUSES.has(b.status))
      return hasActive ? 3000 : false
    },
  })
}

export function useCreateBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (type: BackupType) => createBackup(type),
    onSuccess: () => {
      toast.success("Backup started")
      queryClient.invalidateQueries({ queryKey: backupKeys.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to start backup")),
  })
}

export function useDownloadBackup() {
  return useMutation({
    mutationFn: (id: string) => downloadBackup(id),
    onError: (error) => toast.error(getErrorMessage(error, "Download failed")),
  })
}

export function useRestoreBackup() {
  return useMutation({
    mutationFn: (id: string) => restoreBackup(id),
    onSuccess: () => toast.success("Database restored successfully"),
    onError: (error) => toast.error(getErrorMessage(error, "Restore failed")),
  })
}

export function useBackupSchedule() {
  return useQuery({ queryKey: backupKeys.schedule, queryFn: getBackupSchedule })
}

export function useUpdateBackupSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateBackupScheduleInput) => updateBackupSchedule(input),
    onSuccess: () => {
      toast.success("Backup schedule saved")
      queryClient.invalidateQueries({ queryKey: backupKeys.schedule })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to save schedule")),
  })
}
