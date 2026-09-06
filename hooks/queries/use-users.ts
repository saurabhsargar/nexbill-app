import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api/client"
import {
  changePassword,
  createUser,
  deactivateUser,
  getNotificationPreferences,
  listUsers,
  updateNotificationPreferences,
  updateSecuritySettings,
  updateUserRole,
} from "@/lib/api/users"
import type { Role } from "@/types/auth"
import type { ChangePasswordInput, UpdateNotificationPreferencesInput } from "@/types/settings"
import type { CreateUserInput } from "@/types/user"

export const userKeys = {
  all: ["users"] as const,
  notificationPreferences: ["users", "me", "notification-preferences"] as const,
}

export function useUsers() {
  return useQuery({ queryKey: userKeys.all, queryFn: listUsers })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      toast.success("User created")
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create user")),
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      toast.success("Role updated")
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update role")),
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: () => {
      toast.success("User deactivated")
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to deactivate user")),
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: userKeys.notificationPreferences,
    queryFn: getNotificationPreferences,
  })
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateNotificationPreferencesInput) =>
      updateNotificationPreferences(input),
    onSuccess: () => {
      toast.success("Notification preferences saved")
      queryClient.invalidateQueries({ queryKey: userKeys.notificationPreferences })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to save preferences")),
  })
}

export function useUpdateSecuritySettings() {
  return useMutation({
    mutationFn: (sessionTimeoutMinutes: number) => updateSecuritySettings(sessionTimeoutMinutes),
    onSuccess: () => toast.success("Security settings saved"),
    onError: (error) => toast.error(getErrorMessage(error, "Failed to save security settings")),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),
    onSuccess: () => toast.success("Password updated successfully"),
    onError: (error) => toast.error(getErrorMessage(error, "Failed to change password")),
  })
}
