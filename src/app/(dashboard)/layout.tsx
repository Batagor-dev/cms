import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { AnimatedBrandLogo } from '@/components/ui'
import {
  LayoutDashboard,
  FileText,
  Files,
  FolderTree,
  Tags,
  Image as ImageIcon,
  Users,
  Shield,
  History,
  Settings,
} from 'lucide-react'

export const instant = false

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  let fullName = 'Admin User'
  let roleName = 'Administrator'

  if (profile?.full_name) {
    fullName = profile.full_name
  } else if (user.email) {
    fullName = user.email.split('@')[0]
  }

  // 2. Fetch User Role via RPC helper
  const { data: userRole } = await supabase.rpc('get_my_role')
  if (userRole && typeof userRole === 'object' && 'name' in (userRole as Record<string, unknown>)) {
    roleName = String((userRole as Record<string, unknown>).name)
  }

  const navItems = [
    { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { href: '/dashboard/posts', label: 'Posts', icon: FileText },
    { href: '/dashboard/pages', label: 'Pages', icon: Files },
    { href: '/dashboard/categories', label: 'Categories', icon: FolderTree },
    { href: '/dashboard/tags', label: 'Tags', icon: Tags },
    { href: '/dashboard/media', label: 'Media', icon: ImageIcon },
    { href: '/dashboard/users', label: 'Users', icon: Users },
    { href: '/dashboard/roles', label: 'Roles', icon: Shield },
    { href: '/dashboard/audit-log', label: 'Audit Log', icon: History },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200/80 bg-white p-5 hidden md:flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 mb-7 px-2">
            <AnimatedBrandLogo size="sm" />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight">
                AI Labs CMS
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Management Studio
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 text-xs font-semibold flex items-center gap-3 transition-colors"
                >
                  <Icon className="size-4 text-slate-400 group-hover:text-slate-900" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="pt-4 border-t border-slate-100 px-2 text-[11px] text-slate-400">
          AI Labs v0.1.0 • Supabase RBAC
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header with User Info & Logout Button */}
        <DashboardHeader
          userEmail={user?.email}
          userName={fullName}
          roleName={roleName}
        />

        {/* Main Content Page */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
