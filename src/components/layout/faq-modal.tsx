'use client'

import * as React from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import {
  HelpCircle,
  X,
  ChevronDown,
  Search,
  FileText,
  Shield,
  User,
  PanelLeft,
  Maximize2,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'

interface FaqItem {
  id: string
  question: string
  answer: string
  category: 'artikel' | 'role' | 'profil' | 'navigasi'
  icon: React.ComponentType<{ className?: string }>
}

const faqData: FaqItem[] = [
  {
    id: 'sidebar',
    question: 'Bagaimana cara membuka dan menutup sidebar?',
    answer:
      'Gunakan tombol navigasi di sudut kiri header. Klik icon ">>" untuk membuka sidebar secara penuh, dan klik icon "<<" untuk menutup kembali sidebar ke mode ringkas.',
    category: 'navigasi',
    icon: PanelLeft,
  },
  {
    id: 'roles',
    question: 'Apa perbedaan izin akses antara Administrator, Author, dan Viewer?',
    answer:
      'Administrator memiliki kendali penuh atas sistem, modul pengguna, role, dan konten. Author memiliki wewenang untuk menulis, mengedit, dan mengunggah artikel serta media. Viewer hanya memiliki izin membaca konten dashboard tanpa hak edit.',
    category: 'role',
    icon: Shield,
  },
  {
    id: 'posts',
    question: 'Bagaimana alur pembuatan dan publikasi artikel baru?',
    answer:
      'Masuk ke menu "Posts & Articles" di sidebar, klik tombol "Tambah Post Baru", lengkapi judul, slug, kategori, tag, dan isi konten artikel. Anda dapat menyimpannya sebagai draft terlebih dahulu atau langsung memilih status "Published".',
    category: 'artikel',
    icon: FileText,
  },
  {
    id: 'avatar',
    question: 'Bagaimana cara memperbarui informasi akun dan foto profil?',
    answer:
      'Klik avatar Anda di sudut kanan atas header untuk membuka menu akun, pilih "Pengaturan Akun". Di halaman pengaturan Anda dapat mengganti nama lengkap, foto avatar (default 1.png), dan informasi lainnya.',
    category: 'profil',
    icon: User,
  },
  {
    id: 'fullscreen',
    question: 'Bagaimana cara mengaktifkan dan keluar dari mode Layar Penuh (Fullscreen)?',
    answer:
      'Klik icon Fullscreen di baris header sebelah tombol Bantuan untuk beralih ke tampilan layar penuh tanpa gangguan browser. Anda dapat keluar dari mode layar penuh kapan saja dengan mengklik icon tersebut lagi atau menekan tombol Esc di keyboard.',
    category: 'navigasi',
    icon: Maximize2,
  },
  {
    id: 'ai-studio',
    question: 'Fitur apa saja yang didukung oleh Techarea Production CMS ini?',
    answer:
      'CMS ini dibangun dengan Next.js 16, Supabase Authentication & Database RBAC, manajemen media library, pelacakan audit log aktivitas, manajemen role dinamis, serta analitik dashboard interaktif bertema monokrom modern.',
    category: 'artikel',
    icon: Sparkles,
  },
]

interface FaqModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FaqModal({ isOpen, onClose }: FaqModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isPanelAnimating, setIsPanelAnimating] = React.useState(false)
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({
    sidebar: true, // open first item by default
  })

  // Keyboard shortcut: close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const filteredFaq = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="faq-modal-backdrop"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18, ease: EASE_EXIT } }}
          transition={{ duration: 0.22, ease: EASE_ENTER }}
          className="fixed inset-0 z-50 bg-black/55 dark:bg-black/75 flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-modal-title"
        >
          <m.div
            key="faq-modal-panel"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 6, transition: { duration: 0.18, ease: EASE_EXIT } }
            }
            transition={{ duration: 0.26, ease: EASE_ENTER }}
            onAnimationStart={() => setIsPanelAnimating(true)}
            onAnimationComplete={() => setIsPanelAnimating(false)}
            style={
              isPanelAnimating && !prefersReducedMotion
                ? { willChange: 'transform, opacity' }
                : undefined
            }
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.8)] border border-zinc-200/90 dark:border-zinc-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="size-12 rounded-2xl bg-black text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-xs">
                  <HelpCircle className="size-6" />
                </div>
                <div>
                  <h2
                    id="faq-modal-title"
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight"
                  >
                    Pusat Bantuan &amp; FAQ
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Pertanyaan yang sering diajukan seputar CMS &amp; Dashboard
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-9 rounded-full bg-zinc-100 dark:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white flex items-center justify-center transition-[scale,background-color,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 focus:outline-none cursor-pointer shrink-0"
                title="Tutup (Esc)"
                aria-label="Tutup Modal"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Search within FAQ */}
            <div className="px-5 sm:px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 shrink-0">
              <div className="relative flex items-center">
                <Search className="size-4.5 text-zinc-500 dark:text-zinc-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari topik bantuan (misal: sidebar, role, artikel)..."
                  className="w-full pl-11 pr-4 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-base sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15 focus:border-zinc-400 dark:focus:border-zinc-500 transition-[border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-xs text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable FAQ Accordion List (GPU-friendly grid-template-rows: 0fr -> 1fr) */}
            <div className="p-5 sm:p-6 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 space-y-2">
              {filteredFaq.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <HelpCircle className="size-10 text-zinc-400 dark:text-zinc-500" />
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                    Tidak ada pertanyaan yang sesuai dengan &quot;{searchQuery}&quot;
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-black dark:text-white underline cursor-pointer mt-1"
                  >
                    Hapus pencarian
                  </button>
                </div>
              ) : (
                filteredFaq.map((item) => {
                  const Icon = item.icon
                  const isExpanded = !!openItems[item.id]

                  return (
                    <div key={item.id} className="pt-2.5 first:pt-0">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        aria-expanded={isExpanded}
                        className="w-full flex items-center justify-between gap-3 text-left p-2.5 rounded-2xl [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-50 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800/60 transition-colors duration-200 focus:outline-none cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200',
                              isExpanded
                                ? 'bg-black text-white dark:bg-white dark:text-zinc-950'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
                            )}
                          >
                            <Icon className="size-5" />
                          </div>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white leading-snug">
                            {item.question}
                          </span>
                        </div>

                        <ChevronDown
                          className={cn(
                            'size-5 text-zinc-500 dark:text-zinc-400 shrink-0 transition-[rotate,color] duration-250 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
                            isExpanded && 'rotate-180 text-black dark:text-white'
                          )}
                        />
                      </button>

                      <div
                        aria-hidden={!isExpanded}
                        className={cn(
                          'grid transition-[grid-template-rows,opacity] duration-250 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
                          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="pl-[62px] pr-4 pb-3 pt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-normal max-w-prose">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                <span>Butuh bantuan lanjutan? Hubungi tim administrator.</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-black [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200 text-white text-sm font-medium shadow-xs transition-[scale,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 focus:outline-none cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
