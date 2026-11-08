'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  isError?: boolean
  autoFocus?: boolean
  className?: string
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  isError = false,
  autoFocus = true,
  className,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Ensure digits array matches length
  const digits = React.useMemo(() => {
    const chars = value.split('')
    return Array.from({ length }, (_, i) => chars[i] || '')
  }, [value, length])

  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous box if current is empty
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current box
        const newDigits = [...digits]
        newDigits[index] = ''
        onChange(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.slice(-1) // Take last typed char
    if (!/^[0-9]$/.test(char) && char !== '') return

    const newDigits = [...digits]
    newDigits[index] = char
    const nextVal = newDigits.join('')
    onChange(nextVal)

    // Auto advance if digit entered
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim()
    const cleanNumbers = pasted.replace(/\D/g, '').slice(0, length)
    if (!cleanNumbers) return

    onChange(cleanNumbers)
    const nextFocusIndex = Math.min(cleanNumbers.length, length - 1)
    inputRefs.current[nextFocusIndex]?.focus()
  }

  return (
    <div className={cn('flex items-center justify-center gap-2 sm:gap-3', className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete="one-time-code"
          value={digits[index]}
          disabled={disabled}
          aria-label={`Digit OTP ke-${index + 1}`}
          aria-invalid={isError ? 'true' : undefined}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            'size-11 sm:size-12 rounded-lg border border-input bg-background text-center text-lg font-bold shadow-xs transition-all',
            'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isError && 'border-destructive text-destructive focus:border-destructive focus:ring-destructive/20',
            digits[index] && !isError && 'border-primary/60 bg-primary/5'
          )}
        />
      ))}
    </div>
  )
}

