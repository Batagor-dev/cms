import { Suspense } from 'react'
import { PublicArticleSkeleton } from '@/components/ui/skeleton'

async function SlugContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-4">
        Halaman:{' '}
        <span className="font-mono text-[13px] font-medium text-muted-foreground align-middle">
          {slug}
        </span>
      </h1>
    </div>
  )
}

export default function DynamicStaticPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<PublicArticleSkeleton />}>
      <SlugContent params={params} />
    </Suspense>
  )
}
