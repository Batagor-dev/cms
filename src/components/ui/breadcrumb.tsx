import * as React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
  ref?: React.Ref<HTMLElement>
}

export function Breadcrumb({ className, ref, ...props }: BreadcrumbProps) {
  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn('w-full', className)}
      {...props}
    />
  )
}

export interface BreadcrumbListProps extends React.ComponentPropsWithoutRef<'ol'> {
  ref?: React.Ref<HTMLOListElement>
}

export function BreadcrumbList({ className, ref, ...props }: BreadcrumbListProps) {
  return (
    <ol
      ref={ref}
      className={cn(
        'inline-flex flex-wrap items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs text-xs text-zinc-500 dark:text-zinc-400 max-w-full break-words transition-colors duration-150',
        className
      )}
      {...props}
    />
  )
}

export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<'li'> {
  ref?: React.Ref<HTMLLIElement>
}

export function BreadcrumbItem({ className, ref, ...props }: BreadcrumbItemProps) {
  return (
    <li
      ref={ref}
      className={cn('inline-flex items-center gap-1.5 min-w-0', className)}
      {...props}
    />
  )
}

export interface BreadcrumbLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link> {
  ref?: React.Ref<HTMLAnchorElement>
}

export function BreadcrumbLink({
  className,
  ref,
  ...props
}: BreadcrumbLinkProps) {
  return (
    <Link
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium text-zinc-500 dark:text-zinc-400 transition-[background-color,color] duration-150 rounded-lg px-2 py-1 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25',
        className
      )}
      {...props}
    />
  )
}

export interface BreadcrumbPageProps extends React.ComponentPropsWithoutRef<'span'> {
  ref?: React.Ref<HTMLSpanElement>
}

export function BreadcrumbPage({ className, ref, ...props }: BreadcrumbPageProps) {
  return (
    <span
      ref={ref}
      aria-current="page"
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-lg bg-zinc-100/90 dark:bg-zinc-800 font-semibold text-zinc-950 dark:text-zinc-100 truncate max-w-[220px] sm:max-w-xs',
        className
      )}
      {...props}
    />
  )
}

export interface BreadcrumbSeparatorProps
  extends React.ComponentPropsWithoutRef<'li'> {
  ref?: React.Ref<HTMLLIElement>
}

export function BreadcrumbSeparator({
  children,
  className,
  ref,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn('text-zinc-500 dark:text-zinc-400 inline-flex items-center select-none', className)}
      {...props}
    >
      {children ?? <ChevronRight className="size-4" aria-hidden="true" />}
    </li>
  )
}
