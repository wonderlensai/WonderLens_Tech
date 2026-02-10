'use client'

import { useRef } from 'react'
import { useInView } from '@/lib/useInView'

export function Reveal({
  children,
  delayMs = 0,
  className = '',
}: {
  children: React.ReactNode
  delayMs?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { rootMargin: '0px 0px -12% 0px', threshold: 0.12, once: true })

  return (
    <div
      ref={ref}
      className={`wl-reveal ${className}`}
      data-inview={inView ? 'true' : 'false'}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  )
}

