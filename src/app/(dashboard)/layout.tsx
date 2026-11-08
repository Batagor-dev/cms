import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card p-4 hidden md:block">
        <div className="font-bold text-lg mb-6">CMS Dashboard</div>
        <nav className="flex flex-col gap-2 text-sm">
          <a href="/dashboard" className="px-3 py-2 rounded-md hover:bg-muted font-medium">Ringkasan</a>
          <a href="/dashboard/posts" className="px-3 py-2 rounded-md hover:bg-muted font-medium">Posts</a>
          <a href="/dashboard/pages" className="px-3 py-2 rounded-md hover:bg-muted font-medium">Pages</a>
          <a href="/dashboard/categories" className="px-3 py-2 rounded-md hover:bg-muted font-medium">Categories</a>
          <a href="/dashboard/tags" className="px-3 py-2 rounded-md hover:bg-muted font-medium">Tags</a>
          <a href="/dashboard/media" className="px-3 py-2 rounded-md hover:bg-muted font-medium">Media</a>
          <a href="/dashboard/users" className="px-3 py-2 rounded-md hover:bg-muted font-medium">Users</a>
          <a href="/dashboard/roles" className="px-3 py-2 rounded-md hover:bg-muted font-medium">Roles</a>
          <a href="/dashboard/audit-log" className="px-3 py-2 rounded-md hover:bg-muted font-medium">Audit Log</a>
          <a href="/dashboard/settings" className="px-3 py-2 rounded-md hover:bg-muted font-medium">Settings</a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 border-b px-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Admin Workspace</div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Admin User</span>
          </div>
        </header>

        <main className="flex-1 p-6 bg-muted/20">{children}</main>
      </div>
    </div>
  )
}
