'use client'

import * as React from 'react'
import {
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Film,
  Image as ImageIcon,
  Maximize2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type FileUploadSource = 'picker' | 'drop' | 'paste'
export type FileUploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface FileUploadEntry {
  id: string
  file?: File
  name: string
  size: number
  type: string
  previewUrl?: string
  status: FileUploadStatus
  progress?: number
  error?: string
  source?: FileUploadSource
}

export type FileCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'spreadsheet'
  | 'code'
  | 'archive'
  | 'document'
  | 'other'

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'avif',
  'bmp',
  'svg',
  'ico',
])
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'])
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'])
const SPREADSHEET_EXTENSIONS = new Set(['csv', 'xls', 'xlsx', 'ods'])
const ARCHIVE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'tar', 'gz'])
const CODE_EXTENSIONS = new Set([
  'json',
  'js',
  'ts',
  'tsx',
  'jsx',
  'html',
  'css',
  'md',
  'xml',
  'yaml',
  'yml',
])
const DOCUMENT_EXTENSIONS = new Set(['doc', 'docx', 'txt', 'rtf', 'odt', 'ppt', 'pptx'])

const SIZE_FORMATTER = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 1,
})

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  const value = bytes / 1024 ** exponent
  return `${exponent === 0 ? Math.round(value) : SIZE_FORMATTER.format(value)} ${units[exponent]}`
}

export function getFileExtension(fileName: string): string {
  const trimmed = fileName.trim()
  const dotIdx = trimmed.lastIndexOf('.')
  if (dotIdx <= 0 || dotIdx === trimmed.length - 1) return ''
  return trimmed.slice(dotIdx + 1, dotIdx + 7).toUpperCase()
}

export function isSafePreviewUrl(url?: string): url is string {
  if (!url) return false
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('blob:')) return true
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export function getFileCategory(mimeType: string, fileName: string): FileCategory {
  const mime = mimeType.toLowerCase()
  const ext = getFileExtension(fileName).toLowerCase()

  if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(ext)) return 'image'
  if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(ext)) return 'video'
  if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(ext)) return 'audio'
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime === 'text/csv' ||
    SPREADSHEET_EXTENSIONS.has(ext)
  ) {
    return 'spreadsheet'
  }
  if (
    mime.includes('zip') ||
    mime.includes('compressed') ||
    mime.includes('archive') ||
    ARCHIVE_EXTENSIONS.has(ext)
  ) {
    return 'archive'
  }
  if (
    mime.includes('json') ||
    mime.includes('javascript') ||
    mime.includes('typescript') ||
    mime === 'text/html' ||
    mime === 'text/css' ||
    CODE_EXTENSIONS.has(ext)
  ) {
    return 'code'
  }
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    mime === 'text/plain' ||
    DOCUMENT_EXTENSIONS.has(ext)
  ) {
    return 'document'
  }
  return 'other'
}

export function isPreviewableImage(mimeType: string, fileName: string): boolean {
  return getFileCategory(mimeType, fileName) === 'image'
}

function CategoryGlyph({
  category,
  className,
}: {
  category: FileCategory
  className?: string
}) {
  switch (category) {
    case 'image':
      return <ImageIcon className={className} aria-hidden="true" />
    case 'video':
      return <Film className={className} aria-hidden="true" />
    case 'audio':
      return <FileAudio className={className} aria-hidden="true" />
    case 'spreadsheet':
      return <FileSpreadsheet className={className} aria-hidden="true" />
    case 'archive':
      return <FileArchive className={className} aria-hidden="true" />
    case 'code':
      return <FileCode2 className={className} aria-hidden="true" />
    case 'pdf':
    case 'document':
      return <FileText className={className} aria-hidden="true" />
    default:
      return <FileIcon className={className} aria-hidden="true" />
  }
}

interface ImageCanvasProps {
  src: string
  name: string
  isTile: boolean
  onDimensions?: (dimensions: string) => void
  onFail: () => void
}

