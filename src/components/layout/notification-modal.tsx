'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ArrowUpRight,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT, getStaggerDelay } from '@/lib/motion'
import type {
  NotificationItem,
  NotificationType,
} from '@/components/layout/notification-context'

export type { NotificationItem, NotificationType }

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClearAll: () => void
}

function NotificationTypeIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="size-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
    case 'warning':
      return <AlertTriangle className="size-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
    case 'error':
      return <AlertCircle className="size-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
    default:
      return <Info className="size-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
  }
}

export function NotificationModal({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationModalProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all')
  const [isAnimating, setIsAnimating] = React.useState(false)

  const unreadCount = React.useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  const visibleItems = React.useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((item) => !item.read)
    }
    return notifications
  }, [notifications, filter])

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      onMarkAsRead(item.id)
    }
    if (item.href) {
      onClose()
      router.push(item.href)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="notification-modal"
          role="dialog"
          aria-modal="false"
          aria-label="Pusat Notifikasi"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.18, ease: EASE_EXIT } }
          }
          transition={{ duration: 0.25, ease: EASE_ENTER }}
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => setIsAnimating(false)}
          style={
            isAnimating && !prefersReducedMotion
              ? { willChange: 'transform, opacity' }
              : undefined
          }
          className={cn(
            'fixed inset-x-4 top-[76px] sm:inset-auto sm:absolute sm:right-0 sm:top-full sm:mt-2.5 sm:w-[390px] z-50',
            'rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden origin-top-right',
            'ring-1 ring-zinc-950/[0.06] dark:ring-white/10',
            'shadow-[0_6px_16px_-4px_rgba(9,9,11,0.08),0_20px_44px_-8px_rgba(9,9,11,0.16),0_32px_64px_-12px_rgba(9,9,11,0.12)] dark:shadow-[0_14px_38px_-6px_rgba(0,0,0,0.75)]'
          )}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-10 rounded-xl bg-black text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shrink-0">
                <Bell className="size-5" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight truncate">
                  Notifikasi
                </h2>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold tabular-nums leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="h-8 px-2.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:scale-100 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                  title="Tandai semua sudah dibaca"
                >
                  <CheckCheck className="size-4" aria-hidden="true" />
                  <span>Tandai dibaca</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-lg text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                aria-label="Tutup panel notifikasi"
                title="Tutup (Esc)"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center justify-between gap-2">
            <div
              className="inline-flex items-center p-0.5 rounded-xl bg-zinc-200/70 dark:bg-zinc-800"
              role="tablist"
              aria-label="Filter notifikasi"
            >
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'all'}
                onClick={() => setFilter('all')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-[background-color,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25',
                  filter === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100'
                )}
              >
                Semua ({notifications.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'unread'}
                onClick={() => setFilter('unread')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-[background-color,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25',
                  filter === 'unread'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100'
                )}
              >
                Belum dibaca ({unreadCount})
              </button>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-800 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100 flex items-center gap-1 px-2 py-1 rounded-lg [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                title="Hapus semua notifikasi"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                <span>Bersihkan</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {visibleItems.length === 0 ? (
              <div className="py-10 px-6 text-center flex flex-col items-center justify-center gap-2">
                <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
                  <Bell className="size-6" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {filter === 'unread'
                    ? 'Semua notifikasi sudah dibaca'
                    : 'Belum ada notifikasi baru'}
                </p>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-[240px]">
                  Aktivitas konten, pembaruan sistem, dan pengingat penting akan muncul di sini.
                </span>
              </div>
            ) : (
              visibleItems.map((item, idx) => (
                <m.button
                  key={item.id}
                  type="button"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: getStaggerDelay(idx, 0.03, 10),
                    ease: EASE_ENTER,
                  }}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-start gap-3 transition-colors duration-150 cursor-pointer group focus-visible:outline-none focus-visible:bg-zinc-100/80 dark:focus-visible:bg-zinc-800',
                    !item.read
                      ? 'bg-zinc-50/70 dark:bg-zinc-800/50 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100/80 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800'
                      : 'bg-white dark:bg-zinc-900 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-50 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800/40'
                  )}
                >
                  <div
                    className={cn(
                      'size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                      !item.read
                        ? 'bg-zinc-200/80 dark:bg-zinc-700'
                        : 'bg-zinc-100 dark:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-zinc-200/70 dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-zinc-700'
                    )}
                  >
                    <NotificationTypeIcon type={item.type} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          'text-sm leading-snug line-clamp-1',
                          !item.read
                            ? 'font-semibold text-zinc-950 dark:text-zinc-50'
                            : 'font-medium text-zinc-700 dark:text-zinc-300'
                        )}
                      >
                        {item.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        {!item.read && (
                          <span
                            className="size-1.5 rounded-full bg-black dark:bg-white shrink-0"
                            aria-label="Belum dibaca"
                          />
                        )}
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                          {item.time}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </m.button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Techarea Production CMS
            </span>
            <Link
              href="/dashboard/notifications"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              <span>Lihat semua notifikasi</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
