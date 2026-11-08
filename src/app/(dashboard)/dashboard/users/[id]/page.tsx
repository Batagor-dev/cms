export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Detail Pengguna: {id}</h1>
    </div>
  )
}
