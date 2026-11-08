export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-4">Kategori: {slug}</h1>
    </div>
  )
}
