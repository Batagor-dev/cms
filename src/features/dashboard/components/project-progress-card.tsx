'use client'

import * as React from 'react'
import { Folder, ChevronDown, ArrowRight, CheckCircle2, Clock, CircleDashed } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function ProjectProgressCard() {
  const totalTicks = 28
  const completedTicks = Math.round(totalTicks * 0.74) // ~21 ticks active

  const milestones = [
    {
      title: 'Research phase',
      status: 'Completed',
      statusColor: 'text-zinc-950 dark:text-zinc-50 font-semibold',
      icon: CheckCircle2,
    },
    {
      title: 'Design sprint',
      status: 'In progress',
      statusColor: 'text-zinc-600 dark:text-zinc-300 font-semibold',
      icon: Clock,
    },
    {
      title: 'Dev handoff',
      status: 'Not started',
      statusColor: 'text-zinc-500 dark:text-zinc-400 font-medium',
      icon: CircleDashed,
    },
  ]

  return (
    <Card className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs [@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-300 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:border-zinc-700 transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between">
      <CardContent className="p-0 flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shrink-0">
              <Folder className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 leading-tight">
                Project progress
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                An overview of active project
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/70 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Techarea Production</span>
            <ChevronDown className="size-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
          </button>
        </div>

        {/* Unique Striped Progress Bar */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-1 pr-2">
              {Array.from({ length: totalTicks }).map((_, index) => {
                const isComplete = index < completedTicks
                return (
                  <div
                    key={index}
                    className={`h-7 flex-1 rounded-xs transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                      isComplete
                        ? 'bg-black dark:bg-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}
                  />
                )
              })}
            </div>
            <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50 shrink-0 tabular-nums">
              74% Completed
            </span>
          </div>
        </div>

        {/* Milestone Stages Checklist */}
        <div className="flex flex-col gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          {milestones.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300 font-medium">
                  <Icon className="size-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
                  <span>{item.title}</span>
                </div>
                <span className={item.statusColor}>
                  {item.status}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>

      {/* Card Footer Link */}
      <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-zinc-50 flex items-center justify-between w-full group transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
        >
          <span>View project details</span>
          <ArrowRight className="size-4 text-zinc-500 dark:text-zinc-400 [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-1 [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-zinc-950 dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover:text-zinc-50 transition-[translate,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none" aria-hidden="true" />
        </button>
      </div>
    </Card>
  )
}

