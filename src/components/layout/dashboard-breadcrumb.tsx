'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface CrumbEntry {
  label: string
  href?: string
}

const SEGMENT_LABELS: Record<string, string> = {
  posts: 'Posts & Articles',
  pages: 'Pages',
  categories: 'Categories',
  tags: 'Tags',
  media: 'Media Library',
  notifications: 'Notifikasi',
  users: 'Users',
  roles: 'Roles & Access',
  'audit-log': 'Audit Log',
  components: 'UI Components',
  settings: 'Settings',
  seo: 'SEO & Meta Tags',
}

function formatFallbackSegment(segment: string): string {
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function resolveDashboardBreadcrumbs(pathname: string): CrumbEntry[] {
  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '') || '/dashboard'

  if (cleanPath === '/dashboard') {
    return [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Overview' },
    ]
  }

  const segments = cleanPath.split('/').filter(Boolean)
  const subSegments = segments[0] === 'dashboard' ? segments.slice(1) : segments

  const crumbs: CrumbEntry[] = [{ label: 'Dashboard', href: '/dashboard' }]
  const section = subSegments[0]

  if (!section) {
    crumbs.push({ label: 'Overview' })
    return crumbs
  }

  const sectionLabel = SEGMENT_LABELS[section] ?? formatFallbackSegment(section)

  if (subSegments.length === 1) {
    crumbs.push({ label: sectionLabel })
    return crumbs
  }

  crumbs.push({ label: sectionLabel, href: `/dashboard/${section}` })

  // Handle known multi-level & dynamic CMS dashboard routes cleanly
  if (section === 'posts') {
    if (subSegments[1] === 'new') {
      crumbs.push({ label: 'Tulis Artikel' })
      return crumbs
    }
    if (subSegments.includes('edit')) {
      crumbs.push({ label: 'Edit Artikel' })
      return crumbs
    }
  }

  if (section === 'pages') {
    if (subSegments[1] === 'new') {
      crumbs.push({ label: 'Buat Halaman' })
      return crumbs
    }
    if (subSegments.includes('edit')) {
      crumbs.push({ label: 'Edit Halaman' })
      return crumbs
    }
  }

  if (section === 'users' && subSegments.length === 2) {
    crumbs.push({ label: 'Detail Pengguna' })
    return crumbs
  }

  // Fallback for additional nested static segments
  const remaining = subSegments.slice(1)
  let cumulativeHref = `/dashboard/${section}`
  remaining.forEach((segment, index) => {
    cumulativeHref += `/${segment}`
    const isLast = index === remaining.length - 1
    const label = SEGMENT_LABELS[segment] ?? formatFallbackSegment(segment)
    crumbs.push(isLast ? { label } : { label, href: cumulativeHref })
  })

  return crumbs
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const crumbs = React.useMemo(
    () => resolveDashboardBreadcrumbs(pathname),
    [pathname]
  )

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isFirst = index === 0
          const isLast = index === crumbs.length - 1

          return (
            <React.Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {!isLast && crumb.href ? (
                  <BreadcrumbLink href={crumb.href}>
                    {isFirst && (
                      <Home className="size-4 text-zinc-500 dark:text-zinc-400 shrink-0" aria-hidden="true" />
                    )}
                    <span>{crumb.label}</span>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

