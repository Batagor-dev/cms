'use client'

import * as React from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'

export interface Select2Option {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface Select2Props {
  id?: string
  options: Select2Option[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  searchable?: boolean
  disabled?: boolean
  isError?: boolean
  size?: 'sm' | 'default'
  placement?: 'bottom' | 'top'
  ariaLabel?: string
  className?: string
  dropdownClassName?: string
  ref?: React.Ref<HTMLButtonElement>
}

export function Select2({
  id,
  options,
  value,
  defaultValue = '',
  onValueChange,
  placeholder = 'Pilih opsi...',
  searchPlaceholder = 'Cari opsi...',
  emptyText = 'Opsi tidak ditemukan',
  searchable = true,
  disabled = false,
  isError = false,
  size = 'default',
  placement = 'bottom',
  ariaLabel,
  className,
  dropdownClassName,
  ref,
}: Select2Props) {
  const generatedId = React.useId()
  const prefersReducedMotion = useReducedMotion()
  const controlId = id ?? `select2-${generatedId}`
  const listboxId = `${controlId}-listbox`

  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const [isOpen, setIsOpen] = React.useState(false)
  const [isDropdownAnimating, setIsDropdownAnimating] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)

  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const setMergedTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref && typeof ref === 'object') {
        ref.current = node
      }
    },
    [ref]
  )

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === currentValue),
    [options, currentValue]
  )

  const filteredOptions = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        opt.description?.toLowerCase().includes(q)
    )
  }, [options, query])

  const safeHighlightedIndex =
    filteredOptions.length > 0
      ? Math.min(highlightedIndex, filteredOptions.length - 1)
      : -1

  const closeDropdown = React.useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setHighlightedIndex(0)
  }, [])

  const openDropdown = React.useCallback(() => {
    if (disabled) return
    const currentIdx = options.findIndex((opt) => opt.value === currentValue)
    setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0)
    setIsOpen(true)
  }, [disabled, options, currentValue])

  const handleSelect = React.useCallback(
    (option: Select2Option) => {
      if (option.disabled) return
      if (!isControlled) {
        setInternalValue(option.value)
      }
      onValueChange?.(option.value)
      closeDropdown()
      triggerRef.current?.focus()
    },
    [isControlled, onValueChange, closeDropdown]
  )

  // Focus embedded search box smoothly on next animation frame when dropdown opens
  React.useEffect(() => {
    if (!isOpen || !searchable) return
    const rafId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(rafId)
  }, [isOpen, searchable])

  // Close on click outside
  React.useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        closeDropdown()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isOpen, closeDropdown])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openDropdown()
      }
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      closeDropdown()
      triggerRef.current?.focus()
    } else if (e.key === 'ArrowDown' && filteredOptions.length > 0) {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length)
    } else if (e.key === 'ArrowUp' && filteredOptions.length > 0) {
      e.preventDefault()
      setHighlightedIndex(
        (prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const option = filteredOptions[safeHighlightedIndex]
      if (option && !option.disabled) {
        handleSelect(option)
      }
    } else if (e.key === 'Tab') {
      closeDropdown()
    }
  }

  return (
    <div
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      className={cn('relative w-full', className)}
    >
      <button
        ref={setMergedTriggerRef}
        id={controlId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-invalid={isError ? 'true' : undefined}
        disabled={disabled}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-xl border bg-white dark:bg-zinc-900 text-left transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 disabled:cursor-not-allowed disabled:opacity-50',
          size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-10 px-3 text-base sm:text-sm',
          isError
            ? 'border-destructive focus-visible:ring-destructive/40'
            : isOpen
              ? 'border-zinc-400 dark:border-zinc-600 ring-2 ring-zinc-950/10 dark:ring-white/10'
              : 'border-zinc-200/90 dark:border-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-700'
        )}
      >
        <span
          className={cn(
            'min-w-0 truncate',
            selectedOption ? 'text-zinc-950 dark:text-zinc-50 font-medium' : 'text-zinc-500 dark:text-zinc-400'
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            size === 'sm' ? 'size-4' : 'size-4.5',
            'text-zinc-500 dark:text-zinc-400 shrink-0 transition-[rotate,color] duration-250 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
            isOpen ? 'rotate-180 text-zinc-700 dark:text-zinc-200' : 'rotate-0'
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            key={`${listboxId}-panel`}
            id={listboxId}
            role="listbox"
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, scale: 0.96, y: placement === 'top' ? 6 : -6 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.96,
                    y: placement === 'top' ? 4 : -4,
                    transition: { duration: 0.16, ease: EASE_EXIT },
                  }
            }
            transition={{ duration: 0.22, ease: EASE_ENTER }}
            onAnimationStart={() => setIsDropdownAnimating(true)}
            onAnimationComplete={() => setIsDropdownAnimating(false)}
            style={
              isDropdownAnimating && !prefersReducedMotion
                ? { willChange: 'transform, opacity' }
                : undefined
            }
            className={cn(
              'absolute left-0 right-0 z-40 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden',
              'ring-1 ring-zinc-950/[0.06] dark:ring-white/10 shadow-[0_6px_16px_-4px_rgba(9,9,11,0.08),0_20px_44px_-8px_rgba(9,9,11,0.16)] dark:shadow-[0_14px_38px_-6px_rgba(0,0,0,0.75)]',
              placement === 'top'
                ? 'bottom-full mb-1.5 origin-bottom'
                : 'top-full mt-1.5 origin-top',
              dropdownClassName
            )}
          >
            {searchable && (
              <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 bg-zinc-50/70 dark:bg-zinc-800/40">
                <Search className="size-4 text-zinc-500 dark:text-zinc-400 shrink-0 ml-1" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setHighlightedIndex(0)
                  }}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="w-full bg-transparent text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none py-1"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setHighlightedIndex(0)
                      searchInputRef.current?.focus()
                    }}
                    aria-label="Reset kata kunci"
                    className="size-6 shrink-0 rounded-md text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200/60 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-700 flex items-center justify-center cursor-pointer"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="py-5 px-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  {emptyText}
                </div>
              ) : (
                filteredOptions.map((option, idx) => {
                  const isSelected = option.value === currentValue
                  const isHighlighted = idx === safeHighlightedIndex
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                        isSelected
                          ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold'
                          : isHighlighted
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-medium'
                            : 'text-zinc-700 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-50 font-medium'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm truncate">{option.label}</div>
                        {option.description && (
                          <div
                            className={cn(
                              'text-xs truncate mt-0.5',
                              isSelected
                                ? 'text-zinc-300 dark:text-zinc-600'
                                : 'text-zinc-500 dark:text-zinc-400'
                            )}
                          >
                            {option.description}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="size-4 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

