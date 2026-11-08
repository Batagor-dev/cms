import type { ReactNode } from 'react'
import { AuthShowcase } from '@/features/auth/components/auth-showcase'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
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
