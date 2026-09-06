export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface DateRangeParams {
  from?: string
  to?: string
}

export type TrendRange = "daily" | "weekly" | "monthly"
