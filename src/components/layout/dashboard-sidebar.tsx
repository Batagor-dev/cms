'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import {
  LayoutDashboard,
  FileText,
  Files,
  FolderTree,
  Tags,
  Image as ImageIcon,
  Users,
  Shield,
  History,
  Settings,
  MessageSquare,
  Bell,
  Layers,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'
import { AnimatedBrandLogo } from '@/components/ui'
import { useSidebar } from '@/components/layout/sidebar-context'
import { useNotifications } from '@/components/layout/notification-context'

interface SidebarNavGroup {
  label: string
  items: {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string | number
  }[]
}

const navGroups: SidebarNavGroup[] = [
  {
    label: 'Management',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/posts', label: 'Posts & Articles', icon: FileText },
      { href: '/dashboard/pages', label: 'Pages', icon: Files },
      { href: '/dashboard/categories', label: 'Categories', icon: FolderTree },
      { href: '/dashboard/tags', label: 'Tags', icon: Tags },
    ],
  },
  {
    label: 'Interaction & Media',
    items: [
      { href: '/dashboard/media', label: 'Media Library', icon: ImageIcon },
      { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      { href: '/dashboard/posts', label: 'Feedback & Request', icon: MessageSquare, badge: 12 },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/dashboard/users', label: 'Users', icon: Users },
      { href: '/dashboard/roles', label: 'Roles & Access', icon: Shield },
      { href: '/dashboard/audit-log', label: 'Audit Log', icon: History },
      { href: '/dashboard/components', label: 'UI Components', icon: Layers },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
]

interface SidebarNavListProps {
  pathname: string
  isExpanded: boolean
  unreadCount: number
  prefersReducedMotion: boolean | null
  onNavigate?: () => void
  animateLabels?: boolean
}

function SidebarNavList({
  pathname,
  isExpanded,
  unreadCount,
  prefersReducedMotion,
  onNavigate,
  animateLabels = true,
}: SidebarNavListProps) {
  const labelInitial =
    !animateLabels || prefersReducedMotion ? false : { opacity: 0, x: -6 }
  const labelAnimate = { opacity: 1, x: 0 }
  const labelExit =
    !animateLabels || prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -4 }

  return (
    <nav className="flex flex-col gap-4 w-full" aria-label="Menu Utama">
      {navGroups.map((group, groupIdx) => (
        <div key={group.label} className="flex flex-col gap-1 w-full">
          {/* Constant height slot prevents vertical icon jumps when collapsing/expanding */}
          <div className="h-5 mb-1 relative flex items-center overflow-hidden">
            {animateLabels ? (
              <AnimatePresence initial={false} mode="wait">
                {isExpanded ? (
                  <m.span
                    key={`group-label-${group.label}`}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -4 }}
                    transition={{ duration: 0.18, ease: EASE_ENTER }}
                    className="px-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
                  >
                    {group.label}
                  </m.span>
                ) : groupIdx > 0 ? (
                  <m.div
                    key={`group-divider-${group.label}`}
                    initial={prefersReducedMotion ? false : { opacity: 0, scaleX: 0.6 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scaleX: 0.6 }}
                    transition={{ duration: 0.16, ease: EASE_EXIT }}
                    className="w-full mx-2 h-px bg-zinc-200/70 dark:bg-zinc-800 origin-center"
                  />
                ) : null}
              </AnimatePresence>
            ) : (
              <span className="px-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                {group.label}
              </span>
            )}
          </div>

          {group.items.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            const badgeValue =
              item.href === '/dashboard/notifications'
                ? unreadCount > 0
                  ? unreadCount
                  : undefined
                : item.badge

            return (
              <Link
                key={`${group.label}-${item.label}`}
                href={item.href}
                onClick={onNavigate}
                aria-label={
                  !isExpanded
                    ? badgeValue !== undefined
                      ? `${item.label} (${badgeValue})`
                      : item.label
                    : undefined
                }
                className={cn(
                  'h-11 pl-3.5 rounded-xl text-sm flex items-center overflow-hidden whitespace-nowrap group select-none',
                  'transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-colors',
                  'active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25',
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800/80 font-medium'
                )}
                title={
                  !isExpanded
                    ? badgeValue !== undefined
                      ? `${item.label} (${badgeValue})`
                      : item.label
                    : undefined
                }
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'size-5 shrink-0 transition-colors duration-200',
                    isActive
                      ? 'text-white dark:text-zinc-950'
                      : 'text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-zinc-900 dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover:text-white'
                  )}
                />

                {animateLabels ? (
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <m.div
                        key={`nav-label-${group.label}-${item.label}`}
                        initial={labelInitial}
                        animate={labelAnimate}
                        exit={labelExit}
                        transition={{ duration: 0.2, ease: EASE_ENTER }}
                        className="flex items-center justify-between gap-2 flex-1 min-w-0 ml-3 pr-3 overflow-hidden"
                      >
                        <span className="truncate">{item.label}</span>

                        {badgeValue !== undefined && (
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded-md text-xs font-semibold shadow-xs shrink-0 tabular-nums leading-none',
                              isActive
                                ? 'bg-white/20 text-white dark:bg-zinc-950/15 dark:text-zinc-950'
                                : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                            )}
                          >
                            {badgeValue}
                          </span>
                        )}
                      </m.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="flex items-center justify-between gap-2 flex-1 min-w-0 ml-3 pr-3 overflow-hidden">
                    <span className="truncate">{item.label}</span>

                    {badgeValue !== undefined && (
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded-md text-xs font-semibold shadow-xs shrink-0 tabular-nums leading-none',
                          isActive
                            ? 'bg-white/20 text-white dark:bg-zinc-950/15 dark:text-zinc-950'
                            : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                        )}
                      >
                        {badgeValue}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useSidebar()
  const { unreadCount } = useNotifications()
  const prefersReducedMotion = useReducedMotion()
  const [isDrawerAnimating, setIsDrawerAnimating] = React.useState(false)
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)
  const isExpanded = !isCollapsed

  // Auto-close mobile drawer when viewport switches to desktop (`lg` >= 1024px)
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handleViewportChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        closeMobileSidebar()
      }
    }
    mq.addEventListener('change', handleViewportChange)
    return () => mq.removeEventListener('change', handleViewportChange)
  }, [closeMobileSidebar])

  // Escape key & body scroll lock while mobile drawer is open
  React.useEffect(() => {
    if (!isMobileOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const rafId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileOpen, closeMobileSidebar])

  const labelInitial = prefersReducedMotion ? false : { opacity: 0, x: -6 }
  const labelAnimate = { opacity: 1, x: 0 }
  const labelExit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -4 }

  return (
    <>
      {/* Desktop Sticky Collapsible Sidebar (lg+) */}
      <aside
        aria-label="Navigasi Sidebar"
        className={cn(
          'hidden lg:flex sticky top-0 h-screen border-r border-zinc-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 flex-col shrink-0 overflow-x-hidden overflow-y-auto no-scrollbar z-30 px-4 py-5',
          'transition-[background-color,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          isExpanded ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex flex-col gap-6 w-full">
          {/* Brand Header (Logo centered at fixed x=40px so collapse/expand never jumps) */}
          <div className="flex items-center h-11 w-full overflow-hidden">
            <Link
              href="/dashboard"
              aria-label="Techarea Production CMS"
              className="flex items-center w-full pl-0.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 rounded-xl"
              title={!isExpanded ? 'Techarea Production CMS' : undefined}
            >
              <AnimatedBrandLogo size="md" className="shrink-0" />
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <m.div
                    key="sidebar-brand-text"
                    initial={labelInitial}
                    animate={labelAnimate}
                    exit={labelExit}
                    transition={{ duration: 0.22, ease: EASE_ENTER }}
                    className="flex flex-col whitespace-nowrap overflow-hidden ml-3 min-w-0"
                  >
                    <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                      Techarea{' '}
                      <span className="text-black dark:text-white font-bold">Production</span>
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      CMS
                    </span>
                  </m.div>
                )}
              </AnimatePresence>
            </Link>
          </div>

          <SidebarNavList
            pathname={pathname}
            isExpanded={isExpanded}
            unreadCount={unreadCount}
            prefersReducedMotion={prefersReducedMotion}
            animateLabels
          />
        </div>
      </aside>

      {/* Mobile & Tablet Slide-Over Drawer Sidebar (< lg) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop Overlay */}
            <m.div
              key="mobile-sidebar-backdrop"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.18, ease: EASE_EXIT } }}
              transition={{ duration: 0.22, ease: EASE_ENTER }}
              onClick={closeMobileSidebar}
              aria-hidden="true"
              className="fixed inset-0 bg-black/50 dark:bg-black/75"
            />

            {/* Slide-Over Panel */}
            <m.aside
              id="mobile-dashboard-sidebar"
              key="mobile-sidebar-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigasi Sidebar Mobile"
              initial={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { x: '-100%', transition: { duration: 0.2, ease: EASE_EXIT } }
              }
              transition={{ duration: 0.28, ease: EASE_ENTER }}
              onAnimationStart={() => setIsDrawerAnimating(true)}
              onAnimationComplete={() => setIsDrawerAnimating(false)}
              style={
                isDrawerAnimating && !prefersReducedMotion
                  ? { willChange: 'transform' }
                  : undefined
              }
              className="fixed inset-y-0 left-0 z-10 w-[min(85vw,18rem)] border-r border-zinc-200/80 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col px-4 py-5 overflow-y-auto no-scrollbar"
            >
              <div className="flex flex-col gap-6 w-full">
                {/* Drawer Brand Header + Close Button */}
                <div className="flex items-center justify-between gap-2 h-11 w-full">
                  <Link
                    href="/dashboard"
                    onClick={closeMobileSidebar}
                    aria-label="Techarea Production CMS"
                    className="flex items-center min-w-0 pl-0.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                  >
                    <AnimatedBrandLogo size="md" className="shrink-0" />
                    <div className="flex flex-col ml-3 min-w-0">
                      <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                        Techarea{' '}
                        <span className="text-black dark:text-white font-bold">Production</span>
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        CMS
                      </span>
                    </div>
                  </Link>

                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={closeMobileSidebar}
                    aria-label="Tutup menu navigasi"
                    title="Tutup Menu"
                    className="size-10 shrink-0 rounded-xl bg-zinc-100/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200/80 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-700 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white flex items-center justify-center transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 cursor-pointer"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>

                <SidebarNavList
                  pathname={pathname}
                  isExpanded
                  unreadCount={unreadCount}
                  prefersReducedMotion={prefersReducedMotion}
                  onNavigate={closeMobileSidebar}
                  animateLabels={false}
                />
              </div>
            </m.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
