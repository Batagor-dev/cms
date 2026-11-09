import { Suspense } from 'react'
import { AuthFormSkeleton } from '@/components/ui/skeleton'
import { LoginForm } from '@/features/auth/components'

export const metadata = {
  title: 'Masuk | My CMS',
  description: 'Masuk ke dashboard akun My CMS',
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton variant="login" />}>
      <LoginForm />
    </Suspense>
  )
}
