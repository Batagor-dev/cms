'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import {
  LogOut,
  Shield,
  Search,
  Bell,
  Settings,
  Maximize2,
  Minimize2,
  ChevronsLeft,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle, toast } from '@/components/ui'
import { useSidebar } from '@/components/layout/sidebar-context'
import { useNotifications } from '@/components/layout/notification-context'
import { SearchModal } from '@/components/layout/search-modal'
import { NotificationModal } from '@/components/layout/notification-modal'

interface DashboardHeaderProps {
  userEmail?: string | null
  userName?: string | null
  roleName?: string | null
  avatarUrl?: string | null
}

export function DashboardHeader({
  userEmail,
  userName,
  roleName = 'Administrator',
  avatarUrl = '/images/avatars/1.png',
}: DashboardHeaderProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const { isCollapsed, toggleSidebar, isMobileOpen, toggleMobileSidebar } = useSidebar()
  const {
    notifications,
    unreadCount: unreadNotifCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const [isDropdownAnimating, setIsDropdownAnimating] = React.useState(false)
  const [isNotifOpen, setIsNotifOpen] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const notifRef = React.useRef<HTMLDivElement>(null)

  const displayName = userName || userEmail?.split('@')[0] || 'Admin User'

  // Global shortcut: Cmd+K / Ctrl+K to open Search Modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fullscreen toggle logic
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch {
      // Gracefully handle browser restrictions
    }
  }

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Close dropdown & notification panel on click outside or Escape key
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
        setIsNotifOpen(false)
      }
    }

    if (isDropdownOpen || isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen, isNotifOpen])

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error('Gagal Keluar', error.message)
        setIsLoggingOut(false)
        return
      }

      toast.success('Berhasil Keluar', 'Sampai jumpa kembali!')
      router.push('/login')
      router.refresh()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat logout'
      toast.error('Gagal Keluar', errorMsg)
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="h-[68px] sm:h-[72px] bg-white dark:bg-zinc-900 border-b border-transparent dark:border-zinc-800/90 px-3 sm:px-6 flex items-center justify-between gap-2 sticky top-0 z-30 transition-colors duration-200">
      {/* Left: Hamburger Menu (Mobile/Tablet) & Sidebar Toggle (Desktop) */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="flex lg:hidden size-10 sm:size-11 rounded-xl bg-transparent [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100/80 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white items-center justify-center transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 cursor-pointer"
          title={isMobileOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
          aria-label={isMobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-dashboard-sidebar"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden lg:flex size-10 sm:size-11 rounded-xl bg-transparent [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100/80 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white items-center justify-center transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 cursor-pointer"
          title={isCollapsed ? 'Buka Sidebar (>>)' : 'Tutup Sidebar (<<)'}
          aria-label={isCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
          aria-expanded={!isCollapsed}
        >
          <ChevronsLeft
            className={cn(
              'size-5 transition-[rotate] duration-250 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
              isCollapsed ? 'rotate-180' : 'rotate-0'
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Center: Search (Centered, Clickable, Opens Search Modal) */}
      <div className="flex-1 min-w-0 max-w-md mx-auto px-1 sm:px-4 flex justify-center">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-full max-w-sm flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-zinc-100/90 dark:bg-zinc-800/80 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200/80 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm transition-[background-color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 cursor-pointer group min-w-0"
          title="Klik untuk mencari menu, post, halaman, atau user..."
          aria-label="Buka Pencarian"
        >
          <Search
            className="size-4.5 sm:size-5 text-zinc-500 [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-black dark:text-zinc-400 dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover:text-white transition-colors shrink-0"
            aria-hidden="true"
          />
          <span className="font-medium text-zinc-600 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover:text-white transition-colors truncate">
            <span className="sm:hidden">Search...</span>
            <span className="hidden sm:inline">Search anything...</span>
          </span>
        </button>
      </div>

      {/* Right: Theme Toggle, Fullscreen, Notifications, Borderless Monochrome Avatar Dropdown */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <ThemeToggle />

        {/* Fullscreen Toggle - Borderless Monochrome (Tablet/Desktop) */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex size-10 sm:size-11 rounded-full [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white items-center justify-center transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 cursor-pointer"
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
          aria-label={isFullscreen ? 'Keluar Mode Layar Penuh' : 'Masuk Mode Layar Penuh'}
          aria-pressed={isFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="size-5" aria-hidden="true" />
          ) : (
            <Maximize2 className="size-5" aria-hidden="true" />
          )}
        </button>

        {/* Notifications Bell + Panel Modal */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen(false)
              setIsNotifOpen((prev) => !prev)
            }}
            className={cn(
              'size-10 sm:size-11 rounded-full flex items-center justify-center transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 cursor-pointer',
              isNotifOpen
                ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                : 'text-zinc-600 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white'
            )}
            title="Notifikasi"
            aria-label={
              unreadNotifCount > 0
                ? `Notifikasi (${unreadNotifCount} belum dibaca)`
                : 'Notifikasi'
            }
            aria-expanded={isNotifOpen}
            aria-haspopup="dialog"
          >
            <Bell className="size-5" aria-hidden="true" />
            {unreadNotifCount > 0 && (
              <span className="size-2.5 rounded-full bg-black dark:bg-white absolute top-2 right-2 sm:top-2.5 sm:right-2.5 ring-2 ring-white dark:ring-zinc-900" />
            )}
          </button>

          <NotificationModal
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAll}
          />
        </div>

        {/* Borderless Avatar with Dropdown */}
        <div className="relative pl-0.5 sm:pl-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(false)
              setIsDropdownOpen((prev) => !prev)
            }}
            className="size-10 sm:size-11 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200/80 dark:ring-zinc-700/80 flex items-center justify-center transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90 [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.03] active:scale-[0.97] motion-reduce:transition-none motion-reduce:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 select-none cursor-pointer"
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
            aria-label="Menu Akun Pengguna"
            title="Menu Akun Pengguna"
          >
            {/* Dynamic arbitrary avatarUrl with synchronous onError local fallback */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl || '/images/avatars/1.png'}
              alt={displayName}
              className="size-full object-cover select-none pointer-events-none"
              onError={(e) => {
                e.currentTarget.src = '/1.png'
              }}
            />
          </button>

          {/* User Profile Dropdown Menu - Monochrome Black & White */}
          <AnimatePresence>
            {isDropdownOpen && (
              <m.div
                key="header-profile-dropdown"
                role="menu"
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.96,
                        y: -4,
                        transition: { duration: 0.16, ease: EASE_EXIT },
                      }
                }
                transition={{ duration: 0.24, ease: EASE_ENTER }}
                onAnimationStart={() => setIsDropdownAnimating(true)}
                onAnimationComplete={() => setIsDropdownAnimating(false)}
                style={
                  isDropdownAnimating && !prefersReducedMotion
                    ? { willChange: 'transform, opacity' }
                    : undefined
                }
                className={cn(
                  'absolute right-0 top-full mt-2.5 w-[min(18rem,calc(100vw-2rem))] rounded-2xl bg-white dark:bg-zinc-900 p-2 z-50 origin-top-right',
                  'ring-1 ring-zinc-950/[0.06] dark:ring-white/10',
                  'shadow-[0_6px_16px_-4px_rgba(9,9,11,0.08),0_20px_44px_-8px_rgba(9,9,11,0.16),0_32px_64px_-12px_rgba(9,9,11,0.12)] dark:shadow-[0_14px_38px_-6px_rgba(0,0,0,0.7)]'
                )}
              >
                {/* Profile Card Header */}
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 mb-1.5 border border-zinc-100 dark:border-zinc-800">
                  <div className="size-14 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 ring-1 ring-zinc-200/80 dark:ring-zinc-700 shrink-0">
                    {/* Dynamic arbitrary avatarUrl with synchronous onError local fallback */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl || '/images/avatars/1.png'}
                      alt={displayName}
                      className="size-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/1.png'
                      }}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                      {displayName}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {userEmail || 'user@example.com'}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {roleName}
                    </span>
                  </div>
                </div>

                {/* Menu Links */}
                <div className="flex flex-col gap-0.5 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                  <Link
                    href="/dashboard/settings"
                    role="menuitem"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white transition-colors focus-visible:outline-none focus-visible:bg-zinc-100 dark:focus-visible:bg-zinc-800"
                  >
                    <Settings className="size-5 text-zinc-500 dark:text-zinc-400 shrink-0" aria-hidden="true" />
                    <span>Pengaturan Akun</span>
                  </Link>

                  <Link
                    href="/dashboard/roles"
                    role="menuitem"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white transition-colors focus-visible:outline-none focus-visible:bg-zinc-100 dark:focus-visible:bg-zinc-800"
                  >
                    <Shield className="size-5 text-zinc-500 dark:text-zinc-400 shrink-0" aria-hidden="true" />
                    <span>Hak Akses &amp; Role</span>
                  </Link>
                </div>

                <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

                {/* Logout Button */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white transition-colors disabled:opacity-50 text-left cursor-pointer focus-visible:outline-none focus-visible:bg-zinc-100 dark:focus-visible:bg-zinc-800"
                >
                  <LogOut className="size-5 text-zinc-600 dark:text-zinc-400 shrink-0" aria-hidden="true" />
                  <span>{isLoggingOut ? 'Keluar akun...' : 'Logout'}</span>
                </button>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Search & Command Modal Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}
