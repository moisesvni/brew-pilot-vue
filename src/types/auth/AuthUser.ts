import type { UserPlan } from './UserPlan'

export interface AuthUser {
  userId: string
  avatarUrl: string | null
  email: string
  name: string
  plan: UserPlan
}
