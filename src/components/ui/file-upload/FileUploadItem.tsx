'use client'

import * as React from 'react'
import { useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import {
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  Loader2,
  MousePointerClick,
  RotateCcw,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT, getStaggerDelay } from '@/lib/motion'
import {
  FileUploadPreview,
  formatFileSize,
  getFileExtension,
  type FileUploadEntry,
} from '@/components/ui/file-upload/FileUploadPreview'

export interface FileUploadItemProps {
  entry: FileUploadEntry
  index?: number
  layout?: 'list' | 'grid'
  onRemove?: (id: string) => void
  onRetry?: (id: string) => void
  disabled?: boolean
  showSourceBadge?: boolean
  enableLightbox?: boolean
  className?: string
  ref?: React.Ref<HTMLLIElement>
}

function SourceBadge({ source }: { source: FileUploadEntry['source'] }) {
  if (source === 'paste') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold leading-none whitespace-nowrap">
        <ClipboardPaste className="size-3.5" aria-hidden="true" />
        <span>Tempel</span>
      </span>
    )
  }
  if (source === 'drop') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium leading-none whitespace-nowrap">
        <MousePointerClick className="size-3.5" aria-hidden="true" />
        <span>Drag &amp; Drop</span>
      </span>
    )
  }
  return null
}

function StatusIndicator({ entry }: { entry: FileUploadEntry }) {
  const clampedProgress = Math.max(0, Math.min(100, entry.progress ?? 0))

  if (entry.status === 'uploading') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200 tabular-nums whitespace-nowrap">
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        <span>{Math.round(clampedProgress)}%</span>
      </span>
    )
  }
  if (entry.status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <span>Selesai</span>
      </span>
    )
  }
  if (entry.status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
        <AlertCircle className="size-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
        <span>Gagal</span>
      </span>
    )
  }
  return null
}

export function FileUploadItem({
  entry,
  index = 0,
  layout = 'list',
  onRemove,
  onRetry,
  disabled = false,
  showSourceBadge = true,
  enableLightbox = true,
  className,
  ref,
}: FileUploadItemProps) {
  const prefersReducedMotion = useReducedMotion()
  const ext = getFileExtension(entry.name)
  const clampedProgress = Math.max(0, Math.min(100, entry.progress ?? 0))
  const isError = entry.status === 'error'
  const isUploading = entry.status === 'uploading'

  const motionProps = {
    initial: prefersReducedMotion ? false : { opacity: 0, scale: 0.97, y: 6 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: prefersReducedMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          scale: 0.97,
          transition: { duration: 0.16, ease: EASE_EXIT },
        },
    transition: {
      duration: 0.24,
      delay: getStaggerDelay(index, 0.03, 10),
      ease: EASE_ENTER,
    },
  }

  if (layout === 'grid') {
    return (
      <m.li
        ref={ref}
        {...motionProps}
        className={cn(
          'relative flex flex-col rounded-2xl border bg-white dark:bg-zinc-900 p-2.5 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isError
            ? 'border-rose-300 dark:border-rose-500/60 bg-rose-50/30 dark:bg-rose-950/25'
            : 'border-zinc-200/80 dark:border-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-700',
          className
        )}
      >
        <div className="relative">
          <FileUploadPreview
            entry={entry}
            size="tile"
            enableLightbox={enableLightbox}
          />

          {showSourceBadge && entry.source && entry.source !== 'picker' && (
            <div className="absolute top-2 left-2 pointer-events-none">
              <SourceBadge source={entry.source} />
            </div>
          )}

          {onRemove && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRemove(entry.id)}
              aria-label={`Hapus ${entry.name}`}
              className="absolute top-2 right-2 size-9 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-200 ring-1 ring-black/10 dark:ring-white/15 shadow-xs [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white [@media(hover:hover)_and_(pointer:fine)]:hover:text-white dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 flex items-center justify-center transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/30 dark:focus-visible:ring-white/30"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="pt-2.5 px-1 pb-0.5 flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <p
              className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 truncate"
              title={entry.name}
            >
              {entry.name}
            </p>
            <StatusIndicator entry={entry} />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
            <span>
              {formatFileSize(entry.size)}
              {ext ? ` • ${ext}` : ''}
            </span>
            {isError && onRetry && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRetry(entry.id)}
                className="inline-flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white cursor-pointer disabled:opacity-40"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                <span>Coba lagi</span>
              </button>
            )}
          </div>

          {isUploading && (
            <div
              role="progressbar"
              aria-label={`Progres unggah ${entry.name}`}
              aria-valuenow={Math.round(clampedProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-1 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden"
            >
              <div
                className="h-full w-full bg-black dark:bg-white origin-left transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                style={{ transform: `scaleX(${clampedProgress / 100})` }}
              />
            </div>
          )}

          {isError && entry.error && (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400 leading-snug line-clamp-2">
              {entry.error}
            </p>
          )}
        </div>
      </m.li>
    )
  }

  return (
    <m.li
      ref={ref}
      {...motionProps}
      className={cn(
        'flex items-center gap-3 rounded-2xl border bg-white dark:bg-zinc-900 p-3 transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        isError
          ? 'border-rose-300 dark:border-rose-500/60 bg-rose-50/30 dark:bg-rose-950/25'
          : 'border-zinc-200/80 dark:border-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-700 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-50/40 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800/40',
        className
      )}
    >
      <FileUploadPreview
        entry={entry}
        size="md"
        enableLightbox={enableLightbox}
      />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <p
            className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 truncate max-w-full"
            title={entry.name}
          >
            {entry.name}
          </p>
          {showSourceBadge && <SourceBadge source={entry.source} />}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
          <span>{formatFileSize(entry.size)}</span>
          {ext && (
            <>
              <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">
                •
              </span>
              <span className="font-medium text-zinc-600 dark:text-zinc-300">{ext}</span>
            </>
          )}
          <StatusIndicator entry={entry} />
        </div>

        {isUploading && (
          <div
            role="progressbar"
            aria-label={`Progres unggah ${entry.name}`}
            aria-valuenow={Math.round(clampedProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden"
          >
            <div
              className="h-full w-full bg-black dark:bg-white origin-left transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${clampedProgress / 100})` }}
            />
          </div>
        )}

        {isError && entry.error && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400 leading-snug">
            {entry.error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isError && onRetry && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRetry(entry.id)}
            aria-label={`Coba unggah ulang ${entry.name}`}
            className="size-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white flex items-center justify-center transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemove(entry.id)}
            aria-label={`Hapus ${entry.name}`}
            className="size-9 rounded-xl text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white flex items-center justify-center transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </m.li>
  )
}
