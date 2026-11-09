'use client'

import * as React from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { Clock, ChevronDown, ArrowDownRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'

interface DayBar {
  day: string
  hours: number
  isHighlighted?: boolean
  breakdown?: {
    articles: string
    media: string
    review: string
  }
}

const weekData: DayBar[] = [
  { day: 'Mon', hours: 7.5 },
  { day: 'Tue', hours: 5.5 },
  { day: 'Wed', hours: 6.8 },
  { day: 'Thu', hours: 4.2 },
  {
    day: 'Fri',
    hours: 8.5,
    isHighlighted: true,
    breakdown: {
      articles: '5h 12min',
      media: '2h 40min',
      review: '19min',
    },
  },
  { day: 'Sat', hours: 3.5 },
  { day: 'Sun', hours: 5.2 },
]

export function TimeTrackedCard() {
  const [activeTooltip, setActiveTooltip] = React.useState(true)
  const prefersReducedMotion = useReducedMotion()

  return (
    <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-700 transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <CardContent className="p-0 flex flex-col gap-5">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 shrink-0">
              <Clock className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 leading-tight">
                Time tracked
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Overview all tracked working hours
              </p>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/70 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
            >
              <span>Last week</span>
              <ChevronDown className="size-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/70 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
            >
              <span>All project</span>
              <ChevronDown className="size-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Big Number & KPI Trend */}
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight tabular-nums">
            38<span className="text-lg font-semibold text-zinc-500 dark:text-zinc-400">h</span> 36
            <span className="text-lg font-semibold text-zinc-500 dark:text-zinc-400">min</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <ArrowDownRight className="size-4" aria-hidden="true" />
            <span>12%</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">vs last week</span>
          </div>
        </div>

        {/* Custom Bar Chart Canvas */}
        <div className="relative pt-10 pb-2">
          {/* Dashed Horizontal Gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            {[10, 8, 6, 4, 2].map((val) => (
              <div key={val} className="w-full flex items-center gap-2">
                <span className="w-7 text-right text-zinc-500 dark:text-zinc-400 tabular-nums">{val}h</span>
                <div className="flex-1 border-b border-dashed border-zinc-200/80 dark:border-zinc-800" />
              </div>
            ))}
          </div>

          {/* Bars Column */}
          <div className="relative z-10 grid grid-cols-7 gap-2 sm:gap-6 pt-2 pb-6 pl-9 sm:pl-10">
            {weekData.map((bar) => {
              const heightPercent = (bar.hours / 10) * 100

              return (
                <div
                  key={bar.day}
                  className="relative flex flex-col items-center justify-end h-44 group cursor-pointer"
                  onClick={() => bar.isHighlighted && setActiveTooltip(!activeTooltip)}
                >
                  {/* Floating Tooltip on Highlighted Bar */}
                  <AnimatePresence initial={false}>
                    {bar.isHighlighted && activeTooltip && (
                      <m.div
                        key="time-tracked-tooltip"
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={
                          prefersReducedMotion
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.95, y: 4, transition: { duration: 0.16, ease: EASE_EXIT } }
                        }
                        transition={{ duration: 0.2, ease: EASE_ENTER }}
                        className="absolute -top-20 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-30 min-w-[195px] sm:min-w-[225px] p-2.5 rounded-xl bg-zinc-950 dark:bg-zinc-800 text-white shadow-xl text-xs space-y-1.5 pointer-events-none border border-zinc-800 dark:border-zinc-700"
                      >
                        <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-xs bg-white" />
                            <span className="font-semibold text-white tabular-nums">5h 12min</span>
                          </span>
                          <span className="text-zinc-300 text-xs">Techarea Production</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-xs bg-zinc-400" />
                            <span className="font-semibold text-white tabular-nums">2h 40min</span>
                          </span>
                          <span className="text-zinc-300 text-xs">Influmo</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-xs bg-zinc-600 dark:bg-zinc-500" />
                            <span className="font-semibold text-white tabular-nums">19min</span>
                          </span>
                          <span className="text-zinc-300 text-xs">HaloHues</span>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>

                  {/* The Vertical Bar */}
                  <div className="w-6 sm:w-9 rounded-xl overflow-hidden flex flex-col justify-end transition-[scale] [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105 duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:scale-100">
                    {bar.isHighlighted ? (
                      /* Stacked Monochrome Bar */
                      <div
                        className="w-full rounded-xl overflow-hidden flex flex-col"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="h-[55%] bg-black dark:bg-white transition-colors" />
                        <div className="h-[35%] bg-zinc-500 dark:bg-zinc-400 transition-colors" />
                        <div className="h-[10%] bg-zinc-300 dark:bg-zinc-600 transition-colors" />
                      </div>
                    ) : (
                      /* Single Soft Gray Bar */
                      <div
                        className="w-full bg-zinc-100 dark:bg-zinc-800 [@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-zinc-200/90 dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-zinc-700 rounded-xl transition-colors"
                        style={{ height: `${heightPercent}%` }}
                      />
                    )}
                  </div>

                  {/* Day Label */}
                  <span
                    className={`mt-3 text-xs ${
                      bar.isHighlighted
                        ? 'text-zinc-950 dark:text-zinc-50 font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 font-medium'
                    }`}
                  >
                    {bar.day}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

