'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaArrowLeft, FaRotate, FaCircleCheck, FaCircleExclamation, FaRegFaceSmile } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/ui/otp-input'
import { toast, AnimatedBrandLogo } from '@/components/ui'

export function OtpVerificationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialEmail = searchParams.get('email') || ''
  const verificationType = (searchParams.get('type') || 'signup') as 'signup' | 'recovery' | 'email'

  const [email] = React.useState(initialEmail)
  const [otp, setOtp] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [resendCooldown, setResendCooldown] = React.useState(60)
  const [isResending, setIsResending] = React.useState(false)

  React.useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: verificationType,
      })

      if (verifyError) {
        const errorMsg = verifyError.message || 'Kode OTP tidak valid atau kedaluwarsa'
        setError(errorMsg)
        toast.error('Verifikasi Gagal', errorMsg)
        return
      }

      // Perbarui updated_at di public.profiles
      const userId = verifyData.user?.id || (await supabase.auth.getUser()).data.user?.id
      if (userId) {
        const nowIso = new Date().toISOString()
        await supabase
          .from('profiles')
          .update({
            updated_at: nowIso,
          })
          .eq('id', userId)
      }

      setSuccessMessage('Verifikasi berhasil!')
      toast.success('Verifikasi Berhasil', 'Mengalihkan...')

      setTimeout(() => {
        if (verificationType === 'recovery') {
          router.push('/reset-password')
        } else {
          window.location.href = '/dashboard'
        }
        router.refresh()
      }, 800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (newVal: string) => {
    setOtp(newVal)
    if (newVal.length === 6 && !isLoading) {
      handleVerify(newVal)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return

    setIsResending(true)
    setError(null)

    try {
      const supabase = createClient()
      let resendError = null

      if (verificationType === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        resendError = error
      } else {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
        })
        resendError = error
      }

      if (resendError) {
        const errorMsg = resendError.message || 'Gagal mengirim ulang kode'
        setError(errorMsg)
        toast.error('Gagal Mengirim', errorMsg)
        return
      }

      setSuccessMessage('Kode OTP baru telah dikirim')
      toast.success('Kode Terkirim', 'Kode OTP baru telah dikirim ke email Anda.')
      setResendCooldown(60)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal mengirim kode'
      setError(errorMsg)
      toast.error('Kesalahan', errorMsg)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Animated Brand Logo Icon */}
      <AnimatedBrandLogo size="lg" className="mb-6" />

      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-semibold tracking-tight leading-tight text-slate-900 dark:text-zinc-50">
          Enter verification code
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1.5 leading-normal max-w-sm">
          We sent a 6-digit code to{' '}
          <span className="font-semibold text-slate-900 dark:text-zinc-100">{email || 'your email'}</span>
        </p>
      </div>

      <div className="w-full space-y-5">
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 font-normal">
            <FaCircleExclamation className="size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <FaCircleCheck className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="py-2">
          <OtpInput
            value={otp}
            onChange={handleOtpChange}
            disabled={isLoading}
            isError={!!error}
          />
        </div>

        <div className="text-center">
          {resendCooldown > 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Resend code in <span className="font-medium text-slate-700 dark:text-zinc-200 tabular-nums">{resendCooldown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 text-xs text-slate-900 dark:text-zinc-100 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
            >
              <FaRotate className="size-3.5" />
              Resend verification code
            </button>
          )}
        </div>

        <Button
          type="button"
          onClick={() => handleVerify()}
          disabled={otp.length !== 6 || isLoading}
          isLoading={isLoading}
          loadingText="Verifying..."
          className="w-full h-11 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-slate-900 dark:hover:bg-zinc-200 text-sm font-medium shadow-sm transition-colors mt-2"
        >
          Verify code
        </Button>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-slate-900 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100 transition-colors"
        >
          <FaArrowLeft className="size-3.5" /> Back to sign in
        </Link>
      </div>
    </div>
  )
}
