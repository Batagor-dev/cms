import type { ReactNode } from 'react'
import { AuthShowcase } from '@/features/auth/components/auth-showcase'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 transition-colors">
      <div className="fixed top-4 right-4 z-40">
        <ThemeToggle surface="bordered" />
      </div>

      {/* Left Column: Auth Forms */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 w-full max-w-xl mx-auto">
        <div className="w-full max-w-[380px] space-y-6">
          {children}
        </div>
      </div>

      {/* Right Column: AI Labs Showcase */}
      <AuthShowcase />
    </div>
  )
}
