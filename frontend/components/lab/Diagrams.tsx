'use client'

import { useRef } from 'react'
import { useInView } from '@/lib/useInView'

function SvgWrap({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="rounded-lg border border-brand-iris/25 bg-brand-primary/60 p-5 sm:p-6 backdrop-blur-sm">
      <div className="mb-3 text-[10px] font-mono tracking-[0.28em] text-brand-amber uppercase">
        {label}
      </div>
      {children}
    </div>
  )
}

export function PipelineDiagram() {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { rootMargin: '0px 0px -15% 0px', threshold: 0.2, once: true })

  return (
    <div ref={ref} className="wl-draw" data-inview={inView ? 'true' : 'false'}>
      <SvgWrap label="System">
        <svg
          viewBox="0 0 900 180"
          className="h-[170px] w-full"
          role="img"
          aria-label="Eventization to Temporal Memory to Control and Verification"
        >
          <defs>
            <style>{`
              .box { fill: rgba(12, 16, 24, 0.8); stroke: rgba(59,140,196,0.35); stroke-width: 1.5; }
              .title { fill: rgba(240,237,230,0.95); font: 600 18px var(--font-sans); letter-spacing: 0.02em; }
              .sub { fill: rgba(59,140,196,0.95); font: 600 12px var(--font-mono); letter-spacing: 0.14em; text-transform: uppercase; }
              .link { stroke: rgba(212,165,74,0.7); stroke-width: 2; }
              .hint { fill: rgba(126,134,148,0.9); font: 500 12px var(--font-mono); letter-spacing: 0.04em; }
            `}</style>
          </defs>

          <rect className="box" x="30" y="42" rx="10" ry="10" width="250" height="96" />
          <text className="sub" x="56" y="76">Eventization</text>
          <text className="title" x="56" y="108">From pixels to events</text>

          <rect className="box" x="325" y="42" rx="10" ry="10" width="250" height="96" />
          <text className="sub" x="351" y="76">Temporal Memory</text>
          <text className="title" x="351" y="108">State across time</text>

          <rect className="box" x="620" y="42" rx="10" ry="10" width="250" height="96" />
          <text className="sub" x="646" y="76">Control</text>
          <text className="title" x="646" y="108">Verification loops</text>

          <line className="link draw" x1="280" y1="90" x2="325" y2="90" />
          <line className="link draw" x1="575" y1="90" x2="620" y2="90" />

          <text className="hint" x="30" y="168">One pipeline. Many environments.</text>
        </svg>
      </SvgWrap>
    </div>
  )
}

export function CompoundingLoopDiagram() {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { rootMargin: '0px 0px -15% 0px', threshold: 0.2, once: true })

  return (
    <div ref={ref} className="wl-draw" data-inview={inView ? 'true' : 'false'}>
      <SvgWrap label="Compounding">
        <svg
          viewBox="0 0 900 240"
          className="h-[220px] w-full"
          role="img"
          aria-label="Compounding loop from decisions to labeled temporal data to better control"
        >
          <defs>
            <style>{`
              .node { fill: rgba(12, 16, 24, 0.8); stroke: rgba(59,140,196,0.35); stroke-width: 1.5; }
              .t { fill: rgba(240,237,230,0.95); font: 600 16px var(--font-sans); letter-spacing: 0.01em; }
              .m { fill: rgba(59,140,196,0.95); font: 600 12px var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; }
              .arc { stroke: rgba(212,165,74,0.7); stroke-width: 2; fill: none; }
              .small { fill: rgba(126,134,148,0.9); font: 500 12px var(--font-mono); letter-spacing: 0.04em; }
            `}</style>
            <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(212,165,74,0.7)" />
            </marker>
          </defs>

          <rect className="node" x="70" y="70" rx="10" ry="10" width="230" height="86" />
          <text className="m" x="96" y="104">Decisions</text>
          <text className="t" x="96" y="132">Operators act</text>

          <rect className="node" x="335" y="34" rx="10" ry="10" width="230" height="86" />
          <text className="m" x="361" y="68">Labels</text>
          <text className="t" x="361" y="96">Decision-linked</text>

          <rect className="node" x="335" y="132" rx="10" ry="10" width="230" height="86" />
          <text className="m" x="361" y="166">Memory</text>
          <text className="t" x="361" y="194">Temporal data</text>

          <rect className="node" x="600" y="70" rx="10" ry="10" width="230" height="86" />
          <text className="m" x="626" y="104">Control</text>
          <text className="t" x="626" y="132">Fewer failures</text>

          <path className="arc draw" markerEnd="url(#arrow)" d="M 300 110 C 330 110, 320 70, 335 70" />
          <path className="arc draw" markerEnd="url(#arrow)" d="M 450 120 C 450 132, 450 132, 450 132" />
          <path className="arc draw" markerEnd="url(#arrow)" d="M 565 175 C 595 175, 585 132, 600 122" />
          <path className="arc draw" markerEnd="url(#arrow)" d="M 715 156 C 715 210, 170 210, 170 156" />

          <text className="small" x="70" y="226">The dataset improves because the system makes decisions.</text>
        </svg>
      </SvgWrap>
    </div>
  )
}
