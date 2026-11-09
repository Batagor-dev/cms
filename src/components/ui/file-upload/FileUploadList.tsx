'use client'

import * as React from 'react'
import { AnimatePresence } from 'motion/react'
import { LayoutGrid, List, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatFileSize,
  type FileUploadEntry,
} from '@/components/ui/file-upload/FileUploadPreview'
import { FileUploadItem } from '@/components/ui/file-upload/FileUploadItem'

export interface FileUploadListProps {
  files: FileUploadEntry[]
  layout?: 'list' | 'grid'
  onLayoutChange?: (layout: 'list' | 'grid') => void
  allowLayoutToggle?: boolean
  onRemove?: (id: string) => void
  onRetry?: (id: string) => void
  onClearAll?: () => void
  disabled?: boolean
  showSummary?: boolean
  showSourceBadge?: boolean
  enableLightbox?: boolean
  emptyState?: React.ReactNode
  className?: string
  ref?: React.Ref<HTMLDivElement>
}

export function FileUploadList({
  files,
  layout = 'list',
  onLayoutChange,
  allowLayoutToggle = false,
  onRemove,
  onRetry,
  onClearAll,
  disabled = false,
  showSummary = true,
  showSourceBadge = true,
  enableLightbox = true,
  emptyState = null,
  className,
  ref,
}: FileUploadListProps) {
  const [internalLayout, setInternalLayout] = React.useState<'list' | 'grid'>(layout)
  const activeLayout = onLayoutChange ? layout : internalLayout

  const setLayout = (next: 'list' | 'grid') => {
    if (onLayoutChange) {
      onLayoutChange(next)
    } else {
      setInternalLayout(next)
    }
  }

  if (files.length === 0) {
    return emptyState ? <>{emptyState}</> : null
  }

  const totalBytes = files.reduce((sum, entry) => sum + (entry.size || 0), 0)
  const uploadingCount = files.filter((entry) => entry.status === 'uploading').length
  const errorCount = files.filter((entry) => entry.status === 'error').length

  return (
    <div ref={ref} className={cn('w-full space-y-2.5', className)}>
      {showSummary && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 tabular-nums">
            <span className="px-2 py-0.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold leading-tight">
              {files.length} file
            </span>
            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              Total {formatFileSize(totalBytes)}
            </span>
            {uploadingCount > 0 && (
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                • Mengunggah {uploadingCount} file
              </span>
            )}
            {errorCount > 0 && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                • {errorCount} gagal
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {allowLayoutToggle && (
              <div
                role="group"
                aria-label="Tampilan daftar file"
                className="inline-flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700"
              >
                <button
                  type="button"
                  onClick={() => setLayout('list')}
                  aria-pressed={activeLayout === 'list'}
                  aria-label="Tampilan daftar"
                  className={cn(
                    'size-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer',
                    activeLayout === 'list'
                      ? 'bg-white dark:bg-zinc-950 text-black dark:text-white shadow-2xs'
                      : 'text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white'
                  )}
                >
                  <List className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('grid')}
                  aria-pressed={activeLayout === 'grid'}
                  aria-label="Tampilan galeri"
                  className={cn(
                    'size-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer',
                    activeLayout === 'grid'
                      ? 'bg-white dark:bg-zinc-950 text-black dark:text-white shadow-2xs'
                      : 'text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white'
                  )}
                >
                  <LayoutGrid className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {onClearAll && (
              <button
                type="button"
                disabled={disabled}
                onClick={onClearAll}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span>Kosongkan</span>
              </button>
            )}
          </div>
        </div>
      )}

      <ul
        aria-label="Daftar file terpilih"
        className={cn(
          activeLayout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
            : 'flex flex-col gap-2.5'
        )}
      >
        <AnimatePresence initial={false}>
          {files.map((entry, idx) => (
            <FileUploadItem
              key={entry.id}
              entry={entry}
              index={idx}
              layout={activeLayout}
              onRemove={onRemove}
              onRetry={onRetry}
              disabled={disabled}
              showSourceBadge={showSourceBadge}
              enableLightbox={enableLightbox}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

