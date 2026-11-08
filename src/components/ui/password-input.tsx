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
  leftIcon = <Lock className="size-4" />,
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
            className="size-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer z-20 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showPassword ? (
              <FaEyeSlash className="size-4 text-slate-700" aria-hidden="true" />
            ) : (
              <FaEye className="size-4 text-slate-400" aria-hidden="true" />
            )}
          </button>
        }
        ref={ref}
        className={cn('pr-11 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden', className)}
        {...props}
      />
    </div>
  )
}
