import { Suspense } from 'react'
import { PublicListSkeleton } from '@/components/ui/skeleton'

async function TagContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-4">
        Tag:{' '}
        <span className="font-mono text-[13px] font-medium text-muted-foreground align-middle">
          {slug}
        </span>
      </h1>
    </div>
  )
}

export default function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<PublicListSkeleton />}>
      <TagContent params={params} />
    </Suspense>
  )
}
