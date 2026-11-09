import { Suspense } from 'react'
import { PublicArticleSkeleton } from '@/components/ui/skeleton'

async function BlogPostContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <article className="py-8">
      <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-4">
        Detail Artikel:{' '}
        <span className="font-mono text-[13px] font-medium text-muted-foreground align-middle">
          {slug}
        </span>
      </h1>
    </article>
  )
}

export default function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<PublicArticleSkeleton />}>
      <BlogPostContent params={params} />
    </Suspense>
  )
}