function ImageCanvas({
  src,
  name,
  isTile,
  onDimensions,
  onFail,
}: ImageCanvasProps) {
  const [loaded, setLoaded] = React.useState(false)

  return (
    // Uses native <img> because local blob:/ObjectURL previews are dynamically generated client-side
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Pratinjau ${name}`}
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        setLoaded(true)
        const { naturalWidth, naturalHeight } = e.currentTarget
        if (naturalWidth > 0 && naturalHeight > 0) {
          onDimensions?.(`${naturalWidth} × ${naturalHeight}`)
        }
      }}
      onError={() => onFail()}
      className={cn(
        'size-full object-cover select-none duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
        isTile
          ? 'scale-100 transition-[opacity,scale] [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.03] motion-reduce:scale-100'
          : 'transition-opacity',
        loaded ? 'opacity-100' : 'opacity-0'
      )}
    />
  )
}

export interface FileUploadPreviewProps {
  entry: Pick<FileUploadEntry, 'name' | 'size' | 'type' | 'previewUrl'>
  size?: 'sm' | 'md' | 'lg' | 'tile'
  enableLightbox?: boolean
  className?: string
  ref?: React.Ref<HTMLDivElement>
}

const SIZE_CLASSES: Record<NonNullable<FileUploadPreviewProps['size']>, string> = {
  sm: 'size-11 rounded-xl',
  md: 'size-14 rounded-xl',
  lg: 'size-16 rounded-2xl',
  tile: 'w-full aspect-4/3 rounded-xl',
}

export function FileUploadPreview({
  entry,
  size = 'md',
  enableLightbox = true,
  className,
  ref,
}: FileUploadPreviewProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null)
  const [dimensions, setDimensions] = React.useState<string | null>(null)

  const category = getFileCategory(entry.type, entry.name)
  const ext = getFileExtension(entry.name)
  const safeSrc = isSafePreviewUrl(entry.previewUrl) ? entry.previewUrl : undefined
  const canRenderImage =
    category === 'image' && Boolean(safeSrc) && failedSrc !== safeSrc

  const isTile = size === 'tile'
  const showInteractiveLightbox = canRenderImage && enableLightbox

  const openLightbox = () => {
    if (!showInteractiveLightbox) return
    dialogRef.current?.showModal()
  }

  const closeLightbox = () => {
    dialogRef.current?.close()
  }

  const iconContent = (
    <div className="size-full flex flex-col items-center justify-center gap-1 bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 p-1.5">
      <CategoryGlyph
        category={category}
        className={cn(
          isTile
            ? 'size-9 text-zinc-500 dark:text-zinc-400'
            : size === 'lg'
              ? 'size-6 text-zinc-600 dark:text-zinc-300'
              : 'size-5 text-zinc-600 dark:text-zinc-300'
        )}
      />
      {ext && (isTile || size === 'lg') && (
        <span className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-200 leading-none">
          {ext}
        </span>
      )}
    </div>
  )

  return (
    <div ref={ref} className={cn('relative shrink-0', SIZE_CLASSES[size], className)}>
      {showInteractiveLightbox && safeSrc ? (
        <>
          <button
            type="button"
            onClick={openLightbox}
            aria-label={`Perbesar pratinjau ${entry.name}`}
            className={cn(
              'relative size-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 group cursor-pointer block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/30 dark:focus-visible:ring-white/30',
              SIZE_CLASSES[size]
            )}
          >
            <ImageCanvas
              key={safeSrc}
              src={safeSrc}
              name={entry.name}
              isTile={isTile}
              onDimensions={setDimensions}
              onFail={() => setFailedSrc(safeSrc)}
            />
            <span
              aria-hidden="true"
              className={cn(
                'absolute flex items-center justify-center rounded-lg bg-black/75 text-white shadow-xs transition-opacity duration-150',
                isTile
                  ? 'bottom-2 right-2 size-8 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100'
                  : 'inset-0 opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 group-focus-visible:opacity-100'
              )}
            >
              <Maximize2 className={isTile ? 'size-4' : 'size-4.5'} />
            </span>
          </button>

          <dialog
            ref={dialogRef}
            aria-label={`Pratinjau ${entry.name}`}
            onClick={(e) => {
              if (e.target === dialogRef.current) {
                closeLightbox()
              }
            }}
            className="m-auto w-[min(92vw,48rem)] max-h-[90dvh] rounded-3xl bg-white dark:bg-zinc-900 p-0 text-zinc-950 dark:text-zinc-50 shadow-[0_24px_64px_-12px_rgba(9,9,11,0.32)] dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.72)] ring-1 ring-zinc-950/10 dark:ring-white/10 backdrop:bg-black/60 dark:backdrop:bg-black/80 open:flex open:flex-col overflow-hidden transition-[opacity,scale] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] starting:opacity-0 starting:scale-[0.96] motion-reduce:transition-opacity motion-reduce:starting:scale-100"
          >
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 truncate">
                  {entry.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums mt-0.5 truncate">
                  {formatFileSize(entry.size)}
                  {dimensions ? ` • ${dimensions} px` : ''}
                  {entry.type ? ` • ${entry.type}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Tutup pratinjau"
                className="size-9 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white [@media(hover:hover)_and_(pointer:fine)]:hover:text-white dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
              >
                <X className="size-4.5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 min-h-0 bg-zinc-100/80 dark:bg-zinc-950/90 p-3 sm:p-5 flex items-center justify-center overflow-auto">
              {/* Uses native <img> to display arbitrary client blob:/ObjectURL full-resolution previews */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={safeSrc}
                alt={entry.name}
                className="max-w-full max-h-[70dvh] rounded-xl object-contain shadow-xs bg-white dark:bg-zinc-900"
              />
            </div>
          </dialog>
        </>
      ) : canRenderImage && safeSrc ? (
        <div
          className={cn(
            'overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800',
            SIZE_CLASSES[size]
          )}
        >
          <ImageCanvas
            key={safeSrc}
            src={safeSrc}
            name={entry.name}
            isTile={isTile}
            onDimensions={setDimensions}
            onFail={() => setFailedSrc(safeSrc)}
          />
        </div>
      ) : (
        <div
          className={cn(
            'overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-800/80',
            SIZE_CLASSES[size]
          )}
        >
          {iconContent}
        </div>
      )}
    </div>
  )
}
