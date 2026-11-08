'use client'

import * as React from 'react'
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaXmark,
} from 'react-icons/fa6'
import { cn } from '@/lib/utils'

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
      setTimeout(() => {
        this.dismiss(id)
      }, duration)
    }
    return id
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id)
    this.notify()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cms-toast-event', { detail: { action: 'dismiss', id } })
      )
    }
  }

  clear() {
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

// Global Toaster Component (Mounted in RootLayout)
export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  React.useEffect(() => {
    // 1. Subscribe to manager instance
    const unsubscribe = toastManager.subscribe((newToasts) => {
      setToasts(newToasts)
    })

    // 2. Also listen to window custom event for maximum reliability
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: 'show' | 'dismiss'; toast?: ToastItem; id?: string }>
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

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notifikasi Sistem"
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 transition-all duration-300 transform translate-y-0 opacity-100"
        >
          {/* Status Icon */}
          <div className="shrink-0 mt-0.5">
            {item.type === 'error' && (
              <FaCircleExclamation className="size-4.5 text-rose-600 dark:text-rose-500" />
            )}
            {item.type === 'success' && (
              <FaCircleCheck className="size-4.5 text-emerald-600 dark:text-emerald-500" />
            )}
            {item.type === 'info' && (
              <FaCircleInfo className="size-4.5 text-blue-600 dark:text-blue-500" />
            )}
            {item.type === 'warning' && (
              <FaCircleExclamation className="size-4.5 text-amber-600 dark:text-amber-500" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 space-y-0.5 min-w-0">
            <h4 className="text-xs font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-50">
              {item.title}
            </h4>
            {item.message && (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal line-clamp-3">
                {item.message}
              </p>
            )}
          </div>

          {/* Dismiss Close Button */}
          <button
            type="button"
            onClick={() => toastManager.dismiss(item.id)}
            className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <FaXmark className="size-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
