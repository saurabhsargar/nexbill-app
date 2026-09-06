"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { formatBytes, formatDateTime } from "@/lib/format"
import {
  HardDrive,
  Database,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  MemoryStick,
  Wifi,
  Cloud,
  Trash2,
  FolderArchive,
  Loader2,
} from "lucide-react"
import { useSystemHealth, useOptimizeDatabase, useClearCache, useExportSales, useExportInventory, useExportTaxReports } from "@/hooks/queries/use-system"
import {
  useBackupSchedule,
  useBackups,
  useCreateBackup,
  useDownloadBackup,
  useUpdateBackupSchedule,
} from "@/hooks/queries/use-backups"
import { RestoreBackupDialog } from "@/components/utilities/RestoreBackupDialog"
import { useSyncedState } from "@/hooks/use-synced-state"
import type { Backup, BackupFrequency, BackupSchedule } from "@/types/backup"

const emptyScheduleForm = { frequency: "daily" as BackupFrequency, time: "02:00", retentionCount: "7" }

const STATUS_BADGE: Record<Backup["status"], { label: string; className: string; icon: typeof CheckCircle2 }> = {
  COMPLETED: { label: "Completed", className: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2 },
  PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-500", icon: Clock },
  RUNNING: { label: "Running", className: "bg-blue-500/10 text-blue-500", icon: Loader2 },
  FAILED: { label: "Failed", className: "bg-rose-500/10 text-rose-500", icon: XCircle },
}

function healthColorClass(value: number) {
  if (value < 50) return "text-emerald-500 bg-emerald-500/10"
  if (value < 80) return "text-amber-500 bg-amber-500/10"
  return "text-rose-500 bg-rose-500/10"
}

function healthBarClass(value: number) {
  if (value < 50) return "[&>div]:bg-emerald-500"
  if (value < 80) return "[&>div]:bg-amber-500"
  return "[&>div]:bg-rose-500"
}

