import type { ReactNode } from 'react'
import { PublicHeader } from '@/components/layout/public-header'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6">{children}</main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © 2026 Techarea Production. All rights reserved.
      </footer>
    </div>
  )
}
