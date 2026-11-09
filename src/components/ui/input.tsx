import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  ref?: React.Ref<HTMLInputElement>
}

export function Input({
  className,
  type = 'text',
  isError,
  leftIcon,
  rightIcon,
  disabled,
  ref,
  ...props
}: InputProps) {
  if (leftIcon || rightIcon) {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-3 text-muted-foreground pointer-events-none flex items-center justify-center [&_svg]:size-4.5">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          disabled={disabled}
          ref={ref}
          aria-invalid={isError ? 'true' : undefined}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background py-2 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            leftIcon ? 'pl-10' : 'px-3',
            rightIcon ? 'pr-10' : 'px-3',
            isError && 'border-destructive focus-visible:ring-destructive/50 text-destructive',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-3 text-muted-foreground flex items-center justify-center [&_svg]:size-4.5">
            {rightIcon}
          </div>
        )}
      </div>
    )
  }

  return (
    <input
      type={type}
      disabled={disabled}
      ref={ref}
      aria-invalid={isError ? 'true' : undefined}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
        isError && 'border-destructive focus-visible:ring-destructive/50 text-destructive',
        className
      )}
      {...props}
    />
  )
}

