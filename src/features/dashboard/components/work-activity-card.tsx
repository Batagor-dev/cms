'use client'

import * as React from 'react'
import { Zap, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function WorkActivityCard() {
  const [activeRange, setActiveRange] = React.useState<'1d' | '7d' | '1m'>('1m')

  // Concentric SVG Ring parameters
  // Outer: r = 44, circumference = 2 * PI * 44 ≈ 276.46
  // Middle: r = 32, circumference = 2 * PI * 32 ≈ 201.06
  // Inner: r = 20, circumference = 2 * PI * 20 ≈ 125.66
  const outerCirc = 276.46
  const middleCirc = 201.06
  const innerCirc = 125.66

  // 12/24 = 50%
  const outerOffset = outerCirc - outerCirc * 0.5
  // 1/2 = 50%
  const middleOffset = middleCirc - middleCirc * 0.5
  // 3/8 = 37.5%
  const innerOffset = innerCirc - innerCirc * 0.375

  return (
    <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-700 transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between">
      <CardContent className="p-0 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
              <Zap className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 leading-tight">
                Work activity
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Task and project closure activity
              </p>
            </div>
          </div>

          {/* Time range pills */}
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

        {/* Content: Left Metrics + Right Concentric Radial Rings (Monochrome) */}
        <div className="grid grid-cols-2 items-center gap-3 sm:gap-4 pt-2">
          {/* Left Metrics */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="w-1.5 h-3 rounded-full bg-black dark:bg-white" />
                <span>Task</span>
              </div>
              <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 pl-3 tabular-nums">
                12<span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">/24</span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="w-1.5 h-3 rounded-full bg-zinc-500 dark:bg-zinc-400" />
                <span>Communication</span>
              </div>
              <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 pl-3 tabular-nums">
                1<span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">/2</span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="w-1.5 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                <span>Manual</span>
              </div>
              <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 pl-3 tabular-nums">
                3<span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">/8</span>
              </span>
            </div>
          </div>

          {/* Right: Concentric SVG Activity Rings in Monochrome */}
          <div className="flex items-center justify-center">
            <div className="relative size-28 sm:size-32 flex items-center justify-center">
              <svg className="size-full -rotate-90 overflow-visible" viewBox="0 0 100 100" aria-hidden="true">
                {/* Background tracks */}
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  strokeWidth="5"
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  fill="none"
                  strokeWidth="5"
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="none"
                  strokeWidth="5"
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                />

                {/* Outer Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  strokeWidth="5"
                  strokeDasharray={outerCirc}
                  strokeDashoffset={outerOffset}
                  strokeLinecap="round"
                  className="stroke-black dark:stroke-white transition-[stroke-dashoffset] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                />

                {/* Middle Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  fill="none"
                  strokeWidth="5"
                  strokeDasharray={middleCirc}
                  strokeDashoffset={middleOffset}
                  strokeLinecap="round"
                  className="stroke-zinc-500 dark:stroke-zinc-400 transition-[stroke-dashoffset] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                />

                {/* Inner Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="none"
                  strokeWidth="5"
                  strokeDasharray={innerCirc}
                  strokeDashoffset={innerOffset}
                  strokeLinecap="round"
                  className="stroke-zinc-300 dark:stroke-zinc-600 transition-[stroke-dashoffset] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                />
              </svg>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer Link */}
      <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-white flex items-center justify-between w-full group transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
        >
          <span>View activity details</span>
          <ArrowRight className="size-4 text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-1 [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-black dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover:text-white transition-[translate,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none" aria-hidden="true" />
        </button>
      </div>
    </Card>
  )
}

