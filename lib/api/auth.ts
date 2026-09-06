import { apiClient } from "./client"
import type { Role } from "@/types/auth"

export interface LoginResponse {
  access_token: string
}

export interface MeResponse {
  id: string
  name: string
  email: string
  role: Role
  organization: { id: string; name: string; slug: string }
}

export async function loginUser(
  email: string,
  password: string,
  organizationSlug: string
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
    organizationSlug,
  })
  return data
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>("/auth/me")
  return data
}
