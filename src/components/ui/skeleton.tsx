import * as React from 'react'
import { cn } from '@/lib/utils'

const SKELETON_SHAPE_CLASSES = {
  rounded: 'rounded-xl',
  pill: 'rounded-full',
  circle: 'rounded-full shrink-0',
  rect: 'rounded-md',
  card: 'rounded-2xl',
} as const

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: keyof typeof SKELETON_SHAPE_CLASSES
  /** Stagger shimmer wave in milliseconds so card sections cascade smoothly like Gojek skeletons */
  delayMs?: number
  ref?: React.Ref<HTMLDivElement>
}

export function Skeleton({
  className,
  shape = 'rounded',
  delayMs,
  style,
  ref,
  ...props
}: SkeletonProps) {
  const customStyle =
    delayMs !== undefined
      ? ({
          ...style,
          '--skeleton-delay': `${delayMs}ms`,
        } as React.CSSProperties)
      : style

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={customStyle}
      className={cn(
        'cms-skeleton-shimmer bg-zinc-200/75 dark:bg-zinc-800/85 select-none pointer-events-none',
        SKELETON_SHAPE_CLASSES[shape],
        className
      )}
      {...props}
    />
  )
}

const LINE_WIDTHS = ['w-full', 'w-[92%]', 'w-[68%]', 'w-[84%]', 'w-[54%]'] as const

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  delayMs?: number
  ref?: React.Ref<HTMLDivElement>
}

export function SkeletonText({
  lines = 3,
  delayMs = 0,
  className,
  ref,
  ...props
}: SkeletonTextProps) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('space-y-2.5', className)}
      {...props}
    >
      {Array.from({ length: lines }).map((_, idx) => {
        const widthClass =
          idx === lines - 1 && lines > 1
            ? 'w-[62%]'
            : LINE_WIDTHS[idx % LINE_WIDTHS.length]

        return (
          <Skeleton
            key={idx}
            shape="pill"
            delayMs={delayMs + idx * 55}
            className={cn('h-3.5', widthClass)}
          />
        )
      })}
    </div>
  )
}

export interface DataTableSkeletonProps {
  rows?: number
  columns?: number
  selectable?: boolean
  showToolbar?: boolean
  className?: string
}

export function DataTableSkeleton({
  rows = 5,
  columns = 5,
  selectable = true,
  showToolbar = true,
  className,
}: DataTableSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat tabel data"
      className={cn(
        'rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden',
        className
      )}
    >
      <span className="sr-only">Memuat data tabel...</span>

      {showToolbar && (
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Skeleton shape="pill" className="h-4 w-16" />
            <Skeleton shape="rounded" className="h-9 w-[82px]" delayMs={40} />
            <Skeleton shape="pill" className="h-4 w-10" delayMs={60} />
            <Skeleton shape="rounded" className="h-9 w-28" delayMs={90} />
          </div>

          <Skeleton shape="rounded" className="h-10 w-full sm:w-72" delayMs={120} />
        </div>
      )}

      {/* Table Header */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50 px-4 py-3.5 flex items-center gap-4">
        {selectable && <Skeleton shape="rect" className="size-4.5 shrink-0" />}
        <Skeleton shape="pill" className="h-3.5 w-36" delayMs={30} />
        {Array.from({ length: Math.max(1, columns - 1) }).map((_, colIdx) => (
          <Skeleton
            key={colIdx}
            shape="pill"
            delayMs={50 + colIdx * 35}
            className={cn(
              'h-3.5 hidden sm:block',
              colIdx === columns - 2 ? 'w-16 ml-auto' : 'w-24 flex-1 max-w-32'
            )}
          />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, rowIdx) => {
          const baseDelay = rowIdx * 70
          return (
            <div
              key={rowIdx}
              className="px-4 py-4 flex items-center gap-4"
            >
              {selectable && (
                <Skeleton
                  shape="rect"
                  delayMs={baseDelay}
                  className="size-4.5 shrink-0"
                />
              )}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton
                  shape="card"
                  delayMs={baseDelay + 30}
                  className="size-10 shrink-0 hidden sm:block"
                />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton
                    shape="pill"
                    delayMs={baseDelay + 45}
                    className={cn(
                      'h-4',
                      rowIdx % 2 === 0 ? 'w-4/5 max-w-xs' : 'w-3/5 max-w-[14rem]'
                    )}
                  />
                  <Skeleton
                    shape="pill"
                    delayMs={baseDelay + 75}
                    className="h-3 w-32"
                  />
                </div>
              </div>

              {columns > 2 && (
                <Skeleton
                  shape="pill"
                  delayMs={baseDelay + 90}
                  className="h-6 w-20 hidden md:block shrink-0"
                />
              )}

              {columns > 3 && (
                <Skeleton
                  shape="pill"
                  delayMs={baseDelay + 110}
                  className="h-4 w-16 hidden lg:block shrink-0"
                />
              )}

              <Skeleton
                shape="rounded"
                delayMs={baseDelay + 130}
                className="h-8 w-20 shrink-0"
              />
            </div>
          )
        })}
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Skeleton shape="pill" className="h-3.5 w-44" delayMs={120} />
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton
              key={idx}
              shape="circle"
              delayMs={150 + idx * 35}
              className="size-8"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function DataTablePageSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat halaman daftar data"
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full"
    >
      <span className="sr-only">Memuat halaman data...</span>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Skeleton shape="card" className="size-12 shrink-0" />
          <div className="space-y-2">
            <Skeleton shape="pill" className="h-6 w-48 sm:w-60" delayMs={40} />
            <Skeleton shape="pill" className="h-3.5 w-64 sm:w-80" delayMs={70} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton shape="rounded" className="h-10 w-32" delayMs={90} />
        </div>
      </div>

      <DataTableSkeleton rows={rows} columns={columns} />
    </div>
  )
}

