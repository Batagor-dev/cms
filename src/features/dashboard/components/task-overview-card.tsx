'use client'

import * as React from 'react'
import { useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { LayoutList, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EASE_ENTER } from '@/lib/motion'

export function TaskOverviewCard() {
  const [activeRange, setActiveRange] = React.useState<'1d' | '7d' | '1m'>('1m')
  const prefersReducedMotion = useReducedMotion()

  const tasks = {
    total: 24,
    inProgress: 12,
    underReview: 8,
    finished: 4,
  }

  const pInProgress = (tasks.inProgress / tasks.total) * 100
  const pUnderReview = (tasks.underReview / tasks.total) * 100
  const pFinished = (tasks.finished / tasks.total) * 100

  return (
    <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-700 transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between">
      <CardContent className="p-0 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
              <LayoutList className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 leading-tight">
                Task overview
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Overview spread to all tasks
              </p>
            </div>
          </div>

          {/* Time range pills: 1d, 7d, 1m */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {(['1d', '7d', '1m'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-[background-color,color,scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:scale-100 cursor-pointer ${
                  activeRange === r
                    ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 shadow-xs font-semibold'
                    : '[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-900 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Task Counter */}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
            Task ({tasks.total})
          </span>
        </div>

        {/* Segmented Horizontal Progress Bar (GPU scaleX, never width transition) */}
        <div className="h-3.5 w-full flex rounded-full overflow-hidden gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full overflow-hidden"
            style={{ width: `${pInProgress}%` }}
            title={`In progress: ${tasks.inProgress}`}
          >
            <m.div
              initial={prefersReducedMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.35, ease: EASE_ENTER }}
              className="h-full w-full rounded-full bg-black dark:bg-white origin-left"
            />
          </div>
          <div
            className="h-full rounded-full overflow-hidden"
            style={{ width: `${pUnderReview}%` }}
            title={`Under review: ${tasks.underReview}`}
          >
            <m.div
              initial={prefersReducedMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.35, delay: 0.04, ease: EASE_ENTER }}
              className="h-full w-full rounded-full bg-zinc-500 dark:bg-zinc-400 origin-left"
            />
          </div>
          <div
            className="h-full rounded-full overflow-hidden"
            style={{ width: `${pFinished}%` }}
            title={`Finished: ${tasks.finished}`}
          >
            <m.div
              initial={prefersReducedMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.35, delay: 0.08, ease: EASE_ENTER }}
              className="h-full w-full rounded-full bg-zinc-300 dark:bg-zinc-600 origin-left"
            />
          </div>
        </div>

        {/* Breakdown Legend Items */}
        <div className="flex flex-col gap-2.5 pt-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-medium">
              <span className="size-2 rounded-full bg-black dark:bg-white" />
              In progress
            </span>
            <span className="font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">{tasks.inProgress} tasks</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-medium">
              <span className="size-2 rounded-full bg-zinc-500 dark:bg-zinc-400" />
              Under review
            </span>
            <span className="font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">{tasks.underReview} tasks</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-medium">
              <span className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              Finished
            </span>
            <span className="font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">{tasks.finished} tasks</span>
          </div>
        </div>
      </CardContent>

      {/* Footer Link */}
      <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white flex items-center justify-between w-full group transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
        >
          <span>View tasks details</span>
          <ArrowRight className="size-4 text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-1 [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover:text-white transition-[translate,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none" aria-hidden="true" />
        </button>
      </div>
    </Card>
  )
}

