'use client'

import * as React from 'react'
import { FaCheck } from 'react-icons/fa6'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ref?: React.Ref<HTMLInputElement>
  onCheckedChange?: (checked: boolean) => void
}

export function Checkbox({
  className,
  checked,
  defaultChecked = false,
  onChange,
  onCheckedChange,
  disabled,
  id,
  ref,
  ...props
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? Boolean(checked) : internalChecked

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.checked
    if (!isControlled) {
      setInternalChecked(nextVal)
    }
    onChange?.(e)
    onCheckedChange?.(nextVal)
  }

  return (
    <span className="relative inline-flex items-center justify-center size-4.5 shrink-0">
      <input
        type="checkbox"
        id={id}
        ref={ref}
        checked={isChecked}
        disabled={disabled}
        onChange={handleToggle}
        className="sr-only peer"
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          'size-4.5 rounded-[4px] border flex items-center justify-center transition-[background-color,border-color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none cursor-pointer select-none',
          isChecked
            ? 'bg-slate-950 border-slate-950 text-white dark:bg-white dark:border-white dark:text-zinc-950'
            : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 [@media(hover:hover)_and_(pointer:fine)]:hover:border-slate-400 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-500',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-slate-900 dark:peer-focus-visible:ring-white/30 peer-focus-visible:ring-offset-1 dark:peer-focus-visible:ring-offset-zinc-950',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <FaCheck
          className={cn(
            'size-3 text-current stroke-[1] transition-[opacity,scale] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
            isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          )}
        />
      </span>
    </span>
  )
}
