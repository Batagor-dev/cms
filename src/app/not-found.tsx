import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-4xl font-extrabold mb-2">404</h2>
      <p className="text-xl text-muted-foreground mb-4">Halaman Tidak Ditemukan</p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:underline"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
