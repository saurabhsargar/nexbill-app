import { apiClient } from "./client"
import type { SystemHealth } from "@/types/backup"

export async function getSystemHealth(): Promise<SystemHealth> {
  const { data } = await apiClient.get<SystemHealth>("/system/health")
  return data
}

export async function optimizeDatabase(): Promise<{ message: string }> {
  const { data } = await apiClient.post("/system/optimize-db")
  return data
}

export async function clearCache(): Promise<{ message: string }> {
  const { data } = await apiClient.post("/system/clear-cache")
  return data
}
