export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  slug: string
  description: string | null
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface PermissionGroup {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  permissions?: Permission[]
}

export interface Permission {
  id: string
  group_id: string | null
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface UserHasRole {
  user_id: string
  role_id: string
  assigned_at: string
  role?: Role
}

export interface RoleHasPermission {
  role_id: string
  permission_id: string
  assigned_at: string
  permission?: Permission
}
