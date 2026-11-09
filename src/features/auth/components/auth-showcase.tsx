'use client'

import * as React from 'react'
import {
  SiMeta,
  SiAnthropic,
  SiElevenlabs,
  SiPerplexity,
  SiHuggingface,
} from 'react-icons/si'
import { FaGoogle, FaGithub, FaBrain } from 'react-icons/fa6'
import { AnimatedBrandLogo } from '@/components/ui'

export function AuthShowcase() {
  return (
    <div className="relative hidden lg:flex flex-col items-center justify-center min-h-screen bg-[#fafbfc] dark:bg-zinc-900/60 border-l border-slate-100 dark:border-zinc-800 p-8 xl:p-12 overflow-hidden select-none">
      {/* Background Subtle Dot Pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.45] dark:opacity-100 pointer-events-none bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Top Header */}
      <div className="relative z-10 text-center max-w-md mb-12">
        <h2 className="text-2xl font-semibold tracking-tight leading-tight text-slate-900 dark:text-zinc-50">
          Select &amp; Combine &amp; Integrate.
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-normal max-w-prose">
          Develop and refine AI models using our intuitive interface.
        </p>
      </div>

      {/* Center 3x3 Constellation Network */}
      <div className="relative z-10 w-[380px] h-[380px] flex items-center justify-center">
        {/* SVG Connecting Dotted Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300 dark:stroke-zinc-700"
          viewBox="0 0 380 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Radiating lines from Center (190, 190) to surrounding 8 nodes */}
          <line x1="190" y1="190" x2="60" y2="60" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="190" y2="60" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="320" y2="60" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="60" y2="190" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="320" y2="190" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="60" y2="320" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="190" y2="320" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="320" y2="320" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>

        {/* 3x3 Grid of Nodes with Third-Party Brand Icons */}
        <div className="grid grid-cols-3 grid-rows-3 gap-16 w-full h-full place-items-center">
          {/* 1. Meta (Top-Left) */}
          <div className="size-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center transition-[scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-105 motion-reduce:transition-none motion-reduce:scale-100">
            <SiMeta className="size-7 text-[#0081FB]" aria-label="Meta" />
          </div>

          {/* 2. Google (Top-Center) */}
          <div className="size-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center transition-[scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-105 motion-reduce:transition-none motion-reduce:scale-100">
            <FaGoogle className="size-6 text-slate-900 dark:text-zinc-100" aria-label="Google" />
          </div>

          {/* 3. ElevenLabs (Top-Right) */}
          <div className="size-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center transition-[scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-105 motion-reduce:transition-none motion-reduce:scale-100">
            <SiElevenlabs className="size-6 text-slate-900 dark:text-zinc-100" aria-label="ElevenLabs" />
          </div>

          {/* 4. Perplexity (Middle-Left) */}
          <div className="size-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center transition-[scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-105 motion-reduce:transition-none motion-reduce:scale-100">
            <SiPerplexity className="size-7 text-slate-900 dark:text-zinc-100" aria-label="Perplexity" />
          </div>

          {/* 5. CENTER BRAND NODE */}
          <div className="z-20">
            <AnimatedBrandLogo size="xl" className="ring-4 ring-white dark:ring-zinc-900 shadow-xl shadow-slate-900/15 dark:shadow-black/50" />
          </div>

          {/* 6. Hugging Face (Middle-Right) */}
          <div className="size-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center transition-[scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-105 motion-reduce:transition-none motion-reduce:scale-100">
            <SiHuggingface className="size-7 text-[#FFD21E]" aria-label="Hugging Face" />
          </div>

          {/* 7. GitHub (Bottom-Left) */}
          <div className="size-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center transition-[scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-105 motion-reduce:transition-none motion-reduce:scale-100">
            <FaGithub className="size-7 text-slate-900 dark:text-zinc-100" aria-label="GitHub" />
          </div>

          {/* 8. Anthropic Claude (Bottom-Center) */}
          <div className="size-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center transition-[scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-105 motion-reduce:transition-none motion-reduce:scale-100">
            <SiAnthropic className="size-6 text-[#D97757]" aria-label="Anthropic Claude" />
          </div>

          {/* 9. AI Brain / Intelligence (Bottom-Right) */}
          <div className="size-16 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center transition-[scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:scale-105 motion-reduce:transition-none motion-reduce:scale-100">
            <FaBrain className="size-7 text-slate-800 dark:text-zinc-100" aria-label="AI Brain" />
          </div>
        </div>
      </div>
    </div>
  )
}
