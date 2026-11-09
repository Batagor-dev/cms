/**
 * Shared Motion (Framer Motion) timing curves, spring configs, and stagger helpers
 * adhering to 60fps GPU-composited animation guidelines in FRONTEND_RULES.md.
 */

export const EASE_ENTER = [0.16, 1, 0.3, 1] as const
export const EASE_EXIT = [0.7, 0, 0.84, 0] as const
export const EASE_TWO_WAY = [0.65, 0, 0.35, 1] as const

export const SPRING_INTERACTION = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
}

export const DURATION_MICRO = 0.2
export const DURATION_ELEMENT_ENTER = 0.28
export const DURATION_ELEMENT_EXIT = 0.2
export const DURATION_PAGE_ENTER = 0.35

export const MAX_STAGGER_ITEMS = 10

/**
 * Returns a clamped stagger delay in seconds so long lists never accumulate excessive delay.
 */
export function getStaggerDelay(
  index: number,
  stepSeconds = 0.04,
  maxItems = MAX_STAGGER_ITEMS
): number {
  if (index <= 0) return 0
  return Math.min(index, maxItems) * stepSeconds
}

