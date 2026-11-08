'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaGoogle, FaGithub, FaEye, FaEyeSlash, FaCircleExclamation } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast, AnimatedBrandLogo } from '@/components/ui'

export function RegisterForm() {
  const router = useRouter()

  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [socialLoading, setSocialLoading] = React.useState<'google' | 'github' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      const msg = 'Kata sandi minimal 8 karakter'
      setError(msg)
      toast.error('Validasi Gagal', msg)
      return
    }

    if (password !== confirmPassword) {
      const msg = 'Konfirmasi kata sandi tidak cocok'
      setError(msg)
      toast.error('Validasi Gagal', msg)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        const errorMsg = signUpError.message || 'Pendaftaran akun gagal'
        setError(errorMsg)
        toast.error('Pendaftaran Gagal', errorMsg)
        return
      }

      if (data.session) {
        toast.success('Pendaftaran Berhasil', 'Selamat datang! Mengalihkan ke dashboard...')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
        return
      }

      toast.success(
        'Pendaftaran Berhasil',
        'Silakan periksa email Anda atau masukkan kode OTP verifikasi.'
      )
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=signup`)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
      setError(errorMsg)
      toast.error('Kesalahan', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setSocialLoading(provider)
    setError(null)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      })
      if (oauthError) {
        setError(oauthError.message)
        setSocialLoading(null)
      }
    } catch {
      setError('Failed to connect to authentication provider.')
      setSocialLoading(null)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Animated Brand Logo Icon */}
      <AnimatedBrandLogo size="md" className="mb-6" />

      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create an account
        </h1>
        <p className="text-xs text-slate-500 mt-1.5">
          Sign up with your preferred provider or email
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
          <span>{socialLoading === 'google' ? 'Connecting...' : 'Sign up with Google'}</span>
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
          <span>{socialLoading === 'github' ? 'Connecting...' : 'Sign up with GitHub'}</span>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-3.5">
        <div className="space-y-1.5 text-left">
          <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-800">
            Full Name
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            placeholder="Grace Hopper"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-800">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="grace@org.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-800">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a password"
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
              {showPassword ? <FaEyeSlash className="size-4 text-slate-700" /> : <FaEye className="size-4 text-slate-400" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-800">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="reg-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm your password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 pl-3.5 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 cursor-pointer z-20 rounded-lg transition-colors focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="size-4 text-slate-700" />
              ) : (
                <FaEye className="size-4 text-slate-400" />
              )}
            </button>
          </div>
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
          loadingText="Creating account..."
          className="w-full h-11 rounded-xl bg-slate-950 text-white hover:bg-slate-900 text-sm font-medium shadow-sm transition-colors mt-3"
        >
          Create account
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Already have an account? <span className="text-slate-950 font-semibold underline">Sign in</span>
        </Link>
      </div>
    </div>
  )
}
