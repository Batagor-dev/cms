import { DataTableSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function ComponentsDemoLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat demo komponen UI"
      className="flex flex-col gap-6 w-full"
    >
      <span className="sr-only">Memuat halaman UI components...</span>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <Skeleton shape="card" className="size-12 shrink-0" />
          <div className="space-y-2">
            <Skeleton shape="pill" delayMs={40} className="h-7 w-44" />
            <Skeleton shape="pill" delayMs={70} className="h-4 w-72 sm:w-96 max-w-full" />
          </div>
        </div>
        <Skeleton shape="rounded" delayMs={100} className="h-10 w-56 shrink-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="space-y-2">
              <Skeleton shape="pill" delayMs={idx * 60} className="h-5 w-52" />
              <Skeleton shape="pill" delayMs={idx * 60 + 30} className="h-3.5 w-full max-w-md" />
            </div>
            <Skeleton shape="card" delayMs={idx * 60 + 60} className="h-24 w-full" />
            <Skeleton shape="rounded" delayMs={idx * 60 + 90} className="h-9 w-full" />
          </div>
        ))}
      </div>

      <DataTableSkeleton rows={5} columns={5} />
    </div>
  )
}

