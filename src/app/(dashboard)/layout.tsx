import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardBreadcrumb } from '@/components/layout/dashboard-breadcrumb'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { NotificationProvider } from '@/components/layout/notification-context'
import { SidebarProvider } from '@/components/layout/sidebar-context'

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
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  let fullName = 'Admin User'
  let roleName = 'Administrator'

  if (profile?.full_name) {
    fullName = profile.full_name
  } else if (user.email) {
    fullName = user.email.split('@')[0]
  }

  const avatarUrl = profile?.avatar_url || '/images/avatars/1.png'

  // 2. Fetch User Role via RPC helper
  const { data: userRole } = await supabase.rpc('get_my_role')
  if (userRole && typeof userRole === 'object' && 'name' in (userRole as Record<string, unknown>)) {
    roleName = String((userRole as Record<string, unknown>).name)
  }

  return (
    <SidebarProvider>
      <NotificationProvider>
        <div className="min-h-screen flex bg-[#f6f6f7] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-zinc-950 transition-colors duration-150">
          {/* Modern Sidebar */}
          <DashboardSidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Topbar Header */}
            <DashboardHeader
              userEmail={user?.email}
              userName={fullName}
              roleName={roleName}
              avatarUrl={avatarUrl}
            />

            {/* Main Content Body */}
            <main className="flex-1 p-4 sm:p-5 md:p-7 overflow-y-auto no-scrollbar">
              <div className="max-w-7xl mx-auto w-full space-y-5">
                <DashboardBreadcrumb />
                {children}
              </div>
            </main>
          </div>
        </div>
      </NotificationProvider>
    </SidebarProvider>
  )
}
