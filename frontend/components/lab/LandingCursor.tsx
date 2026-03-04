'use client'

import { useEffect } from 'react'

const SECTION_COLORS = [
  { selector: '.wl-hero', dot: '#8A6A3F', ring: '#8A6A3F', blend: 'multiply' as const },
  { selector: '.wl-band', dot: '#F5F1EA', ring: '#F5F1EA', blend: 'normal' as const },
  { selector: '#problems', dot: '#2F6F63', ring: '#2F6F63', blend: 'multiply' as const },
  { selector: '#pitch', dot: '#7C5E2A', ring: '#7C5E2A', blend: 'multiply' as const },
  { selector: '.wl-band-secondary', dot: '#6DC7C3', ring: '#6DC7C3', blend: 'normal' as const },
  { selector: '#engage', dot: '#4E7F3A', ring: '#4E7F3A', blend: 'multiply' as const },
  { selector: '.wl-intel', dot: '#63D1CC', ring: '#63D1CC', blend: 'normal' as const },
  { selector: '.wl-cta', dot: '#F0E7D8', ring: '#F0E7D8', blend: 'normal' as const },
  { selector: '.wl-footer', dot: '#A58F72', ring: '#A58F72', blend: 'normal' as const },
]

export function LandingCursor() {
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot = document.getElementById('wl-cursor-dot')
    const ring = document.getElementById('wl-cursor-ring')
    if (!dot || !ring) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let frame = 0
    let baseDot = SECTION_COLORS[0].dot
    let baseRing = SECTION_COLORS[0].ring
    let baseBlend = SECTION_COLORS[0].blend

    const applyCursorColor = (dotColor: string, ringColor: string, blendMode: 'normal' | 'multiply') => {
      dot.style.background = dotColor
      dot.style.mixBlendMode = blendMode
      ring.style.borderColor = ringColor
    }

    const setCursorColor = (section: (typeof SECTION_COLORS)[number]) => {
      baseDot = section.dot
      baseRing = section.ring
      baseBlend = section.blend
      applyCursorColor(baseDot, baseRing, baseBlend)
    }

    const detectSection = () => {
      const probe = window.scrollY + window.innerHeight * 0.5
      const active =
        SECTION_COLORS.find((section) => {
          const element = document.querySelector(section.selector)
          if (!element) return false
          const top = (element as HTMLElement).offsetTop
          const bottom = top + (element as HTMLElement).offsetHeight
          return probe >= top && probe < bottom
        }) ?? SECTION_COLORS[0]

      setCursorColor(active)
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.16
      ringY += (mouseY - ringY) * 0.16
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`
      frame = window.requestAnimationFrame(animate)
    }

    const onMove = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
    }

    const onDown = () => {
      ring.classList.add('is-pressed')
    }

    const onUp = () => {
      ring.classList.remove('is-pressed')
    }

    const onEnterLink = (event: Event) => {
      ring.classList.add('is-hovering')
      const target = event.currentTarget as HTMLElement | null
      if (!target) return
      if (target.classList.contains('wl-btn-light')) {
        applyCursorColor('#16120F', '#16120F', 'normal')
        return
      }
      if (target.classList.contains('wl-btn-ghost')) {
        applyCursorColor('#B87A08', '#B87A08', 'normal')
      }
    }

    const onLeaveLink = () => {
      ring.classList.remove('is-hovering')
      applyCursorColor(baseDot, baseRing, baseBlend)
    }

    const interactive = Array.from(document.querySelectorAll('a, button, textarea'))
    interactive.forEach((element) => {
      element.addEventListener('mouseenter', onEnterLink)
      element.addEventListener('mouseleave', onLeaveLink)
    })

    detectSection()
    frame = window.requestAnimationFrame(animate)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', detectSection, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', detectSection)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      interactive.forEach((element) => {
        element.removeEventListener('mouseenter', onEnterLink)
        element.removeEventListener('mouseleave', onLeaveLink)
      })
    }
  }, [])

  return (
    <>
      <div id="wl-cursor-dot" className="wl-cursor-dot" />
      <div id="wl-cursor-ring" className="wl-cursor-ring" />
    </>
  )
}
