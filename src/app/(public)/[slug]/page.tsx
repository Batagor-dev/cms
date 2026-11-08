export default async function DynamicStaticPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-4">Halaman: {slug}</h1>
    </div>
  )
}
