"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  HardDrive,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  MemoryStick,
  Wifi,
  Cloud,
  Trash2,
  FolderArchive,
} from "lucide-react"

const systemHealth = [
  { label: "CPU Usage", value: 23, status: "good", icon: Cpu },
  { label: "Memory", value: 67, status: "good", icon: MemoryStick },
  { label: "Storage", value: 45, status: "good", icon: HardDrive },
  { label: "Network", value: 100, status: "good", icon: Wifi },
]

const backups = [
  { id: 1, date: "Jan 27, 2024 10:30 AM", size: "2.4 GB", type: "Full", status: "completed" },
  { id: 2, date: "Jan 26, 2024 10:30 AM", size: "2.3 GB", type: "Full", status: "completed" },
  { id: 3, date: "Jan 25, 2024 10:30 AM", size: "2.3 GB", type: "Incremental", status: "completed" },
  { id: 4, date: "Jan 24, 2024 10:30 AM", size: "2.2 GB", type: "Full", status: "completed" },
]

export default function UtilitiesPage() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)

  const startBackup = () => {
    setIsBackingUp(true)
    setBackupProgress(0)
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsBackingUp(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Utilities</h1>
          <p className="text-sm text-muted-foreground">Manage backups, system health, and data exports.</p>
        </div>
      </div>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemHealth.map((item) => (
          <Card key={item.label} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  item.value < 50 ? "bg-emerald-500/10 text-emerald-500" :
                  item.value < 80 ? "bg-amber-500/10 text-amber-500" :
                  "bg-rose-500/10 text-rose-500"
                )}>
                  <item.icon className="size-5" />
                </div>
                <Badge variant="secondary" className={cn(
                  "text-xs",
                  item.value < 50 ? "bg-emerald-500/10 text-emerald-500" :
                  item.value < 80 ? "bg-amber-500/10 text-amber-500" :
                  "bg-rose-500/10 text-rose-500"
                )}>
                  {item.value}%
                </Badge>
              </div>
              <p className="text-sm font-medium mb-2">{item.label}</p>
              <Progress
                value={item.value}
                className={cn(
                  "h-2",
                  item.value < 50 ? "[&>div]:bg-emerald-500" :
                  item.value < 80 ? "[&>div]:bg-amber-500" :
                  "[&>div]:bg-rose-500"
                )}
              />
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
            {/* Backup Progress */}
            {isBackingUp && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="size-4 text-emerald-500 animate-spin" />
                    <span className="text-sm font-medium">Creating backup...</span>
                  </div>
                  <span className="text-sm font-mono">{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="h-2 [&>div]:bg-emerald-500" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                onClick={startBackup}
                disabled={isBackingUp}
              >
                <Upload className="size-4" />
                Create Backup
              </Button>
              <Button variant="outline" className="flex-1 gap-2 bg-transparent">
                <Download className="size-4" />
                Restore
              </Button>
            </div>

            {/* Recent Backups */}
            <div className="pt-4 border-t space-y-3">
              <p className="text-sm font-medium">Recent Backups</p>
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-background">
                      <FolderArchive className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{backup.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {backup.type} • {backup.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <Button variant="ghost" size="sm" className="size-8 p-0">
                      <Download className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              <button className="flex items-center gap-4 p-4 rounded-xl border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Download className="size-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Export Sales Data</p>
                  <p className="text-sm text-muted-foreground">Download all sales and transactions</p>
                </div>
                <Badge variant="secondary">.xlsx</Badge>
              </button>

              <button className="flex items-center gap-4 p-4 rounded-xl border hover:border-teal-500/50 hover:bg-teal-500/5 transition-all text-left">
                <div className="flex size-12 items-center justify-center rounded-xl bg-teal-500/10">
                  <Download className="size-6 text-teal-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Export Inventory</p>
                  <p className="text-sm text-muted-foreground">Download product catalog and stock</p>
                </div>
                <Badge variant="secondary">.csv</Badge>
              </button>

              <button className="flex items-center gap-4 p-4 rounded-xl border hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left">
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
      </div>

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
          <div className="grid gap-4 md:grid-cols-3">
            <button className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all">
              <div className="flex size-14 items-center justify-center rounded-xl bg-amber-500/10">
                <RefreshCw className="size-7 text-amber-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Optimize Database</p>
                <p className="text-sm text-muted-foreground">Improve performance</p>
              </div>
            </button>

            <button className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-rose-500/50 hover:bg-rose-500/5 transition-all">
              <div className="flex size-14 items-center justify-center rounded-xl bg-rose-500/10">
                <Trash2 className="size-7 text-rose-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Clear Cache</p>
                <p className="text-sm text-muted-foreground">Free up space</p>
              </div>
            </button>

            <button className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-violet-500/50 hover:bg-violet-500/5 transition-all">
              <div className="flex size-14 items-center justify-center rounded-xl bg-violet-500/10">
                <Clock className="size-7 text-violet-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Schedule Backup</p>
                <p className="text-sm text-muted-foreground">Automate backups</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
