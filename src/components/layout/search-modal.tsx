'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import {
  Search,
  X,
  FileText,
  Files,
  FolderTree,
  Tags,
  Image as ImageIcon,
  Users,
  Shield,
  History,
  Settings,
  Sparkles,
  ArrowRight,
  Plus,
  Bell,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'

interface SearchItem {
  id: string
  title: string
  category: 'Navigasi' | 'Aksi Cepat' | 'Pengaturan'
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const searchItems: SearchItem[] = [
  // Navigasi Utama
  { id: 'dash', title: 'Dashboard Overview', category: 'Navigasi', href: '/dashboard', icon: Sparkles },
  { id: 'posts', title: 'Daftar Posts & Articles', category: 'Navigasi', href: '/dashboard/posts', icon: FileText },
  { id: 'pages', title: 'Daftar Pages (Halaman Statis)', category: 'Navigasi', href: '/dashboard/pages', icon: Files },
  { id: 'categories', title: 'Kategori Artikel', category: 'Navigasi', href: '/dashboard/categories', icon: FolderTree },
  { id: 'tags', title: 'Tag & Label', category: 'Navigasi', href: '/dashboard/tags', icon: Tags },
  { id: 'media', title: 'Media Library & Uploads', category: 'Navigasi', href: '/dashboard/media', icon: ImageIcon },
  { id: 'notifications', title: 'Daftar & Pusat Notifikasi', category: 'Navigasi', href: '/dashboard/notifications', icon: Bell },
  { id: 'users', title: 'Manajemen Pengguna (Users)', category: 'Navigasi', href: '/dashboard/users', icon: Users },
  { id: 'roles', title: 'Hak Akses & Role (RBAC)', category: 'Navigasi', href: '/dashboard/roles', icon: Shield },
  { id: 'audit', title: 'Audit Log & Riwayat Aktivitas', category: 'Navigasi', href: '/dashboard/audit-log', icon: History },
  { id: 'components', title: 'UI Components (Select2, File Upload & DataTables)', category: 'Navigasi', href: '/dashboard/components', icon: Layers },

  // Aksi Cepat
  { id: 'new-post', title: 'Tulis Artikel Baru (New Post)', category: 'Aksi Cepat', href: '/dashboard/posts/new', icon: Plus, badge: 'Baru' },
  { id: 'new-page', title: 'Buat Halaman Baru (New Page)', category: 'Aksi Cepat', href: '/dashboard/pages/new', icon: Plus, badge: 'Baru' },

  // Pengaturan
  { id: 'settings', title: 'Pengaturan Profil & Akun', category: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
  { id: 'seo', title: 'Pengaturan SEO & Meta Tags', category: 'Pengaturan', href: '/dashboard/settings/seo', icon: Settings },
]

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [isPanelAnimating, setIsPanelAnimating] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClose = React.useCallback(() => {
    setQuery('')
    setSelectedIndex(0)
    onClose()
  }, [onClose])

  // Focus input on next frame when modal opens (no setTimeout jitter)
  React.useEffect(() => {
    if (!isOpen) return
    const rafId = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(rafId)
  }, [isOpen])

  // Filter items
  const filtered = React.useMemo(() => {
    if (!query.trim()) return searchItems
    const q = query.toLowerCase()
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q)
    )
  }, [query])

  const activeIndex = filtered.length > 0 ? Math.min(selectedIndex, filtered.length - 1) : 0

  // Keyboard navigation & Shortcuts (Esc, Arrow keys, Enter)
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'ArrowDown' && filtered.length > 0) {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp' && filtered.length > 0) {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[activeIndex]) {
          router.push(filtered[activeIndex].href)
          handleClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose, filtered, activeIndex, router])

  const handleSelect = (href: string) => {
    router.push(href)
    handleClose()
  }

  // Group filtered items by category
  const categories = Array.from(new Set(filtered.map((item) => item.category)))

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="search-modal-backdrop"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18, ease: EASE_EXIT } }}
          transition={{ duration: 0.2, ease: EASE_ENTER }}
          className="fixed inset-0 z-50 bg-black/50 dark:bg-black/75 flex items-start justify-center p-4 pt-16 sm:pt-24"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Pencarian Cepat CMS"
        >
          <m.div
            key="search-modal-panel"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.18, ease: EASE_EXIT } }
            }
            transition={{ duration: 0.25, ease: EASE_ENTER }}
            onAnimationStart={() => setIsPanelAnimating(true)}
            onAnimationComplete={() => setIsPanelAnimating(false)}
            style={
              isPanelAnimating && !prefersReducedMotion
                ? { willChange: 'transform, opacity' }
                : undefined
            }
            className="bg-white dark:bg-zinc-900 rounded-3xl ring-1 ring-zinc-950/[0.06] dark:ring-white/10 shadow-[0_8px_24px_-4px_rgba(9,9,11,0.12),0_32px_72px_-12px_rgba(9,9,11,0.24)] dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.8)] w-full max-w-xl flex flex-col overflow-hidden origin-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
              <Search className="size-5 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                placeholder="Cari menu, halaman, aksi cepat, atau ketik nama fitur..."
                className="flex-1 bg-transparent text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setSelectedIndex(0)
                  }}
                  className="text-xs text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white cursor-pointer px-1.5 py-0.5 rounded-md [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 transition-colors"
                >
                  Reset
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  ESC
                </kbd>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="size-8 rounded-full [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white flex items-center justify-center transition-[scale,background-color,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 focus:outline-none cursor-pointer"
                title="Tutup"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
              {filtered.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <Search className="size-9 text-zinc-400 dark:text-zinc-500" />
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    Tidak ada hasil untuk &quot;{query}&quot;
                  </p>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Coba cari kata kunci lain seperti: posts, pages, users, roles, atau settings
                  </span>
                </div>
              ) : (
                categories.map((cat) => {
                  const catItems = filtered.filter((i) => i.category === cat)
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {cat}
                      </div>
                      {catItems.map((item) => {
                        const globalIdx = filtered.indexOf(item)
                        const isSelected = globalIdx === activeIndex
                        const Icon = item.icon

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(item.href)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={cn(
                              'w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-[background-color,color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group',
                              isSelected
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                                : '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-50 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={cn(
                                  'size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                  isSelected
                                    ? 'bg-black text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
                                )}
                              >
                                <Icon className="size-5" />
                              </div>
                              <span className="text-sm font-semibold truncate">
                                {item.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.badge && (
                                <span className="px-1.5 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
                                  {item.badge}
                                </span>
                              )}
                              <ArrowRight
                                className={cn(
                                  'size-4 text-zinc-500 dark:text-zinc-400 transition-[color,translate] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]',
                                  isSelected && 'translate-x-0.5 text-black dark:text-white'
                                )}
                              />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer shortcuts helper */}
            <div className="p-3 px-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-mono shadow-2xs">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-mono shadow-2xs">
                    ↓
                  </kbd>
                  <span>Navigasi</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-mono shadow-2xs">
                    ↵
                  </kbd>
                  <span>Pilih</span>
                </span>
              </div>

              <span className="text-zinc-500 dark:text-zinc-400 font-medium">CMS Quick Search</span>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
