import { apiClient } from "./client"
import type { CreateUserInput, TeamMember } from "@/types/user"
import type { Role } from "@/types/auth"
import type {
  ChangePasswordInput,
  NotificationPreferences,
  SecuritySettings,
  UpdateNotificationPreferencesInput,
} from "@/types/settings"

export async function listUsers(): Promise<TeamMember[]> {
  const { data } = await apiClient.get<TeamMember[]>("/users")
  return data
}

export async function createUser(input: CreateUserInput) {
  const { data } = await apiClient.post("/users", input)
  return data as TeamMember & { password: string }
}

export async function updateUserRole(userId: string, role: Role) {
  const { data } = await apiClient.patch(`/users/${userId}/role`, { role })
  return data as Pick<TeamMember, "id" | "name" | "email" | "role">
}

export async function deactivateUser(userId: string) {
  const { data } = await apiClient.patch(`/users/${userId}/deactivate`)
  return data as TeamMember
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiClient.get<NotificationPreferences>(
    "/users/me/notification-preferences"
  )
  return data
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput
): Promise<NotificationPreferences> {
  const { data } = await apiClient.put<NotificationPreferences>(
    "/users/me/notification-preferences",
    input
  )
  return data
}

// Note: the backend only exposes PUT for this resource — there is no GET
// endpoint to hydrate the current value, so the UI treats it as write-only.
export async function updateSecuritySettings(sessionTimeoutMinutes: number): Promise<SecuritySettings> {
  const { data } = await apiClient.put<SecuritySettings>("/users/me/security-settings", {
    sessionTimeoutMinutes,
  })
  return data
}

export async function changePassword(input: ChangePasswordInput): Promise<{ message: string }> {
  const { data } = await apiClient.post("/users/me/change-password", input)
  return data
}
