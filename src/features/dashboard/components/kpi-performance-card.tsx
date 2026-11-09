'use client'

import * as React from 'react'
import { Activity, ChevronDown, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function KpiPerformanceCard() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Ags', 'Sept', 'Okt', 'Nov']

  return (
    <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-700 transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <CardContent className="p-0 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
              <Activity className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 leading-tight">
                KPI performance
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Your personal KPI performance
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/70 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
          >
            <span>Last month</span>
            <ChevronDown className="size-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
          </button>
        </div>

        {/* Big Number & KPI Trend */}
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight tabular-nums">
            90.75%
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-950 dark:text-zinc-100">
            <ArrowUpRight className="size-4" aria-hidden="true" />
            <span>32%</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">vs last month</span>
          </div>
        </div>

        {/* Stepped Area SVG Chart in Monochrome */}
        <div className="relative pt-2 text-zinc-950 dark:text-zinc-100">
          <svg
            viewBox="0 0 450 140"
            className="w-full h-32 overflow-visible"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="kpi-mono-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Stepped Area Path */}
            <path
              d="M 10 100 
                 L 50 100 L 50 85 
                 L 100 85 L 100 65 
                 L 150 65 L 150 45 
                 L 200 45 L 200 70 
                 L 250 70 L 250 50 
                 L 300 50 L 300 75 
                 L 350 75 L 350 72 
                 L 440 72 
                 L 440 135 L 10 135 Z"
              fill="url(#kpi-mono-grad)"
            />

            {/* Stepped Top Stroke */}
            <path
              d="M 10 100 
                 L 50 100 L 50 85 
                 L 100 85 L 100 65 
                 L 150 65 L 150 45 
                 L 200 45 L 200 70 
                 L 250 70 L 250 50 
                 L 300 50 L 300 75 
                 L 350 75 L 350 72 
                 L 440 72"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* X-axis Month Labels */}
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-2 px-1">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

