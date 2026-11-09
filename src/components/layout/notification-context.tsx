'use client'

import * as React from 'react'
import type { ToastItem } from '@/components/ui'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'Konten' | 'Keamanan' | 'Hak Akses' | 'Sistem'

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  createdAtLabel: string
  category: NotificationCategory
  type: NotificationType
  read: boolean
  href?: string
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'sys-1',
    title: 'Publikasi artikel terjadwal siap ditinjau',
    description:
      'Draft panduan editorial "Arsitektur Konten Techarea Production" menunggu peninjauan akhir sebelum diterbitkan ke halaman publik.',
    time: '5m lalu',
    createdAtLabel: 'Hari ini, 19:35',
    category: 'Konten',
    type: 'info',
    read: false,
    href: '/dashboard/posts',
  },
  {
    id: 'sys-2',
    title: 'Pembaruan konfigurasi default role Viewer',
    description:
      'Setiap pendaftar akun baru melalui form registrasi kini otomatis ditetapkan sebagai Viewer dengan izin baca-saja.',
    time: '1j lalu',
    createdAtLabel: 'Hari ini, 18:20',
    category: 'Hak Akses',
    type: 'success',
    read: false,
    href: '/dashboard/roles',
  },
  {
    id: 'sys-3',
    title: 'Lonjakan unggahan aset Media Library',
    description:
      'Sebanyak 14 berkas gambar beresolusi tinggi diunggah hari ini. Pastikan alt text dan kompresi ukuran aset sudah sesuai standar.',
    time: '3j lalu',
    createdAtLabel: 'Hari ini, 16:10',
    category: 'Konten',
    type: 'warning',
    read: false,
    href: '/dashboard/media',
  },
  {
    id: 'sys-4',
    title: 'Audit keamanan dan verifikasi OTP aktif',
    description:
      'Seluruh kebijakan Row Level Security (RLS) dan alur verifikasi kode OTP email berjalan normal tanpa anomali percobaan masuk.',
    time: 'Kemarin',
    createdAtLabel: 'Kemarin, 21:00',
    category: 'Keamanan',
    type: 'info',
    read: true,
    href: '/dashboard/audit-log',
  },
  {
    id: 'sys-5',
    title: 'Pengaturan metadata SEO berhasil disinkronkan',
    description:
      'Konfigurasi OpenGraph, sitemap XML, dan robots.txt telah diperbarui untuk indeksasi halaman blog dan artikel terbaru.',
    time: '2 hari lalu',
    createdAtLabel: '7 Nov, 14:45',
    category: 'Sistem',
    type: 'success',
    read: true,
    href: '/dashboard/settings/seo',
  },
  {
    id: 'sys-6',
    title: 'Pengguna baru menunggu verifikasi profil',
    description:
      'Terdapat 2 akun pengguna baru yang telah menyelesaikan verifikasi email dan siap ditinjau kelengkapan profilnya.',
    time: '3 hari lalu',
    createdAtLabel: '6 Nov, 10:15',
    category: 'Hak Akses',
    type: 'info',
    read: true,
    href: '/dashboard/users',
  },
]

interface NotificationContextValue {
  notifications: NotificationItem[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAsUnread: (id: string) => void
  toggleRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  markManyAsRead: (ids: string[], read: boolean) => void
  deleteMany: (ids: string[]) => void
  clearRead: () => void
  clearAll: () => void
}

const NotificationContext = React.createContext<NotificationContextValue | undefined>(
  undefined
)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] =
    React.useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)

  // Listen for live system toast notifications so all notifications stay unified
  React.useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string; toast?: ToastItem }>
      if (customEvent.detail?.action === 'show' && customEvent.detail.toast) {
        const t = customEvent.detail.toast
        setNotifications((prev) => {
          if (prev.some((n) => n.id === `toast-${t.id}`)) return prev
          const newItem: NotificationItem = {
            id: `toast-${t.id}`,
            title: t.title,
            description: t.message || 'Notifikasi sistem baru diterima.',
            time: 'Baru saja',
            createdAtLabel: 'Baru saja',
            category: 'Sistem',
            type: t.type,
            read: false,
          }
          return [newItem, ...prev].slice(0, 50)
        })
      }
    }

    window.addEventListener('cms-toast-event', handleToastEvent)
    return () => window.removeEventListener('cms-toast-event', handleToastEvent)
  }, [])

  const unreadCount = React.useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  const markAsRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
  }, [])

  const markAsUnread = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: false } : item))
    )
  }, [])

  const toggleRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item))
    )
  }, [])

  const markAllAsRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }, [])

  const deleteNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const markManyAsRead = React.useCallback((ids: string[], read: boolean) => {
    const idSet = new Set(ids)
    setNotifications((prev) =>
      prev.map((item) => (idSet.has(item.id) ? { ...item, read } : item))
    )
  }, [])

  const deleteMany = React.useCallback((ids: string[]) => {
    const idSet = new Set(ids)
    setNotifications((prev) => prev.filter((item) => !idSet.has(item.id)))
  }, [])

  const clearRead = React.useCallback(() => {
    setNotifications((prev) => prev.filter((item) => !item.read))
  }, [])

  const clearAll = React.useCallback(() => {
    setNotifications([])
  }, [])

  const value = React.useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAsUnread,
      toggleRead,
      markAllAsRead,
      deleteNotification,
      markManyAsRead,
      deleteMany,
      clearRead,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
      markAsRead,
      markAsUnread,
      toggleRead,
      markAllAsRead,
      deleteNotification,
      markManyAsRead,
      deleteMany,
      clearRead,
      clearAll,
    ]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = React.use(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

