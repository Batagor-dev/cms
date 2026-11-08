'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaArrowLeft, FaCircleExclamation, FaRegFaceSmile } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast, AnimatedBrandLogo } from '@/components/ui'

export function ForgotPasswordForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)

      if (resetError) {
        const errorMsg = resetError.message || 'Gagal mengirim instruksi pemulihan.'
        setError(errorMsg)
        toast.error('Gagal Mengirim', errorMsg)
        return
      }

      toast.success('Kode OTP Terkirim', 'Kode pemulihan sandi telah dikirim ke email.')
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=recovery`)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
      setError(errorMsg)
      toast.error('Kesalahan', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Animated Brand Logo Icon */}
      <AnimatedBrandLogo size="md" className="mb-6" />

      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Reset your password
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 max-w-xs">
          Enter your email address and we&apos;ll send you a 6-digit verification code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-1.5 text-left">
          <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-800">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="grace@org.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-1.5 pt-1 text-xs text-rose-500 font-normal">
            <FaCircleExclamation className="size-3 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          loadingText="Sending code..."
          className="w-full h-11 rounded-xl bg-slate-950 text-white hover:bg-slate-900 text-sm font-medium shadow-sm transition-colors mt-2"
        >
          Send verification code
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <FaArrowLeft className="size-3" /> Back to sign in
        </Link>
      </div>
    </div>
  )
}
