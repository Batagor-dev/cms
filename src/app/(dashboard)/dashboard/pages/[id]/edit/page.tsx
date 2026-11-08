export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Halaman: {id}</h1>
    </div>
  )
}
