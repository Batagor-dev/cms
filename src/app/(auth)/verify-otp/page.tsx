import { Suspense } from 'react'
import { OtpVerificationForm } from '@/features/auth/components'

export const metadata = {
  title: 'Verifikasi OTP | My CMS',
  description: 'Verifikasi kode OTP akun My CMS',
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat form verifikasi...</div>}>
      <OtpVerificationForm />
    </Suspense>
  )
}

