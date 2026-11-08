import type { Metadata } from 'next'

export function constructMetadata({
  title = 'CMS Platform',
  description = 'Modern Next.js & Supabase CMS',
  image = '/images/og.png',
}: {
  title?: string
  description?: string
  image?: string
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
  }
}
