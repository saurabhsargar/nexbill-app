import axios from "axios"
import { getSession, clearSession } from "@/lib/auth"

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export const apiClient = axios.create({
  baseURL: API_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = getSession()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      clearSession()
      if (window.location.pathname !== "/") {
        window.location.href = "/"
      }
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined
    if (Array.isArray(data?.message)) return data.message.join(", ")
    if (typeof data?.message === "string") return data.message
    return error.message || fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}
