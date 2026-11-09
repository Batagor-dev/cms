'use client'

import type { ReactNode } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'

/**
 * Provides a tree-shaken Motion context using `domAnimation` + `strict` mode
 * and global `reducedMotion="user"` accessibility enforcement.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}

