import { PostStatus } from '../constants'

export interface Post {
  id: string
  title: string
  slug: string
  content?: any
  excerpt?: string
  featured_image?: string
  status: PostStatus
  author_id?: string
  published_at?: string
  created_at: string
  updated_at: string
}
