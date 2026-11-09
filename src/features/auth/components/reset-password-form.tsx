'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaEye, FaEyeSlash, FaCircleCheck, FaCircleExclamation } from 'react-icons/fa6'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AnimatedBrandLogo } from '@/components/ui'

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message || 'Failed to update password')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Animated Brand Logo Icon */}
      <AnimatedBrandLogo size="lg" className="mb-6" />

      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-semibold tracking-tight leading-tight text-slate-900 dark:text-zinc-50">
          Set a new password
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1.5 leading-normal max-w-sm">
          Must be at least 8 characters and contain letters and numbers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {success && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <FaCircleCheck className="size-4.5 shrink-0" />
            <span>Password updated successfully! Redirecting...</span>
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <label htmlFor="new-password" className="block text-sm font-medium text-slate-800 dark:text-zinc-200">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Enter new password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || success}
              className="w-full h-10 pl-3.5 pr-12 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-zinc-500 transition-colors [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 size-9 flex items-center justify-center text-slate-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-slate-700 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-slate-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700 cursor-pointer z-20 rounded-lg transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash className="size-4.5 text-slate-700 dark:text-zinc-200" /> : <FaEye className="size-4.5 text-slate-500 dark:text-zinc-400" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-800 dark:text-zinc-200">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirm-new-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || success}
              className="w-full h-10 pl-3.5 pr-12 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/20 focus:border-slate-900 dark:focus:border-zinc-500 transition-colors [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 size-9 flex items-center justify-center text-slate-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-slate-700 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-slate-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700 cursor-pointer z-20 rounded-lg transition-colors focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FaEyeSlash className="size-4.5 text-slate-700 dark:text-zinc-200" /> : <FaEye className="size-4.5 text-slate-500 dark:text-zinc-400" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 pt-1 text-xs text-rose-500 dark:text-rose-400 font-normal">
            <FaCircleExclamation className="size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          loadingText="Saving password..."
          disabled={success}
          className="w-full h-11 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-slate-900 dark:hover:bg-zinc-200 text-sm font-medium shadow-sm transition-colors mt-2"
        >
          Update password
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="text-xs font-medium text-slate-600 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-slate-900 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100 transition-colors"
        >
          Cancel and return to <span className="text-slate-950 dark:text-zinc-50 font-semibold underline">Sign in</span>
        </Link>
      </div>
    </div>
  )
}
