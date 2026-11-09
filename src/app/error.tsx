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
      <h1 className="text-2xl font-semibold tracking-tight leading-tight mb-2">
        Terjadi Kesalahan!
      </h1>
      <p className="text-sm text-muted-foreground leading-normal max-w-prose mb-6">
        {error.message || 'Gagal memuat halaman.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-opacity [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90 cursor-pointer"
      >
        Coba Lagi
      </button>
    </div>
  )
}
