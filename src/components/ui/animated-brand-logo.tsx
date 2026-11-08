'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AnimatedBrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  interactive?: boolean
}

export function AnimatedBrandLogo({
  size = 'md',
  className,
  interactive = true,
}: AnimatedBrandLogoProps) {
  const [isVMode, setIsVMode] = React.useState(false)
  const [isBlinking, setIsBlinking] = React.useState(false)

  // Periodic automatic `:V` and blink animation every 3.5 seconds
  React.useEffect(() => {
    if (!interactive) return

    const interval = setInterval(() => {
      // Toggle to :V for 1.4s then back to normal smile
      setIsVMode(true)
      setTimeout(() => {
        setIsVMode(false)
      }, 1400)
    }, 4000)

    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => {
        setIsBlinking(false)
      }, 150)
    }, 2800)

    return () => {
      clearInterval(interval)
      clearInterval(blinkInterval)
    }
  }, [interactive])

  const sizeClasses = {
    sm: 'size-9 rounded-lg',
    md: 'size-11 rounded-xl',
    lg: 'size-14 rounded-2xl',
    xl: 'size-18 rounded-2xl',
  }

  const svgSizes = {
    sm: 'size-5',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-10',
  }

  return (
    <div
      onMouseEnter={() => interactive && setIsVMode(true)}
      onMouseLeave={() => interactive && setIsVMode(false)}
      onClick={() => interactive && setIsVMode((prev) => !prev)}
      className={cn(
        'bg-slate-950 text-white flex items-center justify-center shadow-md select-none cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group',
        sizeClasses[size],
        className
      )}
      title="Click or hover me! :V"
    >
      <svg
        viewBox="0 0 24 24"
        className={cn('transition-transform duration-200', svgSizes[size])}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* EYES */}
        {isVMode ? (
          /* Happy curved anime eyes (^ ^) during :V */
          <g className="transition-all duration-200">
            <path
              d="M 5.8 8.5 Q 7.5 5.5 9.2 8.5"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 14.8 8.5 Q 16.5 5.5 18.2 8.5"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ) : isBlinking ? (
          /* Blinking closed eyes (-) */
          <g className="transition-all duration-100">
            <line
              x1="6"
              y1="8"
              x2="9.5"
              y2="8"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="14.5"
              y1="8"
              x2="18"
              y2="8"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        ) : (
          /* Normal round white dot eyes from reference */
          <g className="transition-all duration-200">
            <circle cx="7.5" cy="8" r="1.8" fill="white" />
            <circle cx="16.5" cy="8" r="1.8" fill="white" />
          </g>
        )}

        {/* MOUTH */}
        {isVMode ? (
          /* Animated :V Open Mouth */
          <path
            d="M 6.5 12.5 Q 12 13.5 17.5 12.5 L 12 19.5 Z"
            fill="white"
            stroke="white"
            strokeWidth="1.2"
            strokeLinejoin="round"
            className="animate-pulse"
          />
        ) : (
          /* Normal Sweet Smile Curve from reference */
          <path
            d="M 5.5 13.5 C 7.5 18 16.5 18 18.5 13.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-300"
          />
        )}
      </svg>
    </div>
  )
}

