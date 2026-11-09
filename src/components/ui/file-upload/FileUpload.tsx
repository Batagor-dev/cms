'use client'

import * as React from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import {
  AlertCircle,
  ClipboardPaste,
  MousePointerClick,
  UploadCloud,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import {
  formatFileSize,
  isPreviewableImage,
  type FileUploadEntry,
  type FileUploadSource,
} from '@/components/ui/file-upload/FileUploadPreview'
import { FileUploadList } from '@/components/ui/file-upload/FileUploadList'

export type FileRejectionReason =
  | 'file-invalid-type'
  | 'file-too-large'
  | 'too-many-files'
  | 'duplicate-file'
  | 'clipboard-empty'

export interface FileRejection {
  id: string
  file?: File
  fileName: string
  reason: FileRejectionReason
  message: string
}

export interface FileUploadHelpers {
  setProgress: (percent: number) => void
}

export interface FileUploadState {
  files: FileUploadEntry[]
  isDragActive: boolean
  isReadingClipboard: boolean
  isPasteTargetActive: boolean
  disabled: boolean
  multiple: boolean
  accept?: string
  maxSize?: number
  maxFiles?: number
  rejections: FileRejection[]
}

export interface FileUploadActions {
  addFiles: (files: FileList | File[], source?: FileUploadSource) => void
  removeFile: (id: string) => void
  retryFile: (id: string) => void
  clearFiles: () => void
  openPicker: () => void
  pasteFromClipboard: () => Promise<void>
  dismissRejections: () => void
}

export interface FileUploadMeta {
  inputId: string
  descriptionId: string
  name?: string
  acceptHint: string
  maxSizeHint?: string
  wrapperRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>
}

export interface FileUploadContextValue {
  state: FileUploadState
  actions: FileUploadActions
  meta: FileUploadMeta
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(null)

export function useFileUpload(): FileUploadContextValue {
  const ctx = React.use(FileUploadContext)
  if (!ctx) {
    throw new Error('useFileUpload must be used inside <FileUpload>')
  }
  return ctx
}

// -----------------------------------------------------------------------------
// Coordinator for multiple FileUpload instances sharing Ctrl+V / Cmd+V paste
// -----------------------------------------------------------------------------

interface PasteRegistryEntry {
  id: string
  hasGlobalPaste: boolean
  disabled: boolean
  isHovered: boolean
  isFocused: boolean
  lastTouchedAt: number
}

const pasteRegistry = new Map<string, PasteRegistryEntry>()
const processedPasteEvents = new WeakSet<Event>()
let pasteFileCounter = 0

function resolveWinningPasteTargetId(): string | null {
  const activeCandidates: PasteRegistryEntry[] = []
  for (const entry of pasteRegistry.values()) {
    if (entry.hasGlobalPaste && !entry.disabled) {
      activeCandidates.push(entry)
    }
  }
  if (activeCandidates.length === 0) return null

  const focused = activeCandidates.find((c) => c.isFocused)
  if (focused) return focused.id

  const hovered = activeCandidates.find((c) => c.isHovered)
  if (hovered) return hovered.id

  let latestTouched: PasteRegistryEntry | null = null
  for (const candidate of activeCandidates) {
    if (
      !latestTouched ||
      candidate.lastTouchedAt > latestTouched.lastTouchedAt
    ) {
      latestTouched = candidate
    }
  }
  return latestTouched?.id ?? null
}

function isExternalEditableTarget(
  target: EventTarget | null,
  wrapperEl: HTMLDivElement | null
): boolean {
  const element =
    target instanceof Element
      ? target
      : typeof document !== 'undefined' && document.activeElement instanceof Element
        ? document.activeElement
        : null

  if (!element) return false
  if (wrapperEl && wrapperEl.contains(element)) return false

  if (
    element.closest(
      'textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]'
    )
  ) {
    return true
  }

  const inputEl = element.closest('input')
  if (inputEl instanceof HTMLInputElement) {
    const nonTextTypes = new Set([
      'button',
      'checkbox',
      'file',
      'radio',
      'reset',
      'submit',
    ])
    return !nonTextTypes.has(inputEl.type.toLowerCase())
  }

  return false
}

// -----------------------------------------------------------------------------
// File Validation & Normalization Utilities
// -----------------------------------------------------------------------------

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
}

function createEntryId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeClipboardFile(file: File): File {
  const trimmedName = file.name.trim()
  const isGenericPastedImage =
    !trimmedName ||
    trimmedName === 'image' ||
    trimmedName === 'blob' ||
    /^(image|blob|pasted-image)\.(png|jpe?g|webp|gif|bmp)$/i.test(trimmedName)

  if (!isGenericPastedImage) {
    return file
  }

  pasteFileCounter += 1
  const mime = (file.type || 'image/png').toLowerCase()
  const extFromMime =
    MIME_TO_EXTENSION[mime] ??
    (mime.includes('/') ? mime.split('/')[1].replace(/[^a-z0-9]/gi, '') : 'png')
  const ext = extFromMime || 'png'
  const newName = `clipboard-${pasteFileCounter}.${ext}`

  return new File([file], newName, {
    type: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    lastModified: file.lastModified || Date.now(),
  })
}

function extractFilesFromClipboardData(clipboardData: DataTransfer | null): File[] {
  if (!clipboardData) return []

  const extracted: File[] = []
  const items = clipboardData.items ? Array.from(clipboardData.items) : []
  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        extracted.push(normalizeClipboardFile(file))
      }
    }
  }

  if (extracted.length > 0) {
    return extracted
  }

  return Array.from(clipboardData.files ?? []).map(normalizeClipboardFile)
}

