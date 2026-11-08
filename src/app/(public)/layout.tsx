import type { ReactNode } from 'react'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur px-6 py-4">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="font-bold text-lg">My CMS</span>
          <div className="flex gap-4 text-sm font-medium">
            <a href="/">Beranda</a>
            <a href="/blog">Blog</a>
            <a href="/about">About</a>
            <a href="/login" className="text-primary">Login</a>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full p-6">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} My CMS. All rights reserved.
      </footer>
    </div>
  )
}
