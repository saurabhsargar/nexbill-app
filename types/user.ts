import type { Role } from "./auth"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: Role
}