function hasDraggedFiles(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer?.types) return false
  const types = Array.from(dataTransfer.types)
  return types.includes('Files') || types.includes('application/x-moz-file')
}

function matchesAcceptRule(file: File, accept?: string): boolean {
  if (!accept || !accept.trim()) return true
  const tokens = accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  if (tokens.length === 0 || tokens.includes('*') || tokens.includes('*/*')) {
    return true
  }

  const fileName = file.name.toLowerCase()
  const rawMime = file.type.toLowerCase()
  const normalizedMime = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime

  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return fileName.endsWith(token)
    }
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, -1) // e.g. 'image/'
      if (normalizedMime.startsWith(prefix)) return true
      if (prefix === 'image/' && isPreviewableImage(rawMime, fileName)) {
        return true
      }
      return false
    }
    const normalizedToken = token === 'image/jpg' ? 'image/jpeg' : token
    if (normalizedMime === normalizedToken) return true
    if (normalizedToken === 'application/pdf' && fileName.endsWith('.pdf')) {
      return true
    }
    return false
  })
}

function formatAcceptHint(accept?: string): string {
  if (!accept || !accept.trim()) {
    return 'Semua format file didukung'
  }
  const tokens = accept
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const readable = tokens.map((token) => {
    const lower = token.toLowerCase()
    if (lower === 'image/*') return 'Gambar (PNG, JPG, WebP)'
    if (lower === 'video/*') return 'Video'
    if (lower === 'audio/*') return 'Audio'
    if (lower === 'application/pdf' || lower === '.pdf') return 'PDF'
    if (lower.startsWith('.')) return lower.slice(1).toUpperCase()
    if (lower.startsWith('image/')) return lower.slice(6).toUpperCase()
    return token
  })

  return Array.from(new Set(readable)).join(', ')
}

function getFileSignature(file: File): string {
  return `${file.name}::${file.size}::${file.lastModified}`
}

// -----------------------------------------------------------------------------
// Dropzone Component (Reusable Standalone or Inside <FileUpload>)
// -----------------------------------------------------------------------------

export interface FileUploadDropzoneProps {
  title?: string
  description?: string
  variant?: 'default' | 'compact'
  isError?: boolean
  showPasteButton?: boolean
  className?: string
  ref?: React.Ref<HTMLDivElement>
}

