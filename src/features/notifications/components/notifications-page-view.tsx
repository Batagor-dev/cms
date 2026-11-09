'use client'

import * as React from 'react'
import Link from 'next/link'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  Trash2,
  Mail,
  MailOpen,
  ArrowUpRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT, getStaggerDelay } from '@/lib/motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useNotifications,
  type NotificationCategory,
  type NotificationType,
} from '@/components/layout/notification-context'

type StatusFilter = 'all' | 'unread' | 'read'
type CategoryFilter = 'Semua' | NotificationCategory

const CATEGORY_OPTIONS: CategoryFilter[] = [
  'Semua',
  'Konten',
  'Keamanan',
  'Hak Akses',
  'Sistem',
]

function NotificationTypeIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="size-5" aria-hidden="true" />
    case 'warning':
      return <AlertTriangle className="size-5" aria-hidden="true" />
    case 'error':
      return <AlertCircle className="size-5" aria-hidden="true" />
    default:
      return <Info className="size-5" aria-hidden="true" />
  }
}

export function NotificationsPageView() {
  const prefersReducedMotion = useReducedMotion()
  const {
    notifications,
    unreadCount,
    markAsRead,
    toggleRead,
    markAllAsRead,
    deleteNotification,
    markManyAsRead,
    deleteMany,
    clearRead,
  } = useNotifications()

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>('Semua')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  const readCount = notifications.length - unreadCount

  const statusFilteredNotifications = React.useMemo(() => {
    if (statusFilter === 'unread') {
      return notifications.filter((item) => !item.read)
    }
    if (statusFilter === 'read') {
      return notifications.filter((item) => item.read)
    }
    return notifications
  }, [notifications, statusFilter])

  const categoryCounts = React.useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      Semua: statusFilteredNotifications.length,
      Konten: 0,
      Keamanan: 0,
      'Hak Akses': 0,
      Sistem: 0,
    }
    for (const item of statusFilteredNotifications) {
      counts[item.category] += 1
    }
    return counts
  }, [statusFilteredNotifications])

  const filteredNotifications = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return statusFilteredNotifications.filter((item) => {
      if (categoryFilter !== 'Semua' && item.category !== categoryFilter) {
        return false
      }
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
    })
  }, [statusFilteredNotifications, categoryFilter, searchQuery])

  // Keep selections valid without effect state sync
  const validSelectedIds = React.useMemo(() => {
    if (selectedIds.length === 0) return []
    const visibleIdSet = new Set(filteredNotifications.map((item) => item.id))
    return selectedIds.filter((id) => visibleIdSet.has(id))
  }, [filteredNotifications, selectedIds])

  const selectedSet = React.useMemo(
    () => new Set(validSelectedIds),
    [validSelectedIds]
  )

  const allVisibleSelected =
    filteredNotifications.length > 0 &&
    validSelectedIds.length === filteredNotifications.length

  const hasActiveFilter =
    statusFilter !== 'all' ||
    categoryFilter !== 'Semua' ||
    searchQuery.trim().length > 0

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredNotifications.map((item) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleMarkSelected = (read: boolean) => {
    if (validSelectedIds.length === 0) return
    markManyAsRead(validSelectedIds, read)
    setSelectedIds([])
  }

  const handleDeleteSelected = () => {
    if (validSelectedIds.length === 0) return
    deleteMany(validSelectedIds)
    setSelectedIds([])
  }

  const handleResetFilters = () => {
    setStatusFilter('all')
    setCategoryFilter('Semua')
    setSearchQuery('')
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="size-12 rounded-2xl bg-black dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-xs">
            <Bell className="size-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight leading-tight text-zinc-950 dark:text-zinc-50">
                Notifikasi
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold tabular-nums">
                  {unreadCount} belum dibaca
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal mt-1 max-w-prose">
              Pantau pembaruan konten, hak akses, keamanan sistem, dan pesan aktivitas di Techarea Production CMS.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            leftIcon={<CheckCheck className="size-4.5" aria-hidden="true" />}
            className="h-9 px-3.5 rounded-xl bg-black dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold shadow-xs hover:bg-black dark:hover:bg-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200 transition-[background-color,scale,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
          >
            Tandai semua dibaca
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearRead}
            disabled={readCount === 0}
            leftIcon={<Trash2 className="size-4.5" aria-hidden="true" />}
            className="h-9 px-3.5 rounded-xl border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-semibold shadow-xs hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white transition-[background-color,color,scale,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
          >
            Hapus sudah dibaca
          </Button>
        </div>
      </div>

      {/* Main Notification Feed Card */}
      <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {/* Controls Toolbar */}
          <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Status Filter Tabs */}
              <div
                className="inline-flex items-center p-1 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/80 self-start max-w-full overflow-x-auto no-scrollbar"
                role="tablist"
                aria-label="Filter status baca notifikasi"
              >
                {(
                  [
                    { key: 'all', label: 'Semua', count: notifications.length },
                    { key: 'unread', label: 'Belum dibaca', count: unreadCount },
                    { key: 'read', label: 'Sudah dibaca', count: readCount },
                  ] as const
                ).map((tab) => {
                  const active = statusFilter === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setStatusFilter(tab.key)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-[background-color,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 tabular-nums',
                        active
                          ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100'
                      )}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  )
                })}
              </div>

              {/* Search Field */}
              <div className="w-full lg:w-80">
                <label htmlFor="notification-search" className="sr-only">
                  Cari notifikasi
                </label>
                <Input
                  id="notification-search"
                  type="text"
                  inputMode="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul, isi, atau kategori..."
                  leftIcon={<Search className="size-4.5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />}
                  rightIcon={
                    searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="size-7 rounded-md text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                        aria-label="Reset pencarian"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    ) : undefined
                  }
                  className="h-10 rounded-2xl border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/70 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:bg-white dark:focus-visible:bg-zinc-900 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            {/* Category Filter Chips + Result Readout */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label="Filter kategori notifikasi"
              >
                {CATEGORY_OPTIONS.map((category) => {
                  const active = categoryFilter === category
                  const count = categoryCounts[category]
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategoryFilter(category)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 tabular-nums',
                        active
                          ? 'bg-black dark:bg-white text-white dark:text-zinc-950'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200/70 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-700 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white'
                      )}
                    >
                      {category} ({count})
                    </button>
                  )
                })}
              </div>

              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">
                Menampilkan {filteredNotifications.length} dari {notifications.length} notifikasi
              </span>
            </div>
          </div>

          {/* Multi-select Bulk Actions Strip */}
          {filteredNotifications.length > 0 && (
            <div className="px-5 sm:px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="select-all-notifications"
                className="inline-flex items-center gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 cursor-pointer select-none"
              >
                <Checkbox
                  id="select-all-notifications"
                  checked={allVisibleSelected}
                  onCheckedChange={handleToggleSelectAll}
                  className="rounded-[5px]"
                />
                <span>
                  {validSelectedIds.length > 0
                    ? `${validSelectedIds.length} terpilih`
                    : 'Pilih semua'}
                </span>
              </label>

              {validSelectedIds.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkSelected(true)}
                    leftIcon={<MailOpen className="size-4" aria-hidden="true" />}
                    className="h-8 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                  >
                    Tandai dibaca
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkSelected(false)}
                    leftIcon={<Mail className="size-4" aria-hidden="true" />}
                    className="h-8 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                  >
                    Tandai belum dibaca
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteSelected}
                    leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
                    className="h-8 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                  >
                    Hapus terpilih
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Centang notifikasi untuk aksi massal
                </span>
              )}
            </div>
          )}

          {/* List Content or Empty State */}
          {filteredNotifications.length === 0 ? (
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center gap-3">
              <div className="size-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
                <Bell className="size-7" aria-hidden="true" />
              </div>
              <div className="space-y-1 max-w-sm">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {notifications.length === 0
                    ? 'Semua notifikasi bersih'
                    : 'Tidak ada notifikasi yang cocok'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                  {notifications.length === 0
                    ? 'Pembaruan artikel, pengingat keamanan, dan aktivitas sistem baru akan tercatat otomatis di halaman ini.'
                    : 'Coba ubah filter status, kategori, atau kata kunci pencarian Anda.'}
                </p>
              </div>
              {hasActiveFilter ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-1 h-8 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                >
                  Reset filter
                </Button>
              ) : (
                <Link
                  href="/dashboard"
                  className="mt-1 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                >
                  <span>Kembali ke Dashboard</span>
                </Link>
              )}
            </div>
          ) : (
            <ul aria-label="Daftar notifikasi" className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence initial={false}>
                {filteredNotifications.map((item, idx) => {
                  const isSelected = selectedSet.has(item.id)
                  return (
                    <m.li
                      key={item.id}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              scale: 0.98,
                              transition: { duration: 0.16, ease: EASE_EXIT },
                            }
                      }
                      transition={{
                        duration: 0.24,
                        delay: getStaggerDelay(idx, 0.03, 10),
                        ease: EASE_ENTER,
                      }}
                      className={cn(
                        'px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                        isSelected
                          ? 'bg-zinc-100/80 dark:bg-zinc-800/75'
                          : !item.read
                            ? 'bg-zinc-50/55 dark:bg-zinc-800/40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100/60 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800/60'
                            : 'bg-white dark:bg-zinc-900 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-50/80 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800/40'
                      )}
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <label
                          htmlFor={`notif-select-${item.id}`}
                          className="pt-2.5 p-1 -m-1 cursor-pointer inline-flex items-center justify-center shrink-0"
                        >
                          <Checkbox
                            id={`notif-select-${item.id}`}
                            aria-label={`Pilih notifikasi ${item.title}`}
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelect(item.id)}
                            className="rounded-[5px]"
                          />
                        </label>

                        <div
                          className={cn(
                            'size-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-200',
                            !item.read
                              ? 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          )}
                        >
                          <NotificationTypeIcon type={item.type} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2
                              className={cn(
                                'text-sm leading-tight',
                                !item.read
                                  ? 'font-semibold text-zinc-950 dark:text-zinc-50'
                                  : 'font-medium text-zinc-700 dark:text-zinc-300'
                              )}
                            >
                              {item.title}
                            </h2>
                            {!item.read && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold leading-none">
                                <span
                                  className="size-1.5 rounded-full bg-white dark:bg-zinc-950"
                                  aria-hidden="true"
                                />
                                Baru
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium">
                              {item.category}
                            </span>
                          </div>

                          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal mt-1.5 max-w-prose">
                            {item.description}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">
                            <time title={item.createdAtLabel}>{item.time}</time>
                            <span>{item.createdAtLabel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Row Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 pl-8 sm:pl-0 sm:pt-0.5">
                        {item.href && (
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (!item.read) markAsRead(item.id)
                            }}
                            className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-600 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-50 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 transition-[background-color,border-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                          >
                            <span>Buka</span>
                            <ArrowUpRight className="size-4" aria-hidden="true" />
                          </Link>
                        )}

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleRead(item.id)}
                          aria-label={
                            item.read
                              ? `Tandai "${item.title}" belum dibaca`
                              : `Tandai "${item.title}" sudah dibaca`
                          }
                          title={
                            item.read
                              ? 'Tandai belum dibaca'
                              : 'Tandai sudah dibaca'
                          }
                          className="size-9 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-transparent hover:text-zinc-500 dark:hover:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200/70 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                        >
                          {item.read ? (
                            <Mail className="size-5" aria-hidden="true" />
                          ) : (
                            <MailOpen className="size-5" aria-hidden="true" />
                          )}
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteNotification(item.id)}
                          aria-label={`Hapus notifikasi "${item.title}"`}
                          title="Hapus notifikasi"
                          className="size-9 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-transparent hover:text-zinc-500 dark:hover:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200/70 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                        >
                          <Trash2 className="size-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </m.li>
                  )
                })}
              </AnimatePresence>
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
