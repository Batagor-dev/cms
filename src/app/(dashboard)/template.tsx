import type { ReactNode } from 'react'
import { PageTransition } from '@/components/motion/page-transition'

export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}

