'use client'

import * as React from 'react'
import { AnimatePresence, useInView, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { cn } from '@/lib/utils'
import { EASE_ENTER, EASE_EXIT } from '@/lib/motion'

export interface AnimatedBrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  interactive?: boolean
  monochrome?: boolean
}

type LogoMood = 'smile' | 'v' | 'sad'

const MOOD_SEQUENCE: readonly LogoMood[] = ['smile', 'v', 'sad']

const MOOD_LABELS: Record<LogoMood, string> = {
  smile: ':)',
  v: ':v',
  sad: ':(',
}

const SIZE_DIMENSIONS = {
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
} as const

function subscribePageVisibility(onStoreChange: () => void) {
  document.addEventListener('visibilitychange', onStoreChange)
  return () => document.removeEventListener('visibilitychange', onStoreChange)
}

function getPageVisibilitySnapshot() {
  return typeof document === 'undefined' ? true : !document.hidden
}

function getPageVisibilityServerSnapshot() {
  return true
}

export function AnimatedBrandLogo({
  size = 'md',
  className,
  interactive = true,
}: AnimatedBrandLogoProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef)
  const isPageVisible = React.useSyncExternalStore(
    subscribePageVisibility,
    getPageVisibilitySnapshot,
    getPageVisibilityServerSnapshot
  )
  const prefersReducedMotion = useReducedMotion()
  const [moodIndex, setMoodIndex] = React.useState(0)
  const [isBlinking, setIsBlinking] = React.useState(false)
  const [cycleTick, setCycleTick] = React.useState(0)

  const currentMood = MOOD_SEQUENCE[moodIndex]
  const dim = SIZE_DIMENSIONS[size]
  const isAutoPlaying = interactive && isInView && isPageVisible && !prefersReducedMotion
  const showBlink = isAutoPlaying && isBlinking && currentMood === 'smile'

  // Automatic sequential cycle: :) -> :v -> :( -> :) only while visible & active
  React.useEffect(() => {
    if (!isAutoPlaying) return

    const timer = window.setInterval(() => {
      setIsBlinking(false)
      setMoodIndex((prev) => (prev + 1) % MOOD_SEQUENCE.length)
    }, 1500)

    return () => window.clearInterval(timer)
  }, [isAutoPlaying, cycleTick])

  // Subtle natural blink halfway through the :) state
  React.useEffect(() => {
    if (!isAutoPlaying || currentMood !== 'smile') return

    let blinkOffTimer: number | undefined
    const blinkOnTimer = window.setTimeout(() => {
      setIsBlinking(true)
      blinkOffTimer = window.setTimeout(() => {
        setIsBlinking(false)
      }, 130)
    }, 650)

    return () => {
      window.clearTimeout(blinkOnTimer)
      if (blinkOffTimer !== undefined) {
        window.clearTimeout(blinkOffTimer)
      }
    }
  }, [isAutoPlaying, currentMood])

  const handleCycleMood = () => {
    if (!interactive) return
    setIsBlinking(false)
    setMoodIndex((prev) => (prev + 1) % MOOD_SEQUENCE.length)
    setCycleTick((prev) => prev + 1)
  }

  return (
    <div
      ref={containerRef}
      onClick={handleCycleMood}
      role="img"
      aria-label={`Techarea Production (${MOOD_LABELS[currentMood]})`}
      className={cn(
        'inline-flex items-center justify-center rounded-[30%] bg-[#08090E] ring-1 ring-black/5 dark:ring-white/15 select-none cursor-pointer transition-[scale] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:scale-100',
        interactive &&
          '[@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.04] active:scale-[0.96] motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
        className
      )}
      style={{ width: dim, height: dim }}
      title={`Techarea Production ${MOOD_LABELS[currentMood]}`}
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Dark Monochrome Squircle Container */}
        <rect width="36" height="36" rx="11" fill="#08090E" />

        {/* Subtle Inner Highlight Border */}
        <rect
          x="0.75"
          y="0.75"
          width="34.5"
          height="34.5"
          rx="10.25"
          stroke="#27272a"
          strokeWidth="0.8"
        />

        <AnimatePresence mode="wait" initial={false}>
          {currentMood === 'smile' && (
            <m.g
              key="smile"
              style={{ transformOrigin: '18px 18px' }}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94, y: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.94, y: -1, transition: { ease: EASE_EXIT } }
              }
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.18,
                ease: EASE_ENTER,
              }}
            >
              {showBlink ? (
                <>
                  <line
                    x1="11.2"
                    y1="14"
                    x2="14.8"
                    y2="14"
                    stroke="#FFFFFF"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                  />
                  <line
                    x1="21.2"
                    y1="14"
                    x2="24.8"
                    y2="14"
                    stroke="#FFFFFF"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <circle cx="13" cy="14" r="1.9" fill="#FFFFFF" />
                  <circle cx="23" cy="14" r="1.9" fill="#FFFFFF" />
                </>
              )}
              <path
                d="M 11.4 19.8 C 13.6 24.8 22.4 24.8 24.6 19.8"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </m.g>
          )}

          {currentMood === 'v' && (
            <m.g
              key="v"
              style={{ transformOrigin: '18px 18px' }}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94, y: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.94, y: -1, transition: { ease: EASE_EXIT } }
              }
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.18,
                ease: EASE_ENTER,
              }}
            >
              {/* Happy ^ ^ eyes */}
              <path
                d="M 11 15 Q 13 11.4 15 15"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 21 15 Q 23 11.4 25 15"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Open V mouth */}
              <path
                d="M 11.8 19.2 Q 18 20.4 24.2 19.2 L 18 26.2 Z"
                fill="#FFFFFF"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </m.g>
          )}

          {currentMood === 'sad' && (
            <m.g
              key="sad"
              style={{ transformOrigin: '18px 18px' }}
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94, y: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.94, y: -1, transition: { ease: EASE_EXIT } }
              }
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.18,
                ease: EASE_ENTER,
              }}
            >
              {/* Soft drooping brows */}
              <path
                d="M 10.6 12.2 Q 12.6 11.6 14.4 10.4"
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M 21.6 10.4 Q 23.4 11.6 25.4 12.2"
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              {/* Eyes */}
              <circle cx="13" cy="15.2" r="1.75" fill="#FFFFFF" />
              <circle cx="23" cy="15.2" r="1.75" fill="#FFFFFF" />
              {/* Frown curve */}
              <path
                d="M 11.4 24.6 C 13.6 19.6 22.4 19.6 24.6 24.6"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </m.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  )
}
