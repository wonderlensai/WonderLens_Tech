import { Container } from '@/components/lab/Container'
import { Reveal } from '@/components/lab/Reveal'
import { TopNav } from '@/components/lab/TopNav'
import { CompoundingLoopDiagram, PipelineDiagram } from '@/components/lab/Diagrams'
import { ContactForm } from '@/components/lab/ContactForm'

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="py-20 sm:py-28 relative">
      {/* faint lab grid on every section */}
      <div className="absolute inset-0 lab-grid pointer-events-none opacity-40" />
      <Container>
        <div className="grid gap-10 sm:gap-12 relative z-10">
          <Reveal>
            <div className="flex items-baseline justify-between gap-6 border-b border-brand-iris/30 pb-4">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-brand-text">
                {title}
              </h2>
              <div className="hidden sm:block text-[10px] font-mono tracking-[0.28em] uppercase text-brand-amber">
                WonderLens Lab
              </div>
            </div>
          </Reveal>
          {children}
        </div>
      </Container>
      <div className="lab-divider mx-auto max-w-6xl" />
    </section>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <TopNav />

      {/* Hero — iris ring glow */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-brand-dark" />
          {/* Large iris glow — vivid blue */}
          <div className="absolute left-1/2 top-[-200px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-brand-iris/15 blur-[120px]" />
          {/* Limbal ring warmth */}
          <div className="absolute left-[55%] top-[-100px] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-brand-amber/12 blur-[80px]" />
          {/* Iris concentric ring effect */}
          <div className="absolute left-1/2 top-[60px] h-[300px] w-[800px] -translate-x-1/2 iris-ring opacity-60" />
        </div>

        <Container>
          <div className="grid gap-10 relative z-10">
            {/* Lab identifier */}
            <Reveal>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-brand-iris/60" />
                <span className="text-[10px] font-mono tracking-[0.30em] uppercase text-brand-iris">
                  Research Lab
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] text-brand-text leading-[1.02]">
                The control layer for{' '}
                <span className="text-brand-iris">machine vision</span>.
              </h1>
            </Reveal>

            <Reveal delayMs={120}>
              <p className="max-w-2xl text-base sm:text-lg text-brand-muted leading-relaxed font-mono">
                A research lab building eventization, temporal memory, and verification for vision systems.
              </p>
            </Reveal>

            <Reveal delayMs={220}>
              <div className="flex items-center gap-5 pt-2">
                <a
                  href="#contact"
                  className="rounded border border-brand-iris bg-brand-iris/10 px-5 py-2.5 text-xs font-mono tracking-[0.22em] uppercase text-brand-iris hover:bg-brand-iris/20 hover:text-brand-irisLight transition-colors"
                >
                  Talk to the Lab
                </a>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-amber animate-pulse" />
                  <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-brand-amber">
                    Frontier research
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 1. Thesis */}
      <Section id="thesis" title="Thesis">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="grid gap-5">
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-text leading-snug">
                Vision is not solved because failure is{' '}
                <span className="text-brand-danger">systemic</span>.
              </p>
              <p className="text-base sm:text-lg text-brand-muted leading-relaxed max-w-prose">
                Reliability requires memory, control, and verification under uncertainty.
              </p>
            </div>
          </Reveal>
          <Reveal delayMs={140}>
            <PipelineDiagram />
          </Reveal>
        </div>
      </Section>

      {/* 2. What We're Building */}
      <Section id="building" title="What We're Building">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="grid gap-5">
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-text leading-snug">
                A system that turns perception into{' '}
                <span className="text-brand-iris">decisions</span>.
              </p>
              <div className="grid gap-3 font-mono text-base sm:text-lg text-brand-muted leading-relaxed">
                <p className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-brand-iris" />
                  Eventization.
                </p>
                <p className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-brand-iris" />
                  Temporal memory.
                </p>
                <p className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-brand-iris" />
                  Control and verification loops.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delayMs={140}>
            <div className="rounded-lg border border-brand-iris/30 bg-brand-primary/60 p-6 sm:p-7 backdrop-blur-sm">
              <div className="text-[10px] font-mono tracking-[0.28em] uppercase text-brand-amber mb-5">
                Output
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-6 border-b border-brand-iris/15 pb-3">
                  <div className="text-sm text-brand-text font-mono">Structured events</div>
                  <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-brand-success">typed</div>
                </div>
                <div className="flex items-center justify-between gap-6 border-b border-brand-iris/15 pb-3">
                  <div className="text-sm text-brand-text font-mono">Evidence attached</div>
                  <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-brand-success">auditable</div>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="text-sm text-brand-text font-mono">Re-runs on demand</div>
                  <div className="text-[10px] font-mono tracking-[0.24em] uppercase text-brand-success">verified</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 3. Research Directions */}
      <Section id="research" title="Research Directions">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-text leading-snug">
              Problems that survive the demo.
            </p>
          </Reveal>
          <Reveal delayMs={140}>
            <ul className="grid gap-3 text-base sm:text-lg leading-relaxed font-mono">
              <li className="flex items-start gap-3 text-brand-muted">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-iris flex-shrink-0" />
                Temporal invariants and state estimation
              </li>
              <li className="flex items-start gap-3 text-brand-muted">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-iris flex-shrink-0" />
                Open-set and anomaly detection
              </li>
              <li className="flex items-start gap-3 text-brand-muted">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-iris flex-shrink-0" />
                Verification and calibration under drift
              </li>
              <li className="flex items-start gap-3 text-brand-muted">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-amber flex-shrink-0" />
                Tool-using vision agents
              </li>
              <li className="flex items-start gap-3 text-brand-muted">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-amber flex-shrink-0" />
                Decision-labeled data generation
              </li>
              <li className="flex items-start gap-3 text-brand-muted">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-danger flex-shrink-0" />
                Real-time constraints at the edge
              </li>
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* 4. Why This Matters */}
      <Section id="matters" title="Why This Matters">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-text leading-snug">
              In high-stakes environments, mistakes{' '}
              <span className="text-brand-danger">compound</span>.
            </p>
          </Reveal>
          <Reveal delayMs={140}>
            <ul className="grid gap-3 text-base sm:text-lg leading-relaxed font-mono">
              <li className="flex items-start gap-3 text-brand-muted">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-amber flex-shrink-0" />
                Safety and industrial operations
              </li>
              <li className="flex items-start gap-3 text-brand-muted">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-amber flex-shrink-0" />
                Robotics and autonomy
              </li>
              <li className="flex items-start gap-3 text-brand-muted">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-iris flex-shrink-0" />
                Critical infrastructure
              </li>
              <li className="flex items-start gap-3 text-brand-muted">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-iris flex-shrink-0" />
                Medical and laboratory workflows
              </li>
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* 5. Compounding Advantage */}
      <Section id="advantage" title="Compounding Advantage">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="grid gap-5">
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-text leading-snug">
                The dataset improves because the system makes{' '}
                <span className="text-brand-success">decisions</span>.
              </p>
              <p className="text-base sm:text-lg text-brand-muted leading-relaxed max-w-prose font-mono">
                Decision-labeled, temporal data compounds over years.
              </p>
            </div>
          </Reveal>
          <Reveal delayMs={140}>
            <CompoundingLoopDiagram />
          </Reveal>
        </div>
      </Section>

      {/* 6. Principles */}
      <Section id="principles" title="Principles">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-text leading-snug">
              Restraint is a{' '}
              <span className="text-brand-amber">research tool</span>.
            </p>
          </Reveal>
          <Reveal delayMs={140}>
            <ul className="grid gap-3 text-base sm:text-lg leading-relaxed font-mono">
              <li className="text-brand-muted">Systems over demos.</li>
              <li className="text-brand-muted">Verification over confidence.</li>
              <li className="text-brand-text">Memory is a first-class primitive.</li>
              <li className="text-brand-muted">Measure everything that matters.</li>
              <li className="text-brand-text">Edge cases are the product.</li>
              <li className="text-brand-muted">Build for the decade.</li>
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* 7. Contact */}
      <section id="contact" className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 lab-grid pointer-events-none opacity-40" />
        <Container>
          <div className="grid gap-10 sm:gap-12 relative z-10">
            <Reveal>
              <div className="flex items-baseline justify-between gap-6 border-b border-brand-iris/30 pb-4">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-brand-text">
                  Contact
                </h2>
                <div className="hidden sm:block text-[10px] font-mono tracking-[0.28em] uppercase text-brand-amber">
                  Partner / Research / Investment
                </div>
              </div>
            </Reveal>

            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <Reveal>
                <div className="grid gap-5">
                  <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-brand-text leading-snug">
                    One message is enough.
                  </p>
                  <p className="text-base sm:text-lg text-brand-muted leading-relaxed max-w-prose font-mono">
                    We prefer a clear problem statement over a long thread.
                  </p>
                  <div className="pt-2 text-[11px] font-mono tracking-[0.24em] uppercase">
                    <a href="mailto:lab@wonderlens.ai" className="text-brand-iris hover:text-brand-irisLight transition-colors">
                      lab@wonderlens.ai
                    </a>
                  </div>
                </div>
              </Reveal>
              <Reveal delayMs={140}>
                <div className="rounded-lg border border-brand-iris/30 bg-brand-primary/60 p-6 sm:p-7 backdrop-blur-sm">
                  <ContactForm />
                </div>
              </Reveal>
            </div>

            <Reveal delayMs={180}>
              <footer className="pt-4 flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-brand-iris" />
                  <span className="text-xs font-mono tracking-[0.20em] uppercase text-brand-muted">WonderLens Lab</span>
                </div>
                <span className="text-xs font-mono tracking-[0.20em] uppercase text-brand-faint">&copy; {new Date().getFullYear()}</span>
              </footer>
            </Reveal>
          </div>
        </Container>
      </section>
    </main>
  )
}
