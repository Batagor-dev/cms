import { Suspense } from 'react'
import { PublicListSkeleton } from '@/components/ui/skeleton'

async function CategoryContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-4">
        Kategori:{' '}
        <span className="font-mono text-[13px] font-medium text-muted-foreground align-middle">
          {slug}
        </span>
      </h1>
    </div>
  )
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<PublicListSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  )
}
