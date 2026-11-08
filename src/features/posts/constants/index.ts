export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS]
