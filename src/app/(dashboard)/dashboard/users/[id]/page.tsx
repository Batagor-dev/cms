import { Suspense } from 'react'
import { FormPageSkeleton } from '@/components/ui/skeleton'

async function UserDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight leading-tight mb-4">
        Detail Pengguna:{' '}
        <span className="font-mono text-[13px] font-medium text-muted-foreground align-middle tabular-nums">
          {id}
        </span>
      </h1>
    </div>
  )
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <UserDetailContent params={params} />
    </Suspense>
  )
}
