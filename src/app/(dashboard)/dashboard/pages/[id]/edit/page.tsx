import { Suspense } from 'react'

async function EditPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Halaman: {id}</h1>
    </div>
  )
}

export default function EditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Memuat data halaman...</div>}>
      <EditPageContent params={params} />
    </Suspense>
  )
}
