'use client'

import * as React from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme, type ThemeMode } from '@/components/theme/theme-provider'

export interface ThemeToggleProps {
  variant?: 'icon' | 'segmented'
  surface?: 'ghost' | 'bordered'
  className?: string
  ref?: React.Ref<HTMLButtonElement | HTMLDivElement>
}

const SEGMENT_OPTIONS: {
  value: ThemeMode
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
  { value: 'system', label: 'Sistem', icon: Monitor },
]

export function ThemeToggle({
  variant = 'icon',
  surface = 'ghost',
  className,
  ref,
}: ThemeToggleProps) {
  const {
    state: { theme, resolvedTheme, mounted },
    actions: { setTheme, toggleTheme },
  } = useTheme()

  if (variant === 'segmented') {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="radiogroup"
        aria-label="Pilih tema tampilan"
        className={cn(
          'inline-flex items-center p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-900/90 gap-0.5',
          className
        )}
      >
        {SEGMENT_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isActive = mounted && theme === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25',
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100'
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{opt.label}</span>
              {mounted && opt.value === 'system' && theme === 'system' && (
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  ({resolvedTheme === 'dark' ? 'Gelap' : 'Terang'})
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={toggleTheme}
      title={
        mounted
          ? resolvedTheme === 'dark'
            ? 'Beralih ke Mode Terang'
            : 'Beralih ke Mode Gelap'
          : 'Ganti Tema Tampilan'
      }
      className={cn(
        'size-10 sm:size-11 rounded-full flex items-center justify-center cursor-pointer transition-[background-color,color,border-color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25',
        surface === 'bordered'
          ? 'border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 shadow-xs [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white'
          : 'text-zinc-600 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white',
        className
      )}
    >
      {/* Light mode: show Moon icon to switch to dark */}
      <Moon className="size-5 block dark:hidden" aria-hidden="true" />
      {/* Dark mode: show Sun icon to switch to light */}
      <Sun className="size-5 hidden dark:block" aria-hidden="true" />
      <span className="sr-only dark:hidden">Aktifkan mode gelap</span>
      <span className="sr-only hidden dark:inline">Aktifkan mode terang</span>
    </button>
  )
}
