'use client'

import * as React from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

export interface ThemeContextValue {
  state: {
    theme: ThemeMode
    resolvedTheme: ResolvedTheme
    mounted: boolean
  }
  actions: {
    setTheme: (theme: ThemeMode) => void
    toggleTheme: () => void
  }
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const themeListeners = new Set<() => void>()

function emitThemeStoreChange() {
  for (const listener of themeListeners) {
    listener()
  }
}

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    return raw === 'light' || raw === 'dark' ? raw : 'system'
  } catch {
    return 'system'
  }
}

function readSystemDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function computeResolvedTheme(theme: ThemeMode, systemDark: boolean): ResolvedTheme {
  if (theme === 'system') {
    return systemDark ? 'dark' : 'light'
  }
  return theme
}

export function syncDocumentTheme(theme: ThemeMode, resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('light', resolved === 'light')

  const meta = document.querySelector('meta[name="color-scheme"]')
  if (meta) {
    meta.setAttribute('content', theme === 'system' ? 'light dark' : theme)
  }
}

function subscribeThemeStore(listener: () => void): () => void {
  themeListeners.add(listener)

  if (typeof window === 'undefined') {
    return () => {
      themeListeners.delete(listener)
    }
  }

  const mediaQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null

  const handleExternalChange = () => {
    const nextTheme = readStoredTheme()
    const nextResolved = computeResolvedTheme(nextTheme, readSystemDark())
    syncDocumentTheme(nextTheme, nextResolved)
    emitThemeStoreChange()
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) {
      handleExternalChange()
    }
  }

  mediaQuery?.addEventListener('change', handleExternalChange)
  window.addEventListener('storage', handleStorageChange)

  return () => {
    themeListeners.delete(listener)
    mediaQuery?.removeEventListener('change', handleExternalChange)
    window.removeEventListener('storage', handleStorageChange)
  }
}

function getThemeModeSnapshot(): ThemeMode {
  return readStoredTheme()
}

function getServerThemeModeSnapshot(): ThemeMode {
  return 'system'
}

function getResolvedThemeSnapshot(): ResolvedTheme {
  return computeResolvedTheme(readStoredTheme(), readSystemDark())
}

function getServerResolvedThemeSnapshot(): ResolvedTheme {
  return 'light'
}

const emptySubscribe = () => () => {}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(
    subscribeThemeStore,
    getThemeModeSnapshot,
    getServerThemeModeSnapshot
  )
  const resolvedTheme = React.useSyncExternalStore(
    subscribeThemeStore,
    getResolvedThemeSnapshot,
    getServerResolvedThemeSnapshot
  )
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  // Ensure DOM class & meta stay synchronized (including dev StrictMode remounts)
  React.useLayoutEffect(() => {
    syncDocumentTheme(theme, resolvedTheme)
  }, [theme, resolvedTheme])

  const setTheme = React.useCallback((nextTheme: ThemeMode) => {
    if (typeof window !== 'undefined') {
      try {
        if (nextTheme === 'system') {
          window.localStorage.removeItem(THEME_STORAGE_KEY)
        } else {
          window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
        }
      } catch {
        // Ignore storage restrictions (private mode / blocked site data)
      }
    }

    const nextResolved = computeResolvedTheme(nextTheme, readSystemDark())
    syncDocumentTheme(nextTheme, nextResolved)
    emitThemeStoreChange()
  }, [])

  const toggleTheme = React.useCallback(() => {
    const currentResolved = computeResolvedTheme(readStoredTheme(), readSystemDark())
    const target: ResolvedTheme = currentResolved === 'dark' ? 'light' : 'dark'
    const systemResolved: ResolvedTheme = readSystemDark() ? 'dark' : 'light'

    // If user toggles back to match OS preference, revert to 'system' so OS changes resume tracking
    setTheme(target === systemResolved ? 'system' : target)
  }, [setTheme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      state: { theme, resolvedTheme, mounted },
      actions: { setTheme, toggleTheme },
    }),
    [theme, resolvedTheme, mounted, setTheme, toggleTheme]
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const context = React.use(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

