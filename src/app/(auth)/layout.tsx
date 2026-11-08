import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md p-6 bg-background rounded-lg border shadow-sm">
        {children}
      </div>
    </div>
  )
}
