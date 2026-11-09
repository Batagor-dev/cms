'use client'

import * as React from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import { Lock } from 'lucide-react'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showIcon?: boolean
}

export function PasswordInput({
  className,
  showIcon = true,
  leftIcon = <Lock className="size-4.5" />,
  ref,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative flex items-center w-full">
      <Input
        type={showPassword ? 'text' : 'password'}
        leftIcon={showIcon ? leftIcon : undefined}
        rightIcon={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            className="size-9 flex items-center justify-center text-slate-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-slate-700 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-slate-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 active:bg-slate-200 dark:active:bg-zinc-700 transition-colors cursor-pointer z-20 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showPassword ? (
              <FaEyeSlash className="size-4.5 text-slate-700 dark:text-zinc-200" aria-hidden="true" />
            ) : (
              <FaEye className="size-4.5 text-slate-500 dark:text-zinc-400" aria-hidden="true" />
            )}
          </button>
        }
        ref={ref}
        className={cn('pr-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden', className)}
        {...props}
      />
    </div>
  )
}
