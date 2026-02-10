import Link from 'next/link'
import { Container } from './Container'

export function TopNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="backdrop-blur-md bg-brand-dark/85 border-b border-brand-iris/20">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 text-sm sm:text-base font-mono font-medium tracking-tight text-brand-text hover:text-brand-iris transition-colors"
              aria-label="WonderLens Lab"
            >
              {/* Eye indicator — iris ring + pupil */}
              <span className="relative inline-flex h-4 w-4 items-center justify-center">
                <span className="absolute inset-0 rounded-full border-2 border-brand-iris" />
                <span className="h-2 w-2 rounded-full bg-brand-iris" />
              </span>
              <span>WonderLens <span className="text-brand-iris">Lab</span></span>
            </Link>
            <a
              href="#contact"
              className="rounded border border-brand-iris bg-brand-iris/10 px-3 py-2 text-[11px] sm:text-xs font-mono tracking-[0.22em] uppercase text-brand-iris hover:bg-brand-iris/20 hover:text-brand-irisLight transition-colors"
            >
              Talk to the Lab
            </a>
          </div>
        </Container>
      </div>
    </header>
  )
}
