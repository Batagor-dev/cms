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
    <div className="relative hidden lg:flex flex-col items-center justify-center min-h-screen bg-[#fafbfc] border-l border-slate-100 p-8 xl:p-12 overflow-hidden select-none">
      {/* Background Subtle Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.45] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 text-center max-w-md mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Select &amp; Combine &amp; Integrate.
        </h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Develop and refine AI models using our intuitive interface.
        </p>
      </div>

      {/* Center 3x3 Constellation Network */}
      <div className="relative z-10 w-[380px] h-[380px] flex items-center justify-center">
        {/* SVG Connecting Dotted Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 380 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Radiating lines from Center (190, 190) to surrounding 8 nodes */}
          <line x1="190" y1="190" x2="60" y2="60" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="190" y2="60" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="320" y2="60" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="60" y2="190" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="320" y2="190" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="60" y2="320" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="190" y2="320" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="190" y1="190" x2="320" y2="320" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>

        {/* 3x3 Grid of Nodes with Third-Party Brand Icons */}
        <div className="grid grid-cols-3 grid-rows-3 gap-16 w-full h-full place-items-center">
          {/* 1. Meta (Top-Left) */}
          <div className="size-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-transform hover:scale-105">
            <SiMeta className="size-6 text-[#0081FB]" aria-label="Meta" />
          </div>

          {/* 2. Google (Top-Center) */}
          <div className="size-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-transform hover:scale-105">
            <FaGoogle className="size-5 text-slate-900" aria-label="Google" />
          </div>

          {/* 3. ElevenLabs (Top-Right) */}
          <div className="size-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-transform hover:scale-105">
            <SiElevenlabs className="size-5 text-slate-900" aria-label="ElevenLabs" />
          </div>

          {/* 4. Perplexity (Middle-Left) */}
          <div className="size-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-transform hover:scale-105">
            <SiPerplexity className="size-6 text-slate-900" aria-label="Perplexity" />
          </div>

          {/* 5. CENTER BRAND NODE */}
          <div className="z-20">
            <AnimatedBrandLogo size="xl" className="ring-4 ring-white shadow-xl shadow-slate-900/15" />
          </div>

          {/* 6. Hugging Face (Middle-Right) */}
          <div className="size-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-transform hover:scale-105">
            <SiHuggingface className="size-6 text-[#FFD21E]" aria-label="Hugging Face" />
          </div>

          {/* 7. GitHub (Bottom-Left) */}
          <div className="size-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-transform hover:scale-105">
            <FaGithub className="size-6 text-slate-900" aria-label="GitHub" />
          </div>

          {/* 8. Anthropic Claude (Bottom-Center) */}
          <div className="size-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-transform hover:scale-105">
            <SiAnthropic className="size-5 text-[#D97757]" aria-label="Anthropic Claude" />
          </div>

          {/* 9. AI Brain / Intelligence (Bottom-Right) */}
          <div className="size-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-transform hover:scale-105">
            <FaBrain className="size-6 text-slate-800" aria-label="AI Brain" />
          </div>
        </div>
      </div>
    </div>
  )
}
