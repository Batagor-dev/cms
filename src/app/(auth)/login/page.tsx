import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/components'

export const metadata = {
  title: 'Masuk | My CMS',
  description: 'Masuk ke dashboard akun My CMS',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat form login...</div>}>
      <LoginForm />
    </Suspense>
  )
}
