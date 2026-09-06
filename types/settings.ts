export interface TaxConfig {
  id: string
  gstEnabled: boolean
  cgstEnabled: boolean
  sgstEnabled: boolean
  igstEnabled: boolean
  defaultGstRate: number | string
  updatedAt: string
  organizationId: string
}

export interface UpdateTaxConfigInput {
  gstEnabled?: boolean
  cgstEnabled?: boolean
  sgstEnabled?: boolean
  igstEnabled?: boolean
  defaultGstRate?: number
}

export interface InvoiceConfig {
  id: string
  prefix: string
  nextNumber: number
  footerNote?: string | null
  updatedAt: string
  organizationId: string
}

export interface UpdateInvoiceConfigInput {
  prefix?: string
  footerNote?: string
  startingNumber?: number
}

export interface RegionalSettings {
  id: string
  language: string
  currency: string
  dateFormat: string
  updatedAt: string
  organizationId: string
}

export interface UpdateRegionalSettingsInput {
  language?: string
  currency?: string
  dateFormat?: string
}

export interface NotificationPreferences {
  id: string
  lowStockAlerts: boolean
  dailySalesSummary: boolean
  newTransactionAlerts: boolean
  systemUpdates: boolean
  userId: string
}

export type UpdateNotificationPreferencesInput = Partial<
  Omit<NotificationPreferences, "id" | "userId">
>

export interface SecuritySettings {
  id: string
  sessionTimeoutMinutes: number
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}
