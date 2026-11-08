'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast, AnimatedBrandLogo } from '@/components/ui'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(true)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [socialLoading, setSocialLoading] = React.useState<'google' | 'github' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        const errStr = (authError.message || '').toLowerCase()
        const errCode = ((authError as unknown as { code?: string })?.code || '').toLowerCase()
        if (
          errStr.includes('email not confirmed') ||
          errStr.includes('email_not_confirmed') ||
          errStr.includes('unconfirmed') ||
          errCode === 'email_not_confirmed'
        ) {
          toast.info(
            'Verifikasi Email Diperlukan',
            'Akun belum diverifikasi. Silakan masukkan 6 digit kode OTP dari email Anda.'
          )
          router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=signup`)
          return
        }
        toast.error('Gagal Masuk', 'Email atau kata sandi salah. Silakan periksa kembali akun Anda.')
        return
      }

      toast.success('Berhasil Masuk', 'Selamat datang kembali! Mengalihkan ke dashboard...')
      setTimeout(() => {
        window.location.href = nextUrl
      }, 500)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
      toast.error('Gagal Masuk', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setSocialLoading(provider)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      })
      if (oauthError) {
        toast.error('Gagal Masuk', oauthError.message)
        setSocialLoading(null)
      }
    } catch {
      toast.error('Gagal Masuk', 'Failed to connect to authentication provider.')
      setSocialLoading(null)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Animated Brand Logo Icon */}
      <AnimatedBrandLogo size="md" className="mb-6" />

      {/* Header Text */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome to AI Labs
        </h1>
        <p className="text-xs text-slate-500 mt-1.5">
          Please sign in or sign up with your Google account.
        </p>
      </div>

      {/* Social Buttons */}
      <div className="w-full space-y-2.5">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={isLoading || socialLoading !== null}
          className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium flex items-center justify-center relative transition-colors cursor-pointer shadow-xs disabled:opacity-60"
        >
          <div className="absolute left-3 size-6 rounded-md bg-slate-950 text-white flex items-center justify-center">
            <FaGoogle className="size-3 text-white" />
          </div>
          <span>{socialLoading === 'google' ? 'Connecting...' : 'Sign in with Google'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuth('github')}
          disabled={isLoading || socialLoading !== null}
          className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium flex items-center justify-center relative transition-colors cursor-pointer shadow-xs disabled:opacity-60"
        >
          <div className="absolute left-3 size-6 rounded-md bg-slate-950 text-white flex items-center justify-center">
            <FaGithub className="size-3.5 text-white" />
          </div>
          <span>{socialLoading === 'github' ? 'Connecting...' : 'Sign in with GitHub'}</span>
        </button>
      </div>

      {/* OR Divider */}
      <div className="relative w-full my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
            OR
          </span>
        </div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-slate-800"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="grace@org.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-slate-800"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 pl-3.5 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 cursor-pointer z-20 rounded-lg transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <FaEyeSlash className="size-4 text-slate-700" />
              ) : (
                <FaEye className="size-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password Row */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="text-xs text-slate-600">Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-slate-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Continue Button */}
        <Button
          type="submit"
          isLoading={isLoading}
          loadingText="Continuing..."
          className="w-full h-11 rounded-xl bg-slate-950 text-white hover:bg-slate-900 text-sm font-medium shadow-sm transition-colors mt-2"
        >
          Continue
        </Button>
      </form>

      {/* Footer Support / Register Link */}
      <div className="mt-8 text-center">
        <Link
          href="/register"
          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Don&apos;t have an account? <span className="text-slate-950 font-semibold underline">Sign up</span>
        </Link>
        <div className="mt-2">
          <a
            href="mailto:support@domain.com"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Have trouble signing in?
          </a>
        </div>
      </div>
    </div>
  )
}
