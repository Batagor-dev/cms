import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight leading-tight mb-2 tabular-nums">
        404
      </h1>
      <p className="text-lg font-medium text-muted-foreground leading-tight mb-6">
        Halaman Tidak Ditemukan
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:underline"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
