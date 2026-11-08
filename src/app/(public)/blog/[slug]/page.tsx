export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <article className="py-8">
      <h1 className="text-3xl font-bold mb-4">Detail Artikel: {slug}</h1>
    </article>
  )
}
