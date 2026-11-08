import { Suspense } from 'react'

async function EditPostContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Post: {id}</h1>
    </div>
  )
}

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Memuat post...</div>}>
      <EditPostContent params={params} />
    </Suspense>
  )
}
