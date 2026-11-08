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
    <span className="relative inline-flex items-center justify-center size-4 shrink-0">
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
          'size-4 rounded-[4px] border flex items-center justify-center transition-all cursor-pointer select-none',
          isChecked
            ? 'bg-slate-950 border-slate-950 text-white'
            : 'bg-white border-slate-300 hover:border-slate-400',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-slate-900 peer-focus-visible:ring-offset-1',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {isChecked && <FaCheck className="size-2.5 text-white stroke-[1]" />}
      </span>
    </span>
  )
}
