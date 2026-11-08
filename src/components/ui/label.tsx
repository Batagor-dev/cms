import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  ref?: React.Ref<HTMLLabelElement>
}

export function Label({ className, required, children, ref, ...props }: LabelProps) {
  return (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 select-none',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-destructive font-semibold" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

