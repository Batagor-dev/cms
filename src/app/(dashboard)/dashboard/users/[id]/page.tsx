import { Suspense } from 'react'

async function UserDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Detail Pengguna: {id}</h1>
    </div>
  )
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Memuat detail pengguna...</div>}>
      <UserDetailContent params={params} />
    </Suspense>
  )
}