export function DashboardOverviewSkeleton() {
  const barHeights = ['h-28', 'h-20', 'h-24', 'h-16', 'h-32', 'h-14', 'h-18']

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat ringkasan dashboard"
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full"
    >
      <span className="sr-only">Memuat dashboard overview...</span>

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <Skeleton shape="pill" className="h-7 w-52 sm:w-64" />
        <Skeleton shape="pill" delayMs={50} className="h-4 w-full max-w-lg" />
      </div>

      {/* Top Grid: Time Tracked + Project Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Time Tracked Card Skeleton */}
        <div className="min-w-0 lg:col-span-7 xl:col-span-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton shape="card" className="size-12 shrink-0" />
              <div className="space-y-2">
                <Skeleton shape="pill" delayMs={30} className="h-5 w-32" />
                <Skeleton shape="pill" delayMs={60} className="h-3.5 w-44" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton shape="rounded" delayMs={80} className="h-8 w-24" />
              <Skeleton shape="rounded" delayMs={100} className="h-8 w-24" />
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <Skeleton shape="rounded" delayMs={60} className="h-9 w-36" />
            <Skeleton shape="pill" delayMs={90} className="h-4 w-28" />
          </div>

          <div className="pt-4">
            <div className="grid grid-cols-7 gap-2 sm:gap-6 items-end h-44 px-2 sm:px-6 pb-2">
              {barHeights.map((heightClass, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2.5 w-full">
                  <Skeleton
                    shape="rounded"
                    delayMs={idx * 55}
                    className={cn('w-6 sm:w-9', heightClass)}
                  />
                  <Skeleton shape="pill" delayMs={idx * 55 + 40} className="h-3 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Progress Card Skeleton */}
        <div className="min-w-0 lg:col-span-5 xl:col-span-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton shape="card" delayMs={40} className="size-12 shrink-0" />
                <div className="space-y-2">
                  <Skeleton shape="pill" delayMs={70} className="h-5 w-32" />
                  <Skeleton shape="pill" delayMs={95} className="h-3.5 w-36" />
                </div>
              </div>
              <Skeleton shape="rounded" delayMs={110} className="h-8 w-32" />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Skeleton shape="rounded" delayMs={120} className="h-7 flex-1" />
              <Skeleton shape="pill" delayMs={140} className="h-4 w-20 shrink-0" />
            </div>

            <div className="flex flex-col gap-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Skeleton shape="circle" delayMs={140 + idx * 45} className="size-4" />
                    <Skeleton shape="pill" delayMs={160 + idx * 45} className="h-3.5 w-28" />
                  </div>
                  <Skeleton shape="pill" delayMs={180 + idx * 45} className="h-3.5 w-16" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <Skeleton shape="pill" delayMs={200} className="h-3.5 w-32" />
            <Skeleton shape="circle" delayMs={220} className="size-4" />
          </div>
        </div>
      </div>

      {/* Bottom Grid: KPI Performance + Task Overview + Work Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* KPI Performance Card Skeleton */}
        <div className="min-w-0 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton shape="card" delayMs={60} className="size-12 shrink-0" />
              <div className="space-y-2">
                <Skeleton shape="pill" delayMs={85} className="h-5 w-32" />
                <Skeleton shape="pill" delayMs={110} className="h-3.5 w-28" />
              </div>
            </div>
            <Skeleton shape="rounded" delayMs={130} className="h-8 w-20" />
          </div>
          <Skeleton shape="card" delayMs={150} className="h-32 w-full" />
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <Skeleton shape="pill" delayMs={170} className="h-4 w-24" />
            <Skeleton shape="pill" delayMs={190} className="h-3.5 w-20" />
          </div>
        </div>

        {/* Task Overview Card Skeleton */}
        <div className="min-w-0 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton shape="card" delayMs={90} className="size-12 shrink-0" />
            <div className="space-y-2">
              <Skeleton shape="pill" delayMs={115} className="h-5 w-32" />
              <Skeleton shape="pill" delayMs={140} className="h-3.5 w-36" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton shape="rounded" delayMs={155} className="h-8 w-28" />
            <Skeleton shape="pill" delayMs={175} className="h-3.5 w-full" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Skeleton shape="rounded" delayMs={190} className="h-10 w-full" />
              <Skeleton shape="rounded" delayMs={215} className="h-10 w-full" />
              <Skeleton shape="rounded" delayMs={240} className="h-10 w-full" />
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <Skeleton shape="pill" delayMs={255} className="h-3.5 w-28" />
            <Skeleton shape="circle" delayMs={270} className="size-4" />
          </div>
        </div>

        {/* Work Activity Card Skeleton */}
        <div className="min-w-0 md:col-span-2 lg:col-span-1 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton shape="card" delayMs={120} className="size-12 shrink-0" />
              <div className="space-y-2">
                <Skeleton shape="pill" delayMs={145} className="h-5 w-28" />
                <Skeleton shape="pill" delayMs={170} className="h-3.5 w-36" />
              </div>
            </div>
            <Skeleton shape="rounded" delayMs={185} className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-2 items-center gap-4 pt-1">
            <div className="space-y-3">
              <Skeleton shape="pill" delayMs={200} className="h-4 w-20" />
              <Skeleton shape="pill" delayMs={225} className="h-4 w-24" />
              <Skeleton shape="pill" delayMs={250} className="h-4 w-16" />
            </div>
            <div className="flex justify-center">
              <Skeleton shape="circle" delayMs={220} className="size-28 sm:size-32" />
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <Skeleton shape="pill" delayMs={270} className="h-3.5 w-32" />
            <Skeleton shape="circle" delayMs={285} className="size-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationsSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat notifikasi"
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full"
    >
      <span className="sr-only">Memuat daftar notifikasi...</span>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Skeleton shape="card" className="size-12 shrink-0" />
          <div className="space-y-2">
            <Skeleton shape="pill" delayMs={30} className="h-6 w-44" />
            <Skeleton shape="pill" delayMs={60} className="h-3.5 w-64 sm:w-80" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton shape="rounded" delayMs={80} className="h-10 w-36" />
          <Skeleton shape="rounded" delayMs={105} className="h-10 w-28" />
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <Skeleton shape="card" className="h-10 w-64" />
          <Skeleton shape="rounded" delayMs={50} className="h-10 w-full sm:w-72" />
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {Array.from({ length: items }).map((_, idx) => {
            const delay = idx * 65
            return (
              <div
                key={idx}
                className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <Skeleton shape="rounded" delayMs={delay} className="size-11 shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Skeleton
                        shape="pill"
                        delayMs={delay + 25}
                        className="h-4 w-48 sm:w-64"
                      />
                      <Skeleton shape="pill" delayMs={delay + 45} className="h-5 w-16" />
                    </div>
                    <Skeleton shape="pill" delayMs={delay + 65} className="h-3.5 w-full max-w-xl" />
                    <Skeleton shape="pill" delayMs={delay + 85} className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 pl-14 sm:pl-0">
                  <Skeleton shape="rounded" delayMs={delay + 95} className="h-9 w-20" />
                  <Skeleton shape="rounded" delayMs={delay + 115} className="size-9" />
                  <Skeleton shape="rounded" delayMs={delay + 135} className="size-9" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function MediaGridPageSkeleton({ items = 8 }: { items?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat galeri media"
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full"
    >
      <span className="sr-only">Memuat galeri media...</span>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton shape="pill" className="h-7 w-44" />
          <Skeleton shape="pill" delayMs={40} className="h-4 w-64" />
        </div>
        <Skeleton shape="rounded" delayMs={70} className="h-10 w-36" />
      </div>

      <Skeleton shape="card" delayMs={80} className="h-44 w-full" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: items }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-3"
          >
            <Skeleton
              shape="rounded"
              delayMs={idx * 55}
              className="w-full aspect-[4/3]"
            />
            <Skeleton shape="pill" delayMs={idx * 55 + 35} className="h-4 w-3/4" />
            <Skeleton shape="pill" delayMs={idx * 55 + 60} className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FormPageSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat formulir halaman"
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full"
    >
      <span className="sr-only">Memuat formulir...</span>
      <div className="flex flex-col gap-2">
        <Skeleton shape="pill" className="h-7 w-56" />
        <Skeleton shape="pill" delayMs={40} className="h-4 w-72 max-w-full" />
      </div>

      <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Array.from({ length: fields }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Skeleton shape="pill" delayMs={idx * 50} className="h-3.5 w-28" />
              <Skeleton shape="rounded" delayMs={idx * 50 + 30} className="h-10 w-full" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Skeleton shape="pill" delayMs={160} className="h-3.5 w-24" />
          <Skeleton shape="card" delayMs={185} className="h-32 w-full" />
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
          <Skeleton shape="rounded" delayMs={210} className="h-10 w-24" />
          <Skeleton shape="rounded" delayMs={235} className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

export function AuthFormSkeleton({
  variant = 'login',
}: {
  variant?: 'login' | 'otp'
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat formulir autentikasi"
      className="w-full"
    >
      <span className="sr-only">Memuat formulir autentikasi...</span>

      <div className="flex flex-col items-center text-center mb-8 space-y-3">
        <Skeleton shape="card" className="size-12 mb-2" />
        <Skeleton shape="pill" delayMs={40} className="h-7 w-52" />
        <Skeleton shape="pill" delayMs={70} className="h-4 w-64" />
      </div>

      {variant === 'login' ? (
        <div className="space-y-4">
          <div className="space-y-2.5">
            <Skeleton shape="rounded" delayMs={90} className="h-11 w-full" />
            <Skeleton shape="rounded" delayMs={120} className="h-11 w-full" />
          </div>
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <Skeleton shape="pill" delayMs={140} className="h-3 w-8" />
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="space-y-2">
            <Skeleton shape="pill" delayMs={150} className="h-3.5 w-28" />
            <Skeleton shape="rounded" delayMs={175} className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton shape="pill" delayMs={200} className="h-3.5 w-24" />
            <Skeleton shape="rounded" delayMs={225} className="h-10 w-full" />
          </div>
          <Skeleton shape="rounded" delayMs={250} className="h-11 w-full mt-2" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-center gap-2.5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton
                key={idx}
                shape="rounded"
                delayMs={90 + idx * 35}
                className="h-12 w-10 sm:w-11"
              />
            ))}
          </div>
          <Skeleton shape="rounded" delayMs={240} className="h-11 w-full" />
          <div className="flex justify-center">
            <Skeleton shape="pill" delayMs={270} className="h-4 w-36" />
          </div>
        </div>
      )}
    </div>
  )
}

export function PublicArticleSkeleton() {
  return (
    <article
      role="status"
      aria-busy="true"
      aria-label="Memuat artikel"
      className="py-8 max-w-prose space-y-6"
    >
      <span className="sr-only">Memuat konten artikel...</span>
      <Skeleton shape="pill" className="h-5 w-28" />
      <div className="space-y-3">
        <Skeleton shape="pill" delayMs={35} className="h-8 w-full" />
        <Skeleton shape="pill" delayMs={65} className="h-8 w-4/5" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" delayMs={90} className="size-10" />
        <div className="space-y-2">
          <Skeleton shape="pill" delayMs={110} className="h-3.5 w-32" />
          <Skeleton shape="pill" delayMs={135} className="h-3 w-24" />
        </div>
      </div>
      <Skeleton shape="card" delayMs={150} className="h-56 sm:h-72 w-full rounded-3xl" />
      <SkeletonText lines={5} delayMs={180} />
    </article>
  )
}

export function PublicListSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat daftar konten"
      className="py-8 space-y-8"
    >
      <span className="sr-only">Memuat daftar artikel...</span>
      <div className="space-y-3">
        <Skeleton shape="pill" className="h-8 w-56" />
        <Skeleton shape="pill" delayMs={40} className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: cards }).map((_, idx) => {
          const delay = idx * 65
          return (
            <div
              key={idx}
              className="rounded-3xl border border-border bg-card p-4 space-y-4"
            >
              <Skeleton
                shape="card"
                delayMs={delay}
                className="w-full aspect-[16/10]"
              />
              <Skeleton shape="pill" delayMs={delay + 30} className="h-5 w-20" />
              <div className="space-y-2">
                <Skeleton shape="pill" delayMs={delay + 55} className="h-5 w-full" />
                <Skeleton shape="pill" delayMs={delay + 80} className="h-5 w-3/4" />
              </div>
              <SkeletonText lines={2} delayMs={delay + 100} />
              <div className="pt-2 border-t border-border/70 flex items-center gap-2.5">
                <Skeleton shape="circle" delayMs={delay + 130} className="size-8" />
                <Skeleton shape="pill" delayMs={delay + 150} className="h-3.5 w-28" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
