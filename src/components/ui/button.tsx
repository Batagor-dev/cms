import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[scale,background-color,color,border-color,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow [@media(hover:hover)_and_(pointer:fine)]:hover:bg-primary/90 [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs [@media(hover:hover)_and_(pointer:fine)]:hover:bg-destructive/90 [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98]',
        outline:
          'border border-input bg-background shadow-xs [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary/80 [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98]',
        ghost:
          '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98]',
        link: 'text-primary underline-offset-4 [@media(hover:hover)_and_(pointer:fine)]:hover:underline active:opacity-80',
      },
      size: {
        default: 'h-10 px-4 py-2 [&_svg]:size-4.5',
        sm: 'h-8 rounded-md px-3 text-xs [&_svg]:size-4',
        lg: 'h-11 rounded-md px-8 text-base [&_svg]:size-5',
        icon: 'size-11 [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  ref?: React.Ref<HTMLButtonElement>
}

export function Button({
  className,
  variant,
  size,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          {loadingText ? <span>{loadingText}</span> : children}
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  )
}
