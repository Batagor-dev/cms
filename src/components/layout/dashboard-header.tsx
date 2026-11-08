'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui'

interface DashboardHeaderProps {
  userEmail?: string | null
  userName?: string | null
  roleName?: string | null
}

export function DashboardHeader({
  userEmail,
  userName,
  roleName = 'Administrator',
}: DashboardHeaderProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const displayName = userName || userEmail?.split('@')[0] || 'Admin User'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error('Gagal Keluar', error.message)
        setIsLoggingOut(false)
        return
      }

      toast.success('Berhasil Keluar', 'Sampai jumpa kembali!')
      // Refresh router and redirect to login
      router.push('/login')
      router.refresh()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat logout'
      toast.error('Gagal Keluar', errorMsg)
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Area: Workspace Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Admin Workspace
          </span>
        </div>
      </div>

      {/* Right Area: User Profile & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
          <div className="size-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold tracking-tight shadow-xs">
            {initials || <UserIcon className="size-4" />}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              {displayName}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield className="size-2.5 text-slate-400" />
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                {roleName || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="h-9 px-3 sm:px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 active:bg-rose-100 text-slate-700 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          title="Keluar dari akun"
          aria-label="Logout"
        >
          <LogOut className="size-3.5 text-slate-500 group-hover:text-rose-600 transition-colors" />
          <span className="hidden sm:inline font-semibold">
            {isLoggingOut ? 'Keluar...' : 'Logout'}
          </span>
        </button>
      </div>
    </header>
  )
}

