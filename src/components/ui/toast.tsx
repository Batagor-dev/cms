'use client'

import * as React from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaXmark,
} from 'react-icons/fa6'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

type ToastListener = (toasts: ToastItem[]) => void

// Global Toast State Management with Window Singleton support
class ToastManager {
  private toasts: ToastItem[] = []
  private listeners: ToastListener[] = []
  private autoDismissTimers = new Map<string, ReturnType<typeof setTimeout>>()

  subscribe(listener: ToastListener) {
    this.listeners.push(listener)
    listener(this.toasts)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]))
  }

  show(toast: Omit<ToastItem, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastItem = { ...toast, id }
    this.toasts = [newToast, ...this.toasts]
    this.notify()

    // Dispatch global window event as fallback for cross-chunk / cross-island updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cms-toast-event', { detail: { action: 'show', toast: newToast } })
      )
    }

    const duration = toast.duration ?? 4500
    if (duration > 0) {
      const timer = setTimeout(() => {
        this.autoDismissTimers.delete(id)
        this.dismiss(id)
      }, duration)
      this.autoDismissTimers.set(id, timer)
    }
    return id
  }

  dismiss(id: string) {
    const autoTimer = this.autoDismissTimers.get(id)
    if (autoTimer) {
      clearTimeout(autoTimer)
      this.autoDismissTimers.delete(id)
    }

    this.toasts = this.toasts.filter((t) => t.id !== id)
    this.notify()

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cms-toast-event', { detail: { action: 'dismiss', id } })
      )
    }
  }

  clear() {
    this.autoDismissTimers.forEach((t) => clearTimeout(t))
    this.autoDismissTimers.clear()
    this.toasts = []
    this.notify()
  }
}

// Ensure single global instance even if module is evaluated multiple times
declare global {
  interface Window {
    __cmsToastManager?: ToastManager
  }
}

const getGlobalToastManager = (): ToastManager => {
  if (typeof window === 'undefined') {
    return new ToastManager()
  }
  if (!window.__cmsToastManager) {
    window.__cmsToastManager = new ToastManager()
  }
  return window.__cmsToastManager
}

export const toastManager = getGlobalToastManager()

// Convenient standalone toast helper
export const toast = (options: Omit<ToastItem, 'id'>) => {
  return toastManager.show(options)
}

toast.success = (title: string, message?: string, duration?: number) => {
  return toastManager.show({ type: 'success', title, message, duration })
}

toast.error = (title: string, message?: string, duration?: number) => {
  return toastManager.show({ type: 'error', title, message, duration })
}

toast.info = (title: string, message?: string, duration?: number) => {
  return toastManager.show({ type: 'info', title, message, duration })
}

toast.warning = (title: string, message?: string, duration?: number) => {
  return toastManager.show({ type: 'warning', title, message, duration })
}

toast.dismiss = (id: string) => {
  toastManager.dismiss(id)
}

function ToastCard({
  item,
  prefersReducedMotion,
}: {
  item: ToastItem
  prefersReducedMotion: boolean | null
}) {
  const [isAnimating, setIsAnimating] = React.useState(!prefersReducedMotion)

  return (
    <m.div
      role="status"
      initial={prefersReducedMotion ? false : { opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              y: -8,
              scale: 0.96,
              transition: { duration: 0.18, ease: EASE_EXIT },
            }
      }
      transition={{ duration: 0.26, ease: EASE_ENTER }}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
      style={isAnimating && !prefersReducedMotion ? { willChange: 'transform, opacity' } : undefined}
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl',
        'bg-white dark:bg-zinc-900',
        'ring-1 ring-zinc-950/[0.06] dark:ring-white/10',
        'shadow-[0_2px_6px_-1px_rgba(9,9,11,0.05),0_12px_28px_-6px_rgba(9,9,11,0.12),0_24px_48px_-12px_rgba(9,9,11,0.14)]',
        'dark:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.5),0_2px_8px_-1px_rgba(0,0,0,0.35)]'
      )}
    >
      {/* Status Icon */}
      <div className="shrink-0 mt-0.5">
        {item.type === 'error' && (
          <FaCircleExclamation className="size-5 text-rose-600 dark:text-rose-500" />
        )}
        {item.type === 'success' && (
          <FaCircleCheck className="size-5 text-emerald-600 dark:text-emerald-500" />
        )}
        {item.type === 'info' && (
          <FaCircleInfo className="size-5 text-blue-600 dark:text-blue-500" />
        )}
        {item.type === 'warning' && (
          <FaCircleExclamation className="size-5 text-amber-600 dark:text-amber-500" />
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 space-y-0.5 min-w-0">
        <h4 className="text-sm font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-50">
          {item.title}
        </h4>
        {item.message && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal line-clamp-3">
            {item.message}
          </p>
        )}
      </div>

      {/* Dismiss Close Button */}
      <button
        type="button"
        onClick={() => toastManager.dismiss(item.id)}
        className="shrink-0 p-1.5 -m-0.5 rounded-md text-slate-500 dark:text-slate-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-slate-700 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-slate-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-slate-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <FaXmark className="size-3.5" />
      </button>
    </m.div>
  )
}

// Global Toaster Component (Mounted in RootLayout)
export function Toaster() {
  const prefersReducedMotion = useReducedMotion()
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  React.useEffect(() => {
    const unsubscribe = toastManager.subscribe((newToasts) => {
      setToasts(newToasts)
    })

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        action: 'show' | 'dismiss'
        toast?: ToastItem
        id?: string
      }>
      if (customEvent.detail?.action === 'show' && customEvent.detail.toast) {
        const item = customEvent.detail.toast
        setToasts((prev) => {
          if (prev.some((t) => t.id === item.id)) return prev
          return [item, ...prev]
        })
      } else if (customEvent.detail?.action === 'dismiss' && customEvent.detail.id) {
        const dismissId = customEvent.detail.id
        setToasts((prev) => prev.filter((t) => t.id !== dismissId))
      }
    }

    window.addEventListener('cms-toast-event', handleCustomEvent)

    return () => {
      unsubscribe()
      window.removeEventListener('cms-toast-event', handleCustomEvent)
    }
  }, [])

  return (
    <div
      aria-live="polite"
      aria-label="Notifikasi Sistem"
      className="fixed top-4 left-4 right-4 sm:left-auto sm:top-5 sm:right-5 z-[99999] flex flex-col gap-2.5 sm:max-w-sm sm:w-full pointer-events-none select-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <ToastCard
            key={item.id}
            item={item}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
