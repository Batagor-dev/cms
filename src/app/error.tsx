'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan!</h2>
      <p className="text-muted-foreground mb-4">{error.message || 'Gagal memuat halaman.'}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
      >
        Coba Lagi
      </button>
    </div>
  )
}
