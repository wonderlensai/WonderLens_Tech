import type { RefObject } from 'react'
import { useEffect, useMemo, useState } from 'react'

type Options = {
  rootMargin?: string
  threshold?: number
  once?: boolean
}

export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  opts: Options = {}
) {
  const { rootMargin = '0px 0px -10% 0px', threshold = 0.15, once = true } = opts
  const [inView, setInView] = useState(false)

  const observer = useMemo(() => {
    if (typeof window === 'undefined') return null
    return new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          setInView(true)
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold }
    )
  }, [rootMargin, threshold, once])

  useEffect(() => {
    const el = ref.current
    if (!el || !observer) return
    observer.observe(el)
    return () => observer.unobserve(el)
  }, [ref, observer])

  return inView
}
