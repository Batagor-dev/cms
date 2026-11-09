'use client'

import * as React from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'
import type { Select2Option } from '@/components/ui/select2'

export interface MultiSelect2Props {
  id?: string
  options: Select2Option[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (values: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  isError?: boolean
  placement?: 'bottom' | 'top'
  maxSelected?: number
  ariaLabel?: string
  className?: string
  dropdownClassName?: string
  ref?: React.Ref<HTMLDivElement>
}

export function MultiSelect2({
  id,
  options,
  value,
  defaultValue = [],
  onValueChange,
  placeholder = 'Pilih satu atau beberapa opsi...',
  searchPlaceholder = 'Ketik untuk mencari...',
  emptyText = 'Opsi tidak ditemukan',
  disabled = false,
  isError = false,
  placement = 'bottom',
  maxSelected,
  ariaLabel,
  className,
  dropdownClassName,
  ref,
}: MultiSelect2Props) {
  const generatedId = React.useId()
  const prefersReducedMotion = useReducedMotion()
  const controlId = id ?? `multiselect2-${generatedId}`
  const listboxId = `${controlId}-listbox`

  const [internalValues, setInternalValues] = React.useState<string[]>(defaultValue)
  const isControlled = value !== undefined
  const selectedValues = isControlled ? value : internalValues

  const [isOpen, setIsOpen] = React.useState(false)
  const [isDropdownAnimating, setIsDropdownAnimating] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)

  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const setMergedWrapperRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref && typeof ref === 'object') {
        ref.current = node
      }
    },
    [ref]
  )

  const selectedSet = React.useMemo(
    () => new Set(selectedValues),
    [selectedValues]
  )

  const optionMap = React.useMemo(() => {
    const map = new Map<string, Select2Option>()
    for (const opt of options) {
      map.set(opt.value, opt)
    }
    return map
  }, [options])

  const selectedOptions = React.useMemo(
    () =>
      selectedValues
        .map((val) => optionMap.get(val))
        .filter((opt): opt is Select2Option => Boolean(opt)),
    [selectedValues, optionMap]
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

  const updateValues = React.useCallback(
    (nextValues: string[]) => {
      if (!isControlled) {
        setInternalValues(nextValues)
      }
      onValueChange?.(nextValues)
    },
    [isControlled, onValueChange]
  )

  const closeDropdown = React.useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setHighlightedIndex(0)
  }, [])

  const handleToggleOption = React.useCallback(
    (option: Select2Option) => {
      if (option.disabled || disabled) return
      const exists = selectedSet.has(option.value)
      if (exists) {
        updateValues(selectedValues.filter((val) => val !== option.value))
      } else {
        if (maxSelected !== undefined && selectedValues.length >= maxSelected) {
          return
        }
        updateValues([...selectedValues, option.value])
      }
      inputRef.current?.focus()
    },
    [disabled, selectedSet, selectedValues, updateValues, maxSelected]
  )

  const handleRemoveValue = (val: string) => {
    if (disabled) return
    updateValues(selectedValues.filter((item) => item !== val))
    inputRef.current?.focus()
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    updateValues([])
    setQuery('')
    inputRef.current?.focus()
  }

  const handleSelectAllFiltered = () => {
    if (disabled) return
    const next = new Set(selectedValues)
    for (const opt of filteredOptions) {
      if (opt.disabled) continue
      if (maxSelected !== undefined && next.size >= maxSelected) break
      next.add(opt.value)
    }
    updateValues(Array.from(next))
    inputRef.current?.focus()
  }

  // Close on outside pointer click
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === 'Backspace' && !query && selectedValues.length > 0) {
      e.preventDefault()
      updateValues(selectedValues.slice(0, -1))
      return
    }

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setIsOpen(true)
      setHighlightedIndex(0)
      return
    }

    if (!isOpen) return

    if (e.key === 'Escape') {
      e.preventDefault()
      closeDropdown()
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
        handleToggleOption(option)
      }
    } else if (e.key === 'Tab') {
      closeDropdown()
    }
  }

  const handleContainerClick = () => {
    if (disabled) return
    setIsOpen(true)
    inputRef.current?.focus()
  }

  return (
    <div ref={setMergedWrapperRef} className={cn('relative w-full', className)}>
      <div
        onClick={handleContainerClick}
        className={cn(
          'min-h-10 w-full rounded-xl border bg-white dark:bg-zinc-900 px-2.5 py-1.5 flex items-center justify-between gap-2 transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-text',
          disabled && 'opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/50',
          isError
            ? 'border-destructive focus-within:ring-2 focus-within:ring-destructive/40'
            : isOpen
              ? 'border-zinc-400 dark:border-zinc-600 ring-2 ring-zinc-950/10 dark:ring-white/10'
              : 'border-zinc-200/90 dark:border-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-700 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-950/10 dark:focus-within:ring-white/10'
        )}
      >
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
          <AnimatePresence initial={false}>
            {selectedOptions.map((item) => (
              <m.span
                key={item.value}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.92,
                        transition: { duration: 0.14, ease: EASE_EXIT },
                      }
                }
                transition={{ duration: 0.18, ease: EASE_ENTER }}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 max-w-full"
              >
                <span className="truncate max-w-[160px]">{item.label}</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveValue(item.value)
                  }}
                  aria-label={`Hapus ${item.label}`}
                  className="size-5 shrink-0 rounded-md text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-200 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-700 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </m.span>
            ))}
          </AnimatePresence>

          <input
            ref={inputRef}
            id={controlId}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-label={ariaLabel}
            aria-invalid={isError ? 'true' : undefined}
            disabled={disabled}
            value={query}
            onFocus={() => !disabled && setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlightedIndex(0)
              if (!isOpen) setIsOpen(true)
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedOptions.length === 0 ? placeholder : searchPlaceholder
            }
            className="flex-1 min-w-[120px] bg-transparent text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none py-0.5"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedOptions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold tabular-nums leading-none">
              {selectedOptions.length}
            </span>
          )}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              if (isOpen) {
                closeDropdown()
              } else {
                setIsOpen(true)
                inputRef.current?.focus()
              }
            }}
            aria-label={isOpen ? 'Tutup pilihan' : 'Buka pilihan'}
            className="size-7 rounded-lg text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-700 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-200 flex items-center justify-center cursor-pointer"
          >
            <ChevronDown
              className={cn(
                'size-4.5 transition-[rotate,color] duration-250 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
                isOpen ? 'rotate-180 text-zinc-700 dark:text-zinc-200' : 'rotate-0'
              )}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <m.div
            key={`${listboxId}-panel`}
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
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
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="py-5 px-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  {emptyText}
                </div>
              ) : (
                filteredOptions.map((option, idx) => {
                  const isSelected = selectedSet.has(option.value)
                  const isHighlighted = idx === safeHighlightedIndex
                  const atLimit =
                    maxSelected !== undefined &&
                    selectedValues.length >= maxSelected &&
                    !isSelected

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled || atLimit}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => handleToggleOption(option)}
                      className={cn(
                        'w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                        isHighlighted
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50'
                          : 'text-zinc-700 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100/80 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-50'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          aria-hidden="true"
                          className={cn(
                            'size-4.5 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors',
                            isSelected
                              ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-zinc-950'
                              : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600'
                          )}
                        >
                          {isSelected && <Check className="size-3.5" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              'text-sm truncate',
                              isSelected ? 'font-semibold text-zinc-950 dark:text-zinc-50' : 'font-medium'
                            )}
                          >
                            {option.label}
                          </div>
                          {option.description && (
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {filteredOptions.length > 0 && maxSelected === undefined && (
              <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="font-semibold text-zinc-700 dark:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white cursor-pointer"
                >
                  Pilih semua
                </button>
                {selectedValues.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="font-medium text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white cursor-pointer"
                  >
                    Kosongkan ({selectedValues.length})
                  </button>
                )}
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

