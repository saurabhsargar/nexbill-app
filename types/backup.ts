export type BackupType = "FULL" | "INCREMENTAL"
export type BackupStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"

export interface Backup {
  id: string
  organizationId: string
  type: BackupType
  status: BackupStatus
  sizeBytes?: string | null
  errorMessage?: string | null
  createdAt: string
  completedAt?: string | null
}

export type BackupFrequency = "daily" | "weekly" | "monthly"

export interface BackupSchedule {
  organizationId: string
  frequency: BackupFrequency
  time: string
  retentionCount: number
  updatedAt: string
}

export interface UpdateBackupScheduleInput {
  frequency: BackupFrequency
  time: string
  retentionCount?: number
}

export interface SystemHealth {
  cpuPercent: number
  memoryPercent: number
  storagePercent: number
  networkPercent: number
}
