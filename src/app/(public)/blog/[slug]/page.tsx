import { Suspense } from 'react'

async function BlogPostContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <article className="py-8">
      <h1 className="text-3xl font-bold mb-4">Detail Artikel: {slug}</h1>
    </article>
  )
}

export default function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<div className="py-8 text-muted-foreground">Memuat artikel...</div>}>
      <BlogPostContent params={params} />
    </Suspense>
  )
}
