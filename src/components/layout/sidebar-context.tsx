'use client'

import * as React from 'react'

interface SidebarContextValue {
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
  isMobileOpen: boolean
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleMobileSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const toggleSidebar = React.useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const openMobileSidebar = React.useCallback(() => {
    setIsMobileOpen(true)
  }, [])

  const closeMobileSidebar = React.useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  const toggleMobileSidebar = React.useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const value = React.useMemo(
    () => ({
      isCollapsed,
      setIsCollapsed,
      toggleSidebar,
      isMobileOpen,
      setIsMobileOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
    }),
    [
      isCollapsed,
      toggleSidebar,
      isMobileOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
    ]
  )

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

