'use client'

import * as React from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Search,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select2, type Select2Option } from '@/components/ui/select2'
import { Skeleton } from '@/components/ui/skeleton'

export interface DataTableColumn<TData> {
  id: string
  header: string
  accessorKey?: keyof TData
  cell?: (row: TData, index: number) => React.ReactNode
  sortable?: boolean
  sortValue?: (row: TData) => string | number
  align?: 'left' | 'center' | 'right'
  className?: string
  headerClassName?: string
}

export interface DataTableProps<TData> {
  data: TData[]
  columns: DataTableColumn<TData>[]
  getRowId: (row: TData) => string
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: (keyof TData)[]
  pageSizeOptions?: number[]
  defaultPageSize?: number
  selectable?: boolean
  isLoading?: boolean
  loadingRows?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  headerActions?: React.ReactNode
  className?: string
}

type SortDirection = 'asc' | 'desc' | null

function getPaginationRange(
  currentPage: number,
  totalPages: number
): (number | 'ellipsis-left' | 'ellipsis-right')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    pages.push('ellipsis-left')
  }
  for (let p = start; p <= end; p++) {
    pages.push(p)
  }
  if (end < totalPages - 1) {
    pages.push('ellipsis-right')
  }
  pages.push(totalPages)

  return pages
}

export function DataTable<TData extends Record<string, unknown>>({
  data,
  columns,
  getRowId,
  searchable = true,
  searchPlaceholder = 'Cari data tabel...',
  searchFields,
  pageSizeOptions = [5, 10, 25, 50],
  defaultPageSize = 10,
  selectable = true,
  isLoading = false,
  loadingRows = 5,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Seluruh baris tabel kosong atau sudah dihapus.',
  emptyAction,
  headerActions,
  className,
}: DataTableProps<TData>) {
  const tableUid = React.useId()
  const prefersReducedMotion = useReducedMotion()
  const pageSizeSelectId = `${tableUid}-page-size`
  const searchInputId = `${tableUid}-search`
  const selectAllId = `${tableUid}-select-all`

  const [searchQuery, setSearchQuery] = React.useState('')
  const [pageSize, setPageSize] = React.useState(
    pageSizeOptions.includes(defaultPageSize)
      ? defaultPageSize
      : (pageSizeOptions[0] ?? 10)
  )
  const [currentPage, setCurrentPage] = React.useState(1)
  const [sortConfig, setSortConfig] = React.useState<{
    columnId: string
    direction: SortDirection
  }>({
    columnId: '',
    direction: null,
  })
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  const pageSizeSelectOptions = React.useMemo<Select2Option[]>(
    () =>
      pageSizeOptions.map((size) => ({
        value: String(size),
        label: String(size),
      })),
    [pageSizeOptions]
  )

  const filteredData = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return data

    const keysToSearch: (keyof TData)[] =
      searchFields ??
      (columns
        .map((c) => c.accessorKey)
        .filter(Boolean) as (keyof TData)[])

    return data.filter((row) => {
      const targetKeys =
        keysToSearch.length > 0 ? keysToSearch : (Object.keys(row) as (keyof TData)[])
      return targetKeys.some((key) => {
        const val = row[key]
        if (val === null || val === undefined) return false
        if (Array.isArray(val)) {
          return val.some((entry) => String(entry).toLowerCase().includes(q))
        }
        return String(val).toLowerCase().includes(q)
      })
    })
  }, [data, searchQuery, searchFields, columns])

  const sortedData = React.useMemo(() => {
    if (!sortConfig.columnId || !sortConfig.direction) {
      return filteredData
    }
    const column = columns.find((col) => col.id === sortConfig.columnId)
    if (!column) return filteredData

    const directionFactor = sortConfig.direction === 'asc' ? 1 : -1

    return [...filteredData].sort((a, b) => {
      const valA = column.sortValue
        ? column.sortValue(a)
        : column.accessorKey
          ? a[column.accessorKey]
          : ''
      const valB = column.sortValue
        ? column.sortValue(b)
        : column.accessorKey
          ? b[column.accessorKey]
          : ''

      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * directionFactor
      }
      return (
        String(valA ?? '').localeCompare(String(valB ?? ''), 'id', {
          numeric: true,
          sensitivity: 'base',
        }) * directionFactor
      )
    })
  }, [filteredData, sortConfig, columns])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)

  const paginatedData = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, safePage, pageSize])

  const validIdSet = React.useMemo(
    () => new Set(data.map((row) => getRowId(row))),
    [data, getRowId]
  )

  const validSelectedIds = React.useMemo(
    () => selectedIds.filter((id) => validIdSet.has(id)),
    [selectedIds, validIdSet]
  )

  const selectedIdSet = React.useMemo(
    () => new Set(validSelectedIds),
    [validSelectedIds]
  )

  const pageRowIds = React.useMemo(
    () => paginatedData.map((row) => getRowId(row)),
    [paginatedData, getRowId]
  )

  const allPageSelected =
    pageRowIds.length > 0 && pageRowIds.every((id) => selectedIdSet.has(id))

  const handleToggleSelectPage = (checked: boolean) => {
    if (checked) {
      const next = new Set(validSelectedIds)
      for (const id of pageRowIds) {
        next.add(id)
      }
      setSelectedIds(Array.from(next))
    } else {
      const pageSet = new Set(pageRowIds)
      setSelectedIds(validSelectedIds.filter((id) => !pageSet.has(id)))
    }
  }

  const handleToggleRow = (rowId: string) => {
    setSelectedIds((prev) => {
      const clean = prev.filter((id) => validIdSet.has(id))
      return clean.includes(rowId)
        ? clean.filter((id) => id !== rowId)
        : [...clean, rowId]
    })
  }

  const handleSort = (columnId: string) => {
    setSortConfig((prev) => {
      if (prev.columnId !== columnId) {
        return { columnId, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { columnId, direction: 'desc' }
      }
      return { columnId: '', direction: null }
    })
    setCurrentPage(1)
  }

  const startRecord =
    sortedData.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endRecord = Math.min(safePage * pageSize, sortedData.length)
  const totalColumns = columns.length + (selectable ? 1 : 0)
  const paginationItems = React.useMemo(
    () => getPaginationRange(safePage, totalPages),
    [safePage, totalPages]
  )

  return (
    <Card
      className={cn(
        'rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        className
      )}
    >
      <CardContent className="p-0">
        {/* Top Toolbar */}
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Left: Show Entries Select2 */}
            <div className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <label
                htmlFor={pageSizeSelectId}
                className="font-medium whitespace-nowrap"
              >
                Tampilkan
              </label>
              <Select2
                id={pageSizeSelectId}
                options={pageSizeSelectOptions}
                value={String(pageSize)}
                onValueChange={(val) => {
                  const parsed = Number(val)
                  if (!Number.isNaN(parsed) && parsed > 0) {
                    setPageSize(parsed)
                    setCurrentPage(1)
                  }
                }}
                searchable={false}
                size="sm"
                ariaLabel="Jumlah data per halaman"
                className="w-[82px]"
              />
              <span className="font-medium whitespace-nowrap">data</span>
            </div>

            {/* Right: Header Actions + Search Input */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
              {headerActions}
              {searchable && (
                <div className="w-full sm:w-64 lg:w-72">
                  <label htmlFor={searchInputId} className="sr-only">
                    {searchPlaceholder}
                  </label>
                  <Input
                    id={searchInputId}
                    type="text"
                    inputMode="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder={searchPlaceholder}
                    leftIcon={
                      <Search className="size-4.5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
                    }
                    rightIcon={
                      searchQuery ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('')
                            setCurrentPage(1)
                          }}
                          aria-label="Reset pencarian"
                          className="size-7 rounded-md text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                        >
                          <X className="size-4" aria-hidden="true" />
                        </button>
                      ) : undefined
                    }
                    className="h-9 rounded-xl border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/70 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:bg-white dark:focus-visible:bg-zinc-900 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25 focus-visible:ring-offset-0"
                  />
                </div>
              )}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {selectable && validSelectedIds.length > 0 && (
              <m.div
                key="datatable-selection-bar"
                initial={prefersReducedMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: -4,
                        scale: 0.98,
                        transition: { duration: 0.16, ease: EASE_EXIT },
                      }
                }
                transition={{ duration: 0.2, ease: EASE_ENTER }}
                className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {validSelectedIds.length} item dipilih
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="font-medium text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white cursor-pointer"
                >
                  Batalkan pilihan
                </button>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table Body Viewport */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Area gulir tabel data"
          className="w-full overflow-x-auto no-scrollbar border-t border-zinc-100 dark:border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                {selectable && (
                  <th scope="col" className="w-12 pl-5 pr-2 py-3.5">
                    <label
                      htmlFor={selectAllId}
                      className={cn(
                        'inline-flex items-center justify-center p-1 -m-1',
                        isLoading || paginatedData.length === 0
                          ? 'cursor-not-allowed opacity-60'
                          : 'cursor-pointer'
                      )}
                    >
                      <Checkbox
                        id={selectAllId}
                        checked={!isLoading && allPageSelected}
                        disabled={isLoading || paginatedData.length === 0}
                        onCheckedChange={handleToggleSelectPage}
                        aria-label="Pilih semua baris di halaman ini"
                        className="rounded-[5px]"
                      />
                    </label>
                  </th>
                )}
                {columns.map((col) => {
                  const isSorted = sortConfig.columnId === col.id
                  const ariaSort = isSorted
                    ? sortConfig.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined

                  return (
                    <th
                      key={col.id}
                      scope="col"
                      aria-sort={ariaSort}
                      className={cn(
                        'px-4 py-3.5 text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                        col.headerClassName
                      )}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleSort(col.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 font-medium uppercase tracking-wide text-muted-foreground rounded-md px-1.5 py-0.5 -mx-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25',
                            isLoading
                              ? 'cursor-not-allowed opacity-70'
                              : '[@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground cursor-pointer',
                            col.align === 'right' && 'flex-row-reverse'
                          )}
                        >
                          <span>{col.header}</span>
                          {isSorted && sortConfig.direction === 'asc' ? (
                            <ArrowUp className="size-4 text-black dark:text-white" aria-hidden="true" />
                          ) : isSorted && sortConfig.direction === 'desc' ? (
                            <ArrowDown className="size-4 text-black dark:text-white" aria-hidden="true" />
                          ) : (
                            <ArrowUpDown className="size-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800" aria-busy={isLoading || undefined}>
              {isLoading ? (
                Array.from({ length: loadingRows }).map((_, rowIdx) => {
                  const baseDelay = rowIdx * 65
                  return (
                    <tr key={`skeleton-row-${rowIdx}`} aria-hidden="true">
                      {selectable && (
                        <td className="w-12 pl-5 pr-2 py-4 align-middle">
                          <Skeleton shape="rect" delayMs={baseDelay} className="size-4.5" />
                        </td>
                      )}
                      {columns.map((col, colIdx) => (
                        <td
                          key={`skeleton-col-${col.id}`}
                          className={cn('px-4 py-4 align-middle', col.className)}
                        >
                          <div
                            className={cn(
                              'flex flex-col gap-1.5',
                              col.align === 'center' && 'items-center',
                              col.align === 'right' && 'items-end'
                            )}
                          >
                            <Skeleton
                              shape={colIdx === 0 ? 'pill' : 'rounded'}
                              delayMs={baseDelay + colIdx * 35}
                              className={cn(
                                'h-4',
                                colIdx === 0
                                  ? rowIdx % 2 === 0
                                    ? 'w-52 max-w-full'
                                    : 'w-40 max-w-full'
                                  : colIdx === columns.length - 1
                                    ? 'w-14'
                                    : 'w-24'
                              )}
                            />
                            {colIdx === 0 && (
                              <Skeleton
                                shape="pill"
                                delayMs={baseDelay + 45}
                                className="h-3 w-24"
                              />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )
                })
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={totalColumns} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
                        {searchQuery ? (
                          <Search className="size-6" aria-hidden="true" />
                        ) : (
                          <Database className="size-6" aria-hidden="true" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {searchQuery ? 'Data tidak ditemukan' : emptyTitle}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                          {searchQuery
                            ? `Tidak ada baris yang cocok dengan kata kunci "${searchQuery}".`
                            : emptyDescription}
                        </p>
                      </div>
                      {searchQuery ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSearchQuery('')
                            setCurrentPage(1)
                          }}
                          className="h-8 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                        >
                          Reset pencarian
                        </Button>
                      ) : (
                        emptyAction
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => {
                  const rowId = getRowId(row)
                  const isSelected = selectedIdSet.has(rowId)
                  const checkboxId = `${tableUid}-row-${rowId}`

                  return (
                    <tr
                      key={rowId}
                      className={cn(
                        'transition-colors duration-150',
                        isSelected
                          ? 'bg-zinc-100/80 dark:bg-zinc-800/70'
                          : 'bg-white dark:bg-zinc-900 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-50/80 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800/40'
                      )}
                    >
                      {selectable && (
                        <td className="w-12 pl-5 pr-2 py-3.5 align-middle">
                          <label
                            htmlFor={checkboxId}
                            className="inline-flex items-center justify-center p-1 -m-1 cursor-pointer"
                          >
                            <Checkbox
                              id={checkboxId}
                              checked={isSelected}
                              onCheckedChange={() => handleToggleRow(rowId)}
                              aria-label={`Pilih baris ${rowIndex + 1}`}
                              className="rounded-[5px]"
                            />
                          </label>
                        </td>
                      )}

                      {columns.map((col) => {
                        const value = col.accessorKey
                          ? row[col.accessorKey]
                          : undefined
                        return (
                          <td
                            key={col.id}
                            className={cn(
                              'px-4 py-3.5 text-sm text-zinc-700 dark:text-zinc-300 align-middle tabular-nums',
                              col.align === 'center' && 'text-center',
                              col.align === 'right' && 'text-right',
                              col.className
                            )}
                          >
                            {col.cell
                              ? col.cell(row, (safePage - 1) * pageSize + rowIndex)
                              : value !== null && value !== undefined
                                ? String(value)
                                : '-'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-5 sm:px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {isLoading ? (
            <>
              <Skeleton shape="pill" className="h-3.5 w-44" delayMs={80} />
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton
                    key={idx}
                    shape="circle"
                    delayMs={120 + idx * 35}
                    className="size-8"
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">
                Menampilkan {startRecord}–{endRecord} dari {sortedData.length} data
                {searchQuery && data.length !== sortedData.length
                  ? ` (total ${data.length} data)`
                  : ''}
              </p>

              <nav
                aria-label="Paginasi tabel"
                className="flex flex-wrap items-center gap-1"
              >
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={safePage <= 1 || sortedData.length === 0}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Halaman sebelumnya"
                  className="h-8 px-2.5 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </Button>

                {paginationItems.map((item) => {
                  if (item === 'ellipsis-left' || item === 'ellipsis-right') {
                    return (
                      <span
                        key={item}
                        aria-hidden="true"
                        className="px-1.5 text-xs text-zinc-500 dark:text-zinc-400 select-none"
                      >
                        …
                      </span>
                    )
                  }

                  const isCurrent = item === safePage
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCurrentPage(item)}
                      aria-current={isCurrent ? 'page' : undefined}
                      aria-label={`Halaman ${item}`}
                      className={cn(
                        'min-w-8 h-8 px-2 rounded-xl text-xs font-semibold tabular-nums transition-[background-color,color,border-color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25',
                        isCurrent
                          ? 'bg-black text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white'
                      )}
                    >
                      {item}
                    </button>
                  )
                })}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={safePage >= totalPages || sortedData.length === 0}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Halaman berikutnya"
                  className="h-8 px-2.5 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-700 dark:hover:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/25"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </nav>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

