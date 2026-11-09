import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3 [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:mt-0.5',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        destructive: 'border-destructive/50 bg-destructive/10 text-destructive dark:border-rose-500/50 dark:bg-rose-950/35 dark:text-rose-300 [&>svg]:text-destructive dark:[&>svg]:text-rose-400',
        success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400',
        warning: 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400',
        info: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  ref?: React.Ref<HTMLDivElement>
}

export function Alert({ className, variant, children, ref, ...props }: AlertProps) {
  const Icon =
    variant === 'destructive'
      ? AlertCircle
      : variant === 'success'
      ? CheckCircle2
      : variant === 'warning'
      ? AlertTriangle
      : Info

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon />
      <div className="flex-1 space-y-1">{children}</div>
    </div>
  )
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  ref?: React.Ref<HTMLHeadingElement>
}

export function AlertTitle({ className, ref, ...props }: AlertTitleProps) {
  return (
    <h4
      ref={ref}
      className={cn('text-sm font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  ref?: React.Ref<HTMLParagraphElement>
}

export function AlertDescription({
  className,
  ref,
  ...props
}: AlertDescriptionProps) {
  return (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-normal text-current/90', className)}
      {...props}
    />
  )
}