export function FileUploadDropzone({
  title,
  description,
  variant = 'default',
  isError = false,
  showPasteButton = true,
  className,
  ref,
}: FileUploadDropzoneProps) {
  const {
    state: {
      isDragActive,
      isReadingClipboard,
      isPasteTargetActive,
      disabled,
      multiple,
      accept,
      maxFiles,
    },
    actions: { openPicker, pasteFromClipboard, addFiles },
    meta: { inputId, descriptionId, name, acceptHint, maxSizeHint, inputRef },
  } = useFileUpload()

  const isCompact = variant === 'compact'
  const resolvedTitle =
    title ??
    (isDragActive
      ? 'Lepaskan file di sini'
      : multiple
        ? 'Unggah, seret, atau tempel file & gambar'
        : 'Unggah, seret, atau tempel file')

  const resolvedDescription =
    description ??
    [
      acceptHint,
      maxSizeHint ? `Maks. ${maxSizeHint}/file` : null,
      maxFiles && multiple ? `Hingga ${maxFiles} file` : null,
    ]
      .filter(Boolean)
      .join(' • ')

  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl sm:rounded-3xl border-2 border-dashed bg-zinc-50/60 dark:bg-zinc-900/50 transition-[border-color,background-color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
        'has-[>input:focus-visible]:ring-2 has-[>input:focus-visible]:ring-zinc-950/20 dark:has-[>input:focus-visible]:ring-white/25 has-[>input:focus-visible]:border-zinc-900 dark:has-[>input:focus-visible]:border-zinc-200',
        isCompact ? 'p-4 sm:p-5' : 'p-5 sm:p-7',
        disabled && 'opacity-55 cursor-not-allowed bg-zinc-100/70 dark:bg-zinc-900/80',
        isError
          ? 'border-destructive/70 bg-rose-50/40 dark:border-rose-500/60 dark:bg-rose-950/25'
          : isDragActive
            ? 'border-black dark:border-white bg-zinc-100/90 dark:bg-zinc-800/80 shadow-sm scale-[0.995] motion-reduce:scale-100'
            : 'border-zinc-200/90 dark:border-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-400 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-600 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-50 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-900/80',
        className
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-describedby={descriptionId}
        aria-invalid={isError ? 'true' : undefined}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files, 'picker')
          }
          e.target.value = ''
        }}
        className="sr-only peer"
      />

      {isCompact ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label
            htmlFor={inputId}
            className={cn(
              'flex items-center gap-3 min-w-0 flex-1',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'size-11 rounded-xl border flex items-center justify-center shrink-0 transition-[background-color,color,border-color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
                isDragActive
                  ? 'bg-black dark:bg-white text-white dark:text-zinc-950 border-black dark:border-white scale-105 motion-reduce:scale-100'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200/90 dark:border-zinc-800 shadow-2xs'
              )}
            >
              <UploadCloud className="size-5" />
            </span>

            <span className="min-w-0 flex-1 block">
              <span className="block text-sm font-semibold text-zinc-950 dark:text-zinc-50 truncate">
                {resolvedTitle}
              </span>
              <span
                id={descriptionId}
                className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate"
              >
                {resolvedDescription}
              </span>
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={openPicker}
              className="h-8 px-3 rounded-xl bg-black dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-black dark:hover:bg-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
            >
              Pilih File
            </Button>
            {showPasteButton && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                isLoading={isReadingClipboard}
                loadingText="Menempel..."
                leftIcon={<ClipboardPaste className="size-4" aria-hidden="true" />}
                onClick={() => void pasteFromClipboard()}
                className="h-8 px-3 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-medium hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
              >
                Tempel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <label
            htmlFor={inputId}
            className={cn(
              'w-full flex flex-col items-center text-center',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'size-14 rounded-2xl border flex items-center justify-center mb-3 transition-[background-color,color,border-color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
                isDragActive
                  ? 'bg-black dark:bg-white text-white dark:text-zinc-950 border-black dark:border-white scale-105 shadow-xs motion-reduce:scale-100'
                  : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200/90 dark:border-zinc-800 shadow-2xs'
              )}
            >
              <UploadCloud className="size-7" />
            </span>

            <span className="text-base font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight">
              {resolvedTitle}
            </span>

            <span
              id={descriptionId}
              className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-prose leading-normal"
            >
              {resolvedDescription}
            </span>
          </label>

          {/* Action Buttons outside <label> so there are never nested interactive controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={openPicker}
              className="h-9 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-black dark:hover:bg-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
            >
              Pilih File
            </Button>

            {showPasteButton && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                isLoading={isReadingClipboard}
                loadingText="Membaca clipboard..."
                leftIcon={<ClipboardPaste className="size-4" aria-hidden="true" />}
                onClick={() => void pasteFromClipboard()}
                className="h-9 px-3.5 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-medium hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
              >
                Tempel Gambar / File
              </Button>
            )}
          </div>

          {/* Drag & Clipboard Hints */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <MousePointerClick className="size-3.5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
              <span>Drag &amp; Drop</span>
            </span>

            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors duration-150',
                isPasteTargetActive
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white font-medium'
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800'
              )}
            >
              <kbd className="font-sans font-semibold">Ctrl+V</kbd>
              <span>/ Cmd+V Otomatis</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Main FileUpload Component (Dropzone + Clipboard Auto-Ingest + File List)
// -----------------------------------------------------------------------------

export interface FileUploadProps {
  id?: string
  name?: string
  value?: FileUploadEntry[]
  defaultValue?: FileUploadEntry[]
  onValueChange?: (files: FileUploadEntry[]) => void
  onFilesAdded?: (added: FileUploadEntry[], allFiles: FileUploadEntry[]) => void
  onUpload?: (
    entry: FileUploadEntry,
    helpers: FileUploadHelpers
  ) => Promise<void> | void
  onReject?: (rejections: FileRejection[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  allowDuplicates?: boolean
  disabled?: boolean
  isError?: boolean
  enableGlobalPaste?: boolean
  variant?: 'default' | 'compact'
  listLayout?: 'list' | 'grid'
  allowLayoutToggle?: boolean
  showPasteButton?: boolean
  showSourceBadge?: boolean
  enableLightbox?: boolean
  title?: string
  description?: string
  className?: string
  dropzoneClassName?: string
  children?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

export function FileUpload({
  id,
  name,
  value,
  defaultValue = [],
  onValueChange,
  onFilesAdded,
  onUpload,
  onReject,
  accept,
  multiple = true,
  maxFiles,
  maxSize,
  allowDuplicates = false,
  disabled = false,
  isError = false,
  enableGlobalPaste = true,
  variant = 'default',
  listLayout = 'list',
  allowLayoutToggle = false,
  showPasteButton = true,
  showSourceBadge = true,
  enableLightbox = true,
  title,
  description,
  className,
  dropzoneClassName,
  children,
  ref,
}: FileUploadProps) {
  const generatedId = React.useId()
  const prefersReducedMotion = useReducedMotion()
  const inputId = id ?? `file-upload-${generatedId}`
  const descriptionId = `${inputId}-description`

  const [internalFiles, setInternalFiles] =
    React.useState<FileUploadEntry[]>(defaultValue)
  const isControlled = value !== undefined
  const currentFiles = isControlled ? value : internalFiles

  const [isDragActive, setIsDragActive] = React.useState(false)
  const [isReadingClipboard, setIsReadingClipboard] = React.useState(false)
  const [isFocusedWithin, setIsFocusedWithin] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [rejections, setRejections] = React.useState<FileRejection[]>([])
  const [pasteFeedback, setPasteFeedback] = React.useState<string | null>(null)

  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const dragCounterRef = React.useRef(0)
  const filesRef = React.useRef<FileUploadEntry[]>(currentFiles)
  const trackedObjectUrlsRef = React.useRef<Set<string>>(new Set())
  const teardownTimerRef = React.useRef<number | null>(null)
  const feedbackTimerRef = React.useRef<number | null>(null)
  const isMountedRef = React.useRef(false)

  const callbacksRef = React.useRef({
    onValueChange,
    onFilesAdded,
    onUpload,
    onReject,
  })

  const setMergedWrapperRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref && typeof ref === 'object') {
        ref.current = node
      }
    },
    [ref]
  )

  React.useEffect(() => {
    filesRef.current = currentFiles
  }, [currentFiles])

  React.useEffect(() => {
    callbacksRef.current = {
      onValueChange,
      onFilesAdded,
      onUpload,
      onReject,
    }
  }, [onValueChange, onFilesAdded, onUpload, onReject])

  // Track mounted lifecycle & revoke generated blob URLs safely on unmount
  React.useEffect(() => {
    isMountedRef.current = true
    if (teardownTimerRef.current !== null) {
      window.clearTimeout(teardownTimerRef.current)
      teardownTimerRef.current = null
    }
    const urlSet = trackedObjectUrlsRef.current

    return () => {
      isMountedRef.current = false
      teardownTimerRef.current = window.setTimeout(() => {
        for (const url of urlSet) {
          URL.revokeObjectURL(url)
        }
        urlSet.clear()
      }, 0)
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current)
        feedbackTimerRef.current = null
      }
    }
  }, [])

  const revokeUrlIfTracked = React.useCallback((url?: string) => {
    if (!url) return
    if (trackedObjectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url)
      trackedObjectUrlsRef.current.delete(url)
    }
  }, [])

  const applyFilesUpdate = React.useCallback(
    (updater: (prev: FileUploadEntry[]) => FileUploadEntry[]) => {
      const next = updater(filesRef.current)
      filesRef.current = next
      if (!isControlled) {
        setInternalFiles(next)
      }
      callbacksRef.current.onValueChange?.(next)
      return next
    },
    [isControlled]
  )

  const triggerUploadForEntry = React.useCallback(
    (entry: FileUploadEntry) => {
      const uploader = callbacksRef.current.onUpload
      if (!uploader) return

      const setProgress = (percent: number) => {
        if (!isMountedRef.current) return
        const clamped = Math.max(0, Math.min(100, percent))
        applyFilesUpdate((prev) =>
          prev.map((item) =>
            item.id === entry.id
              ? { ...item, status: 'uploading', progress: clamped }
              : item
          )
        )
      }

      void Promise.resolve()
        .then(() => uploader(entry, { setProgress }))
        .then(() => {
          if (!isMountedRef.current) return
          applyFilesUpdate((prev) =>
            prev.map((item) =>
              item.id === entry.id
                ? { ...item, status: 'success', progress: 100, error: undefined }
                : item
            )
          )
        })
        .catch((err: unknown) => {
          if (!isMountedRef.current) return
          const errorMessage =
            err instanceof Error && err.message
              ? err.message
              : 'Gagal mengunggah file'
          applyFilesUpdate((prev) =>
            prev.map((item) =>
              item.id === entry.id
                ? { ...item, status: 'error', error: errorMessage }
                : item
            )
          )
        })
    },
    [applyFilesUpdate]
  )

  const showTemporaryPasteBanner = React.useCallback((message: string) => {
    setPasteFeedback(message)
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current)
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setPasteFeedback(null)
      feedbackTimerRef.current = null
    }, 2800)
  }, [])

  const addFiles = React.useCallback(
    (rawFiles: FileList | File[], source: FileUploadSource = 'picker') => {
      if (disabled) return
      const incoming = Array.from(rawFiles)
      if (incoming.length === 0) return

      const existing = filesRef.current
      const existingSignatures = new Set(
        existing
          .map((e) => (e.file ? getFileSignature(e.file) : ''))
          .filter(Boolean)
      )

      const nextRejections: FileRejection[] = []
      const acceptedFiles: File[] = []

      for (const file of incoming) {
        if (!matchesAcceptRule(file, accept)) {
          nextRejections.push({
            id: createEntryId(),
            file,
            fileName: file.name,
            reason: 'file-invalid-type',
            message: `Format "${file.name}" tidak sesuai ketentuan (${formatAcceptHint(accept)}).`,
          })
          continue
        }

        if (maxSize !== undefined && file.size > maxSize) {
          nextRejections.push({
            id: createEntryId(),
            file,
            fileName: file.name,
            reason: 'file-too-large',
            message: `"${file.name}" (${formatFileSize(file.size)}) melebihi batas ukuran ${formatFileSize(maxSize)}.`,
          })
          continue
        }

        const sig = getFileSignature(file)
        if (!allowDuplicates && existingSignatures.has(sig)) {
          nextRejections.push({
            id: createEntryId(),
            file,
            fileName: file.name,
            reason: 'duplicate-file',
            message: `"${file.name}" sudah ada di daftar file.`,
          })
          continue
        }

        if (!allowDuplicates) {
          existingSignatures.add(sig)
        }
        acceptedFiles.push(file)
      }

      let finalFilesToAdd = acceptedFiles
      if (!multiple && acceptedFiles.length > 1) {
        finalFilesToAdd = [acceptedFiles[0]]
        nextRejections.push({
          id: createEntryId(),
          fileName: acceptedFiles[1].name,
          reason: 'too-many-files',
          message: 'Mode single file hanya menerima 1 file sekaligus.',
        })
      } else if (multiple && maxFiles !== undefined) {
        const remaining = Math.max(0, maxFiles - existing.length)
        if (acceptedFiles.length > remaining) {
          finalFilesToAdd = acceptedFiles.slice(0, remaining)
          const overflowCount = acceptedFiles.length - finalFilesToAdd.length
          nextRejections.push({
            id: createEntryId(),
            fileName: acceptedFiles[remaining]?.name ?? 'File berlebih',
            reason: 'too-many-files',
            message: `Maksimal ${maxFiles} file diperbolehkan (${overflowCount} file dilewati).`,
          })
        }
      }

      if (finalFilesToAdd.length > 0) {
        const hasUploader = Boolean(callbacksRef.current.onUpload)
        const createdEntries: FileUploadEntry[] = finalFilesToAdd.map((file) => {
          let previewUrl: string | undefined
          if (isPreviewableImage(file.type, file.name)) {
            previewUrl = URL.createObjectURL(file)
            trackedObjectUrlsRef.current.add(previewUrl)
          }
          return {
            id: createEntryId(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl,
            status: hasUploader ? 'uploading' : 'idle',
            progress: hasUploader ? 0 : undefined,
            source,
          }
        })

        const updatedList = applyFilesUpdate((prev) => {
          if (!multiple) {
            for (const oldItem of prev) {
              revokeUrlIfTracked(oldItem.previewUrl)
            }
            return createdEntries
          }
          return [...prev, ...createdEntries]
        })

        callbacksRef.current.onFilesAdded?.(createdEntries, updatedList)

        for (const entry of createdEntries) {
          triggerUploadForEntry(entry)
        }

        if (source === 'paste') {
          showTemporaryPasteBanner(
            createdEntries.length === 1
              ? `"${createdEntries[0].name}" berhasil ditempel dari clipboard`
              : `${createdEntries.length} file berhasil ditempel dari clipboard`
          )
        }
      }

      if (nextRejections.length > 0) {
        setRejections(nextRejections)
        callbacksRef.current.onReject?.(nextRejections)
      } else {
        setRejections([])
      }
    },
    [
      disabled,
      accept,
      maxSize,
      allowDuplicates,
      multiple,
      maxFiles,
      applyFilesUpdate,
      revokeUrlIfTracked,
      triggerUploadForEntry,
      showTemporaryPasteBanner,
    ]
  )

  const removeFile = React.useCallback(
    (targetId: string) => {
      if (disabled) return
      applyFilesUpdate((prev) => {
        const target = prev.find((item) => item.id === targetId)
        if (target) {
          revokeUrlIfTracked(target.previewUrl)
        }
        return prev.filter((item) => item.id !== targetId)
      })
    },
    [disabled, applyFilesUpdate, revokeUrlIfTracked]
  )

  const retryFile = React.useCallback(
    (targetId: string) => {
      if (disabled || !callbacksRef.current.onUpload) return
      const target = filesRef.current.find((item) => item.id === targetId)
      if (!target || !target.file) return

      const resetEntry: FileUploadEntry = {
        ...target,
        status: 'uploading',
        progress: 0,
        error: undefined,
      }
      applyFilesUpdate((prev) =>
        prev.map((item) => (item.id === targetId ? resetEntry : item))
      )
      triggerUploadForEntry(resetEntry)
    },
    [disabled, applyFilesUpdate, triggerUploadForEntry]
  )

  const clearFiles = React.useCallback(() => {
    if (disabled) return
    applyFilesUpdate((prev) => {
      for (const item of prev) {
        revokeUrlIfTracked(item.previewUrl)
      }
      return []
    })
    setRejections([])
  }, [disabled, applyFilesUpdate, revokeUrlIfTracked])

  const openPicker = React.useCallback(() => {
    if (disabled) return
    inputRef.current?.click()
  }, [disabled])

  const dismissRejections = React.useCallback(() => {
    setRejections([])
  }, [])

  const pasteFromClipboard = React.useCallback(async () => {
    if (disabled) return

    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard ||
      typeof navigator.clipboard.read !== 'function'
    ) {
      setRejections([
        {
          id: createEntryId(),
          fileName: 'Clipboard',
          reason: 'clipboard-empty',
          message:
            'Browser membatasi tombol baca clipboard langsung. Silakan tekan Ctrl+V (atau Cmd+V) untuk menempel gambar atau file.',
        },
      ])
      return
    }

    setIsReadingClipboard(true)
    try {
      const clipboardItems = await navigator.clipboard.read()
      const collectedFiles: File[] = []

      for (const item of clipboardItems) {
        const fileMime = item.types.find(
          (t) =>
            t.startsWith('image/') ||
            t.startsWith('video/') ||
            t.startsWith('audio/') ||
            t === 'application/pdf'
        )
        if (!fileMime) continue

        const blob = await item.getType(fileMime)
        pasteFileCounter += 1
        const ext =
          MIME_TO_EXTENSION[fileMime.toLowerCase()] ??
          (fileMime.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'png')
        collectedFiles.push(
          new File([blob], `clipboard-${pasteFileCounter}.${ext}`, {
            type: fileMime,
            lastModified: Date.now(),
          })
        )
      }

      if (collectedFiles.length === 0) {
        setRejections([
          {
            id: createEntryId(),
            fileName: 'Clipboard',
            reason: 'clipboard-empty',
            message:
              'Tidak ada gambar atau file di clipboard. Untuk menempel file dari Explorer/Finder, tekan Ctrl+V langsung.',
          },
        ])
        return
      }

      addFiles(collectedFiles, 'paste')
    } catch {
      setRejections([
        {
          id: createEntryId(),
          fileName: 'Clipboard',
          reason: 'clipboard-empty',
          message:
            'Akses clipboard tidak diizinkan atau kosong. Gunakan Ctrl+V (atau Cmd+V) setelah menyalin file/gambar.',
        },
      ])
    } finally {
      setIsReadingClipboard(false)
    }
  }, [disabled, addFiles])

  // Register in active global-paste coordinator
  React.useEffect(() => {
    const prev = pasteRegistry.get(inputId)
    pasteRegistry.set(inputId, {
      id: inputId,
      hasGlobalPaste: enableGlobalPaste,
      disabled,
      isHovered: prev?.isHovered ?? false,
      isFocused: prev?.isFocused ?? false,
      lastTouchedAt: prev?.lastTouchedAt ?? 0,
    })

    return () => {
      pasteRegistry.delete(inputId)
    }
  }, [inputId, enableGlobalPaste, disabled])

  const markAsPreferredPasteTarget = React.useCallback(() => {
    const existing = pasteRegistry.get(inputId)
    if (existing) {
      existing.lastTouchedAt = Date.now()
    }
  }, [inputId])

  const updateRegistryFocusOrHover = React.useCallback(
    (patch: Partial<Pick<PasteRegistryEntry, 'isHovered' | 'isFocused'>>) => {
      const existing = pasteRegistry.get(inputId)
      if (!existing) return
      if (patch.isHovered !== undefined) {
        existing.isHovered = patch.isHovered
      }
      if (patch.isFocused !== undefined) {
        existing.isFocused = patch.isFocused
      }
    },
    [inputId]
  )

  const addFilesRef = React.useRef(addFiles)
  React.useEffect(() => {
    addFilesRef.current = addFiles
  }, [addFiles])

  // Global Ctrl+V / Cmd+V listener so copied images & files auto-enter component
  React.useEffect(() => {
    if (!enableGlobalPaste || disabled) return

    const handleWindowPaste = (event: ClipboardEvent) => {
      if (processedPasteEvents.has(event)) return
      if (isExternalEditableTarget(event.target, wrapperRef.current)) return

      const winnerId = resolveWinningPasteTargetId()
      if (winnerId !== inputId) return

      const pastedFiles = extractFilesFromClipboardData(event.clipboardData)
      if (pastedFiles.length === 0) return

      processedPasteEvents.add(event)
      event.preventDefault()
      addFilesRef.current(pastedFiles, 'paste')
    }

    window.addEventListener('paste', handleWindowPaste)
    return () => window.removeEventListener('paste', handleWindowPaste)
  }, [enableGlobalPaste, disabled, inputId])

  // Reset drag active overlay safely if drag ends outside viewport
  React.useEffect(() => {
    if (!isDragActive) return
    const resetDrag = () => {
      dragCounterRef.current = 0
      setIsDragActive(false)
    }
    window.addEventListener('dragend', resetDrag)
    window.addEventListener('drop', resetDrag)
    return () => {
      window.removeEventListener('dragend', resetDrag)
      window.removeEventListener('drop', resetDrag)
    }
  }, [isDragActive])

  const handleContainerPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (processedPasteEvents.has(e.nativeEvent)) return

    const pastedFiles = extractFilesFromClipboardData(e.clipboardData)
    if (pastedFiles.length === 0) return

    processedPasteEvents.add(e.nativeEvent)
    e.preventDefault()
    e.stopPropagation()
    markAsPreferredPasteTarget()
    addFiles(pastedFiles, 'paste')
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled || !hasDraggedFiles(e.dataTransfer)) return
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current += 1
    setIsDragActive(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled || !hasDraggedFiles(e.dataTransfer)) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled || !hasDraggedFiles(e.dataTransfer)) return
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)
    if (dragCounterRef.current === 0) {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDragActive(false)
    markAsPreferredPasteTarget()

    if (disabled) return
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files, 'drop')
    }
  }

  const contextValue = React.useMemo<FileUploadContextValue>(
    () => ({
      state: {
        files: currentFiles,
        isDragActive,
        isReadingClipboard,
        isPasteTargetActive: enableGlobalPaste && (isFocusedWithin || isHovered),
        disabled,
        multiple,
        accept,
        maxSize,
        maxFiles,
        rejections,
      },
      actions: {
        addFiles,
        removeFile,
        retryFile,
        clearFiles,
        openPicker,
        pasteFromClipboard,
        dismissRejections,
      },
      meta: {
        inputId,
        descriptionId,
        name,
        acceptHint: formatAcceptHint(accept),
        maxSizeHint: maxSize ? formatFileSize(maxSize) : undefined,
        wrapperRef,
        inputRef,
      },
    }),
    [
      currentFiles,
      isDragActive,
      isReadingClipboard,
      enableGlobalPaste,
      isFocusedWithin,
      isHovered,
      disabled,
      multiple,
      accept,
      maxSize,
      maxFiles,
      rejections,
      addFiles,
      removeFile,
      retryFile,
      clearFiles,
      openPicker,
      pasteFromClipboard,
      dismissRejections,
      inputId,
      descriptionId,
      name,
    ]
  )

  return (
    <FileUploadContext value={contextValue}>
      <div
        ref={setMergedWrapperRef}
        onPaste={handleContainerPaste}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => {
          setIsHovered(true)
          updateRegistryFocusOrHover({ isHovered: true })
          markAsPreferredPasteTarget()
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          updateRegistryFocusOrHover({ isHovered: false })
        }}
        onFocusCapture={() => {
          setIsFocusedWithin(true)
          updateRegistryFocusOrHover({ isFocused: true })
          markAsPreferredPasteTarget()
        }}
        onBlurCapture={(e) => {
          if (
            wrapperRef.current &&
            !wrapperRef.current.contains(e.relatedTarget as Node | null)
          ) {
            setIsFocusedWithin(false)
            updateRegistryFocusOrHover({ isFocused: false })
          }
        }}
        onPointerDown={markAsPreferredPasteTarget}
        className={cn('w-full space-y-3', className)}
      >
        {children ?? (
          <>
            <FileUploadDropzone
              title={title}
              description={description}
              variant={variant}
              isError={isError || rejections.length > 0}
              showPasteButton={showPasteButton}
              className={dropzoneClassName}
            />

            <AnimatePresence initial={false}>
              {pasteFeedback && (
                <m.div
                  key="file-upload-paste-feedback"
                  role="status"
                  aria-live="polite"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: -4,
                          scale: 0.98,
                          transition: { duration: 0.16, ease: EASE_EXIT },
                        }
                  }
                  transition={{ duration: 0.22, ease: EASE_ENTER }}
                  className="px-3.5 py-2 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium flex items-center justify-between gap-2 shadow-xs"
                >
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <ClipboardPaste className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{pasteFeedback}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPasteFeedback(null)}
                    aria-label="Tutup status tempel"
                    className="size-6 shrink-0 rounded-md text-zinc-300 dark:text-zinc-600 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/10 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/10 flex items-center justify-center cursor-pointer"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </m.div>
              )}

              {rejections.length > 0 && (
                <m.div
                  key="file-upload-rejections"
                  role="alert"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: -4,
                          scale: 0.98,
                          transition: { duration: 0.16, ease: EASE_EXIT },
                        }
                  }
                  transition={{ duration: 0.22, ease: EASE_ENTER }}
                  className="px-3.5 py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/70 bg-rose-50/70 dark:bg-rose-950/35 text-rose-800 dark:text-rose-200 text-xs flex items-start justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <AlertCircle
                      className="size-4.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <ul className="space-y-0.5 min-w-0 flex-1">
                      {rejections.map((rej) => (
                        <li key={rej.id} className="leading-relaxed">
                          {rej.message}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={dismissRejections}
                    aria-label="Tutup peringatan unggahan"
                    className="size-7 shrink-0 rounded-lg text-rose-500 dark:text-rose-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-rose-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-rose-900/50 [@media(hover:hover)_and_(pointer:fine)]:hover:text-rose-900 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-rose-100 flex items-center justify-center cursor-pointer"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </m.div>
              )}
            </AnimatePresence>

            <FileUploadList
              files={currentFiles}
              layout={listLayout}
              allowLayoutToggle={allowLayoutToggle}
              onRemove={removeFile}
              onRetry={onUpload ? retryFile : undefined}
              onClearAll={clearFiles}
              disabled={disabled}
              showSourceBadge={showSourceBadge}
              enableLightbox={enableLightbox}
            />
          </>
        )}
      </div>
    </FileUploadContext>
  )
}
