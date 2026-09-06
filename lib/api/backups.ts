import { apiClient } from "./client"
import { downloadBlob } from "@/lib/format"
import type { PaginatedResult, PaginationParams } from "@/types/api"
import type { Backup, BackupSchedule, BackupType, UpdateBackupScheduleInput } from "@/types/backup"

export async function listBackups(params?: PaginationParams): Promise<PaginatedResult<Backup>> {
  const { data } = await apiClient.get<PaginatedResult<Backup>>("/backups", { params })
  return data
}

export async function createBackup(type: BackupType): Promise<Backup> {
  const { data } = await apiClient.post<Backup>("/backups", { type })
  return data
}

export async function getBackup(id: string): Promise<Backup> {
  const { data } = await apiClient.get<Backup>(`/backups/${id}`)
  return data
}

export async function downloadBackup(id: string): Promise<void> {
  const res = await apiClient.get(`/backups/${id}/download`, { responseType: "blob" })
  downloadBlob(res.data, `${id}.dump`)
}

export async function restoreBackup(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.post(`/backups/${id}/restore`)
  return data
}

export async function getBackupSchedule(): Promise<BackupSchedule> {
  const { data } = await apiClient.get<BackupSchedule>("/backups/schedule")
  return data
}

export async function updateBackupSchedule(
  input: UpdateBackupScheduleInput
): Promise<BackupSchedule> {
  const { data } = await apiClient.put<BackupSchedule>("/backups/schedule", input)
  return data
}
