export const PERMISSIONS = {
  // Posts
  POSTS_READ: 'posts.read',
  POSTS_CREATE: 'posts.create',
  POSTS_UPDATE: 'posts.update',
  POSTS_DELETE: 'posts.delete',
  POSTS_PUBLISH: 'posts.publish',

  // Pages
  PAGES_READ: 'pages.read',
  PAGES_MANAGE: 'pages.manage',

  // Taxonomies
  TAXONOMIES_MANAGE: 'taxonomies.manage',

  // Media
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',

  // Users & Roles
  USERS_READ: 'users.read',
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',

  // Settings
  SETTINGS_MANAGE: 'settings.manage',
} as const

export type PermissionSlug = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  VIEWER: 'viewer',
} as const

export type RoleSlug = (typeof ROLES)[keyof typeof ROLES]
