import { Suspense } from 'react'

async function TagContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-4">Tag: {slug}</h1>
    </div>
  )
}

export default function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<div className="py-8 text-muted-foreground">Memuat tag...</div>}>
      <TagContent params={params} />
    </Suspense>
  )
}
