'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { DURATION_PAGE_ENTER, EASE_ENTER } from '@/lib/motion'

let hasClientHydrated = false

/**
 * Smooth GPU-composited App Router page transition wrapper meant for `template.tsx`.
 * Skips entrance animation on initial SSR hydration to avoid LCP delay and hydration mismatch,
 * then animates opacity + translateY smoothly on subsequent client navigations.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion()
  const [shouldAnimateOnMount] = useState(() => hasClientHydrated)
  const [isTransitioning, setIsTransitioning] = useState(
    () => hasClientHydrated && !prefersReducedMotion
  )

  useEffect(() => {
    hasClientHydrated = true
  }, [])

  if (prefersReducedMotion || !shouldAnimateOnMount) {
    return <div>{children}</div>
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION_PAGE_ENTER, ease: EASE_ENTER }}
      style={isTransitioning ? { willChange: 'transform, opacity' } : undefined}
      onAnimationComplete={() => setIsTransitioning(false)}
    >
      {children}
    </m.div>
  )
}

