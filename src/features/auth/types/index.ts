import type { Role } from '@/features/roles/types'

export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio?: string | null
  roles?: Role[]
  permissions?: string[]
}
