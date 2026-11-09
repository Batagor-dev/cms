import type { Metadata } from 'next'
import { NotificationsPageView } from '@/features/notifications/components/notifications-page-view'

export const metadata: Metadata = {
  title: 'Notifikasi | Techarea Production CMS',
  description:
    'Daftar lengkap notifikasi sistem, pembaruan konten, hak akses, dan keamanan di Techarea Production CMS.',
}

export default function NotificationsPage() {
  return <NotificationsPageView />
}

