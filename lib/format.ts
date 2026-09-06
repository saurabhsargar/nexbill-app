export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

export function formatCurrency(value: unknown, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(toNumber(value))
}

export function formatNumber(value: unknown): string {
  return new Intl.NumberFormat("en-IN").format(toNumber(value))
}

export function formatPercent(value: unknown, options?: { withSign?: boolean }): string {
  const n = toNumber(value)
  const sign = options?.withSign && n > 0 ? "+" : ""
  return `${sign}${n.toFixed(1)}%`
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat(
    "en-IN",
    options ?? { day: "2-digit", month: "short", year: "numeric" }
  ).format(date)
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatBytes(value: unknown): string {
  const bytes = toNumber(value)
  if (bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`
}

export function filenameFromContentDisposition(
  headerValue: string | undefined | null,
  fallback: string
): string {
  if (!headerValue) return fallback
  const match = /filename="?([^";]+)"?/i.exec(headerValue)
  return match?.[1] || fallback
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
