import { Suspense } from 'react'
import { AuthFormSkeleton } from '@/components/ui/skeleton'
import { OtpVerificationForm } from '@/features/auth/components'

export const metadata = {
  title: 'Verifikasi OTP | My CMS',
  description: 'Verifikasi kode OTP akun My CMS',
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton variant="otp" />}>
      <OtpVerificationForm />
    </Suspense>
  )
}