export default function UtilitiesPage() {
  const { data: health, isLoading: healthLoading } = useSystemHealth()
  const { data: backupPage, isLoading: backupsLoading } = useBackups({ page: 1, pageSize: 5 })
  const createBackup = useCreateBackup()
  const downloadBackup = useDownloadBackup()
  const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null)

  const { data: schedule, isLoading: scheduleLoading } = useBackupSchedule()
  const updateSchedule = useUpdateBackupSchedule()
  const [{ frequency, time, retentionCount }, setScheduleForm] = useSyncedState<
    BackupSchedule,
    typeof emptyScheduleForm
  >(
    schedule,
    (s) => ({ frequency: s.frequency, time: s.time, retentionCount: String(s.retentionCount) }),
    emptyScheduleForm
  )
  const setFrequency = (value: BackupFrequency) => setScheduleForm((prev) => ({ ...prev, frequency: value }))
  const setTime = (value: string) => setScheduleForm((prev) => ({ ...prev, time: value }))
  const setRetentionCount = (value: string) => setScheduleForm((prev) => ({ ...prev, retentionCount: value }))

  const optimizeDb = useOptimizeDatabase()
  const clearCache = useClearCache()
  const exportSales = useExportSales()
  const exportInventory = useExportInventory()
  const exportTaxReports = useExportTaxReports()

  const healthItems = health
    ? [
        { label: "CPU Usage", value: health.cpuPercent, icon: Cpu },
        { label: "Memory", value: health.memoryPercent, icon: MemoryStick },
        { label: "Storage", value: health.storagePercent, icon: HardDrive },
        { label: "Network", value: health.networkPercent, icon: Wifi },
      ]
    : []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Utilities</h1>
        <p className="text-sm text-muted-foreground">Manage backups, system health, and data exports.</p>
      </div>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {healthLoading || !health
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          : healthItems.map((item) => (
              <Card key={item.label} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("flex size-10 items-center justify-center rounded-xl", healthColorClass(item.value))}>
                      <item.icon className="size-5" />
                    </div>
                    <Badge variant="secondary" className={cn("text-xs", healthColorClass(item.value))}>
                      {item.value.toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-2">{item.label}</p>
                  <Progress value={item.value} className={cn("h-2", healthBarClass(item.value))} />
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Backup & Restore */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5 text-emerald-500" />
              Backup & Restore
            </CardTitle>
            <CardDescription>Create and manage database backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                disabled={createBackup.isPending}
                onClick={() => createBackup.mutate("FULL")}
              >
                <RefreshCw className={cn("size-4", createBackup.isPending && "animate-spin")} />
                {createBackup.isPending ? "Starting..." : "Create Full Backup"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 bg-transparent"
                disabled={createBackup.isPending}
                onClick={() => createBackup.mutate("INCREMENTAL")}
              >
                Incremental
              </Button>
            </div>

            <div className="pt-4 border-t space-y-3">
              <p className="text-sm font-medium">Recent Backups</p>
              {backupsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
              ) : (backupPage?.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No backups yet.</p>
              ) : (
                (backupPage?.data ?? []).map((backup) => {
                  const status = STATUS_BADGE[backup.status]
                  const StatusIcon = status.icon
                  return (
                    <div key={backup.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-background">
                          <FolderArchive className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formatDateTime(backup.createdAt)}</p>
                          <p className="text-xs text-muted-foreground">
                            {backup.type} • {backup.sizeBytes ? formatBytes(backup.sizeBytes) : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={cn("gap-1 text-xs", status.className)}>
                          <StatusIcon className={cn("size-3", backup.status === "RUNNING" && "animate-spin")} />
                          {status.label}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0"
                          disabled={backup.status !== "COMPLETED" || downloadBackup.isPending}
                          onClick={() => downloadBackup.mutate(backup.id)}
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                          disabled={backup.status !== "COMPLETED"}
                          onClick={() => setRestoreTarget(backup)}
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Backup Schedule */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-violet-500" />
              Backup Schedule
            </CardTitle>
            <CardDescription>Preferred cadence for backups (reference only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduleLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as BackupFrequency)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time (24h)</Label>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Retention Count</Label>
                  <Input
                    type="number"
                    min={1}
                    value={retentionCount}
                    onChange={(e) => setRetentionCount(e.target.value)}
                    className="max-w-32"
                  />
                </div>
                <Button
                  variant="outline"
                  disabled={updateSchedule.isPending}
                  onClick={() =>
                    updateSchedule.mutate({ frequency, time, retentionCount: Number(retentionCount) })
                  }
                >
                  {updateSchedule.isPending ? "Saving..." : "Save Schedule"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  This is saved for reference only — it does not yet trigger backups automatically.
                  Use &quot;Create Backup&quot; above whenever you need one.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Export */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="size-5 text-cyan-500" />
              Data Export
            </CardTitle>
            <CardDescription>Export your data in various formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <button
                className="flex items-center gap-4 p-4 rounded-xl border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left disabled:opacity-50"
                disabled={exportSales.isPending}
                onClick={() => exportSales.mutate(undefined)}
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Download className="size-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Export Sales Data</p>
                  <p className="text-sm text-muted-foreground">Download all sales and transactions</p>
                </div>
                <Badge variant="secondary">.xlsx</Badge>
              </button>

              <button
                className="flex items-center gap-4 p-4 rounded-xl border hover:border-teal-500/50 hover:bg-teal-500/5 transition-all text-left disabled:opacity-50"
                disabled={exportInventory.isPending}
                onClick={() => exportInventory.mutate()}
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-teal-500/10">
                  <Download className="size-6 text-teal-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Export Inventory</p>
                  <p className="text-sm text-muted-foreground">Download product catalog and stock</p>
                </div>
                <Badge variant="secondary">.csv</Badge>
              </button>

              <button
                className="flex items-center gap-4 p-4 rounded-xl border hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left disabled:opacity-50"
                disabled={exportTaxReports.isPending}
                onClick={() => exportTaxReports.mutate(undefined)}
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-500/10">
                  <Download className="size-6 text-cyan-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Export Tax Reports</p>
                  <p className="text-sm text-muted-foreground">GST-ready tax report exports</p>
                </div>
                <Badge variant="secondary">.pdf</Badge>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Database Management */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="size-5 text-amber-500" />
              Database Management
            </CardTitle>
            <CardDescription>Manage database operations and maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all disabled:opacity-50"
                disabled={optimizeDb.isPending}
                onClick={() => optimizeDb.mutate()}
              >
                <div className="flex size-14 items-center justify-center rounded-xl bg-amber-500/10">
                  <RefreshCw className={cn("size-7 text-amber-500", optimizeDb.isPending && "animate-spin")} />
                </div>
                <div className="text-center">
                  <p className="font-semibold">{optimizeDb.isPending ? "Optimizing..." : "Optimize Database"}</p>
                  <p className="text-sm text-muted-foreground">Runs VACUUM ANALYZE — can take a while</p>
                </div>
              </button>

              <button
                className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-rose-500/50 hover:bg-rose-500/5 transition-all disabled:opacity-50"
                disabled={clearCache.isPending}
                onClick={() => clearCache.mutate()}
              >
                <div className="flex size-14 items-center justify-center rounded-xl bg-rose-500/10">
                  <Trash2 className="size-7 text-rose-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Clear Cache</p>
                  <p className="text-sm text-muted-foreground">No cache layer is configured yet</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <RestoreBackupDialog
        open={!!restoreTarget}
        backup={restoreTarget}
        onClose={() => setRestoreTarget(null)}
      />
    </div>
  )
}
