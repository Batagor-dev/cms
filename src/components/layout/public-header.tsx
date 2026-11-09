'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { publicNav } from '@/config/navigation'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavLinksProps {
  pathname: string
  variant: 'desktop' | 'mobile'
  isMobileOpen?: boolean
  onNavigate?: () => void
}

function NavLinksView({
  pathname,
  variant,
  isMobileOpen = false,
  onNavigate,
}: NavLinksProps) {
  if (variant === 'desktop') {
    return (
      <>
        {publicNav.map((item) => {
          const isActive =
            pathname !== '' &&
            (item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1 py-0.5',
                isActive
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground'
              )}
            >
              {item.title}
            </Link>
          )
        })}
      </>
    )
  }

  return (
    <>
      {publicNav.map((item) => {
        const isActive =
          pathname !== '' &&
          (item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            tabIndex={isMobileOpen ? undefined : -1}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'px-3 py-2.5 rounded-xl text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-muted text-foreground font-semibold'
                : 'text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted/60 [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground font-medium'
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </>
  )
}

function ActiveNavLinks({
  variant,
  isMobileOpen = false,
  onNavigate,
}: Omit<NavLinksProps, 'pathname'>) {
  const pathname = usePathname()
  return (
    <NavLinksView
      pathname={pathname}
      variant={variant}
      isMobileOpen={isMobileOpen}
      onNavigate={onNavigate}
    />
  )
}

export function PublicHeader() {
  const [isOpen, setIsOpen] = React.useState(false)

  const closeMenu = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  // Auto-close mobile nav if viewport expands to desktop (md >= 768px)
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handleViewportChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsOpen(false)
      }
    }
    mq.addEventListener('change', handleViewportChange)
    return () => mq.removeEventListener('change', handleViewportChange)
  }, [])

  // Close mobile nav on Escape
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-3.5 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            onClick={closeMenu}
            className="font-semibold text-lg tracking-tight leading-none text-foreground truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            Techarea Production
          </Link>

          {/* Desktop Navigation (md+) */}
          <nav
            aria-label="Navigasi Publik"
            className="hidden md:flex items-center gap-5 text-sm font-medium"
          >
            <React.Suspense
              fallback={<NavLinksView pathname="" variant="desktop" />}
            >
              <ActiveNavLinks variant="desktop" />
            </React.Suspense>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-9 px-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90 active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Login
            </Link>
            <ThemeToggle surface="bordered" />
          </nav>

          {/* Mobile Controls (< md) */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <ThemeToggle surface="bordered" />
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-controls="public-mobile-menu"
              aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              title={isOpen ? 'Tutup Menu' : 'Buka Menu'}
              className="size-10 rounded-xl border border-border bg-background text-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted flex items-center justify-center transition-[background-color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              {isOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Menu (< md) - GPU Grid Transition */}
        <div
          id="public-mobile-menu"
          className={cn(
            'md:hidden grid transition-[grid-template-rows,opacity] duration-250 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
            isOpen ? 'grid-rows-[1fr] opacity-100 pt-3' : 'grid-rows-[0fr] opacity-0'
          )}
          aria-hidden={!isOpen}
        >
          <div className="overflow-hidden">
            <nav
              aria-label="Navigasi Publik Mobile"
              className="flex flex-col gap-1 pt-2 border-t border-border"
            >
              <React.Suspense
                fallback={
                  <NavLinksView
                    pathname=""
                    variant="mobile"
                    isMobileOpen={isOpen}
                    onNavigate={closeMenu}
                  />
                }
              >
                <ActiveNavLinks
                  variant="mobile"
                  isMobileOpen={isOpen}
                  onNavigate={closeMenu}
                />
              </React.Suspense>
              <Link
                href="/login"
                tabIndex={isOpen ? undefined : -1}
                onClick={closeMenu}
                className="mt-1 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium text-center transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
