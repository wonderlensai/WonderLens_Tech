import { LandingCursor } from '@/components/lab/LandingCursor'

const solvedCases = [
  {
    id: 'Case 01',
    problem: 'Scrap material was going missing. Nobody knew where, when, or who.',
    situation:
      'A manufacturing operation was losing significant raw material to scrap theft during shift transitions and in low-traffic areas where manual supervision was absent. No existing system was flagging it.',
    action:
      'We mapped their existing camera coverage to the scrap yard and staging areas, then built a custom detection model that identifies unauthorised material movement and triggers an alert within 2 seconds with a clip, timestamp, and zone tag.',
    outcome:
      'Scrap losses reduced from day one of deployment. Every incident is now logged automatically with full video evidence, without adding a single new camera.',
    sector: 'Manufacturing',
  },
  {
    id: 'Case 02',
    problem: 'An expensive sensor was doing a job a camera could do at a fraction of the cost.',
    situation:
      'A facility was running a dedicated industrial sensor to monitor a specific process condition. It was reliable, but expensive to maintain and a single point of failure.',
    action:
      "We assessed whether a camera positioned at the same point could detect the same signal. It could, so we built a vision model that replicates the sensor's output in real time and feeds the same thresholds into the existing workflow.",
    outcome:
      'The dedicated sensor was decommissioned. The camera now handles detection continuously, with the added benefit of a full visual record of every triggered event.',
    sector: 'Industrial / Process',
  },
]

const useCases = [
  ['Material & Scrap Tracking', 'Detect unauthorised material movement, scrap accumulation, or inventory discrepancies in real time.'],
  ['Sensor Replacement', 'Replace expensive point sensors with vision intelligence using the same output, lower cost, and a full visual record.'],
  ['Process Anomaly Detection', 'Detect deviations in your specific process, from flow and fill level to output consistency, without manual inspection.'],
  ['Custom Safety Rules', 'Build site-specific detections around the operational rules your team actually enforces.'],
  ['Operational Reporting', 'Auto-generate shift handover notes, compliance logs, and incident summaries directly from live footage.'],
  ['Forensic Search', 'Ask for every time a specific event happened near a specific zone over a time range and get an instant clip reel.'],
]

const liveEvents = [
  {
    level: 'Critical',
    title: 'Scrap Movement',
    body: 'Unauthorised material movement detected in Scrap Yard Zone 2. Alert sent to the ops manager.',
    source: 'CAM-03',
    time: 'now',
  },
  {
    level: 'Warning',
    title: 'Process Deviation',
    body: 'Fill level dropped below threshold on Line 2. Custom model trigger created.',
    source: 'CAM-05',
    time: '8m ago',
  },
  {
    level: 'Info',
    title: 'Shift Report Generated',
    body: 'End-of-shift summary dispatched: 3 incidents, 2 alerts, 0 injuries.',
    source: 'SYSTEM',
    time: '32m ago',
  },
]

export default function HomePage() {
  return (
    <main className="wl-page">
      <LandingCursor />
      <nav className="wl-nav">
        <a href="#" className="wl-brand" aria-label="WonderLens AI home">
          <img src="/images/wonderlens-logo.svg" alt="WonderLens AI logo" className="wl-brand-mark" />
          <span>WonderLens AI</span>
        </a>
        <div className="wl-nav-links">
          <a href="#problems">Solved Problems</a>
          <a href="#pitch">Our Approach</a>
          <a href="#engage">How We Work</a>
          <a href="#cta">Get in Touch</a>
        </div>
        <a href="#cta" className="wl-nav-btn">
          Tell Us Your Problem
        </a>
      </nav>

      <section className="wl-hero">
        <div className="wl-hero-ghost">camera</div>
        <div className="wl-hero-meta">
          <span>Industrial Vision Intelligence</span>
          <hr />
          <span>Built around your problem, not ours</span>
        </div>

        <h1 className="wl-hero-title">
          Your cameras.
          <br />
          <em>Our intelligence.</em>
        </h1>

        <div className="wl-hero-rule" />

        <div className="wl-hero-bottom">
          <p className="wl-hero-insight">
            Every industrial operation has a problem that <strong>no sensor was ever built for.</strong> We
            solve those problems with cameras already on your site and intelligence built specifically around
            what you need.
          </p>

          <div>
            <div className="wl-pill">
              <span className="wl-pill-dot" />
              Custom Vision · &lt;2s Latency
            </div>
            <p className="wl-hero-copy">
              WonderLens AI does not sell a generic platform. We solve operational problems that off-the-shelf
              systems never addressed. Tell us yours.
            </p>
            <div className="wl-hero-actions">
              <a href="#cta" className="wl-btn-dark">
                Tell Us Your Problem
              </a>
              <a href="#problems" className="wl-btn-outline">
                See What We&apos;ve Solved
              </a>
            </div>
            <div className="wl-tag-row">
              <span className="wl-tag">Scrap &amp; Theft Detection</span>
              <span className="wl-tag">Sensor Replacement</span>
              <span className="wl-tag">Process Monitoring</span>
              <span className="wl-tag">Custom Alerts</span>
              <span className="wl-tag">Real-Time Reports</span>
            </div>
          </div>
        </div>
      </section>

      <section className="wl-band">
        <div className="wl-band-grid">
          <h2 className="wl-band-title">
            The camera is already there.
            <br />
            <em>We make it solve anything.</em>
          </h2>
          <div>
            <p className="wl-band-copy">
              Industrial sites spend thousands on <strong>dedicated sensors, manual audits, and reactive investigations</strong>
              {' '}for problems that a camera, pointed at the right place, with the right intelligence, could solve in
              real time.
            </p>
            <p className="wl-band-copy">
              The opportunity is not a better generic platform. It is <strong>a team that takes your specific problem
              and builds vision intelligence around it.</strong>
            </p>
            <div className="wl-stats">
              <div>
                <div className="wl-stat-num">&lt;2s</div>
                <div className="wl-stat-label">Alert latency</div>
              </div>
              <div>
                <div className="wl-stat-num">Any cam</div>
                <div className="wl-stat-label">Works with existing CCTV</div>
              </div>
              <div>
                <div className="wl-stat-num">Custom</div>
                <div className="wl-stat-label">Built for your use case</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wl-section" id="problems">
        <div className="wl-eyebrow">
          <span>01</span>
          <div />
          <span className="accent">Solved Problems</span>
        </div>

        <div className="wl-split-intro">
          <h2 className="wl-section-title">
            Real problems.
            <br />
            <em>Real sites.</em>
          </h2>
          <p className="wl-section-copy">
            These are not demos. These are operational problems that existing vision platforms could not address,
            solved with the cameras already in place and custom-built intelligence.
          </p>
        </div>

        <div className="wl-case-grid">
          {solvedCases.map((item) => (
            <article key={item.id} className="wl-case-card">
              <div className="wl-case-id">{item.id}</div>
              <div className="wl-case-label">The Problem</div>
              <h3 className="wl-case-problem">{item.problem}</h3>
              <div className="wl-case-stack">
                <div>
                  <div className="wl-case-step">// Situation</div>
                  <p>{item.situation}</p>
                </div>
                <div>
                  <div className="wl-case-step">// What We Did</div>
                  <p>{item.action}</p>
                </div>
              </div>
              <div className="wl-case-outcome">
                <div className="wl-case-step">// Outcome</div>
                <p>{item.outcome}</p>
              </div>
              <div className="wl-case-sector">{item.sector}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="wl-section wl-section-alt" id="pitch">
        <div className="wl-eyebrow">
          <span>02</span>
          <div />
          <span className="accent">Our Approach</span>
        </div>

        <div className="wl-split-intro wl-pitch-grid">
          <div>
            <h2 className="wl-section-title">
              Off-the-shelf platforms
              <br />
              solve <em>off-the-shelf</em>
              <br />
              problems.
            </h2>
            <p className="wl-pull-quote">
              “The most valuable operational problems are the ones nobody built a solution for yet.”
            </p>
          </div>
          <div>
            <p className="wl-body-copy">
              The industrial vision market has matured around common use cases like PPE detection, perimeter
              monitoring, and headcount. If that is all you need, several capable platforms exist.
            </p>
            <p className="wl-body-copy">
              WonderLens AI is for the other kind of problem: the one specific to your operation, your floor
              layout, your material flow, and your process.
            </p>
            <p className="wl-body-copy">
              A camera is one of the most flexible sensors ever made. Pointed at the right place, with the right
              intelligence behind it, it can replace expensive hardware, catch problems humans miss, and generate
              information that changes how you run your site.
            </p>

            <div className="wl-compare">
              <div className="wl-compare-row">
                <div className="wl-compare-head">Generic platforms</div>
                <div className="wl-compare-head">WonderLens AI</div>
              </div>
              <div className="wl-compare-row">
                <div><span className="wl-chip muted">Fixed</span>Pre-built use cases only</div>
                <div className="strong"><span className="wl-chip accent">Custom</span>Built around your problem</div>
              </div>
              <div className="wl-compare-row">
                <div><span className="wl-chip muted">Generic</span>Same model for every customer</div>
                <div className="strong"><span className="wl-chip accent">Specific</span>Trained on your site and conditions</div>
              </div>
              <div className="wl-compare-row">
                <div><span className="wl-chip muted">Reactive</span>You adapt to their feature set</div>
                <div className="strong"><span className="wl-chip accent">Proactive</span>We adapt to your operational reality</div>
              </div>
              <div className="wl-compare-row">
                <div><span className="wl-chip muted">Platform</span>Annual subscription, take it or leave it</div>
                <div className="strong"><span className="wl-chip accent">Engagement</span>Scoped per problem, start with one</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wl-band wl-band-secondary">
        <div className="wl-band-grid wl-sensor-grid">
          <div>
            <h2 className="wl-band-title">
              Industries full of problems
              <br />
              <em>cameras haven&apos;t solved yet.</em>
            </h2>
            <p className="wl-band-copy">
              Every facility has cameras. Very few have made them intelligent. The gap between what a camera
              <strong> records </strong>and what it can <strong>actively detect, alert, and report on</strong> is where
              we operate.
            </p>
          </div>
          <div className="wl-use-grid">
            {useCases.map(([title, body]) => (
              <div key={title} className="wl-use-card">
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wl-section" id="engage">
        <div className="wl-eyebrow">
          <span>03</span>
          <div />
          <span className="accent">How We Work</span>
        </div>

        <h2 className="wl-section-title">
          From problem
          <br />
          <em>to live in days.</em>
        </h2>

        <div className="wl-process-grid">
          <article className="wl-process-card">
            <div className="wl-process-num">1</div>
            <h3>Describe Your Problem</h3>
            <p>
              Tell us what is happening on your site that you cannot currently detect, measure, or act on fast
              enough. We do not need a spec. We need the operational reality.
            </p>
            <span>No RFP required</span>
          </article>
          <article className="wl-process-card">
            <div className="wl-process-num">2</div>
            <h3>We Design the Solution</h3>
            <p>
              We assess your existing camera infrastructure, design a detection model for your specific problem,
              and tell you honestly what is achievable and how fast.
            </p>
            <span>Typically within 1 week</span>
          </article>
          <article className="wl-process-card">
            <div className="wl-process-num">3</div>
            <h3>See It Live on Your Site</h3>
            <p>
              We run the first demo on your actual footage: your floor, your problem, your cameras. You see it
              working before any commitment is made.
            </p>
            <span>Live demo, not slides</span>
          </article>
        </div>
      </section>

      <section className="wl-intel">
        <div className="wl-intel-bar">
          <div>// Live Intelligence - Demo Environment</div>
          <div className="wl-intel-status">
            <span><i />Custom Model Active</span>
            <span><i />6 Cameras</span>
            <span>Latency 1.3s</span>
          </div>
        </div>

        <div className="wl-intel-grid">
          <div className="wl-cam-panel wl-cam-main">
            <div className="wl-cam-header">
              <span>CAM-03 - SCRAP YARD - CUSTOM MODEL</span>
              <span className="rec"><i />REC</span>
            </div>
            <div className="wl-box critical">SCRAP MOVEMENT</div>
            <div className="wl-box ok">WORKER OK</div>
            <div className="wl-box warn">MACHINE IDLE</div>
            <div className="wl-scan" />
          </div>

          <div className="wl-cam-panel wl-cam-quad">
            <div className="mini">CAM-01 · MATERIAL STORE</div>
            <div className="mini">CAM-02 · ENTRY GATE</div>
            <div className="mini alert">CAM-05 · PROCESS LINE</div>
            <div className="mini">CAM-08 · ASSEMBLY</div>
          </div>

          <div className="wl-feed">
            <div className="wl-feed-head">
              <span>// Live Events</span>
              <strong>3</strong>
            </div>
            <div className="wl-feed-list">
              {liveEvents.map((event) => (
                <article key={`${event.level}-${event.title}`} className={`wl-event ${event.level.toLowerCase()}`}>
                  <div className="wl-event-title">
                    {event.level} · {event.title}
                  </div>
                  <p>{event.body}</p>
                  <div className="wl-event-foot">
                    <span>{event.source}</span>
                    <span>{event.time}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="wl-search-shell">"scrap yard, last Tuesday, after 6pm"</div>
          </div>
        </div>

        <div className="wl-intel-foot">
          <span>Model <b>Custom</b></span>
          <span>Latency <b>1.3s</b></span>
          <span>Events today <b>47</b></span>
          <span>Cameras <b>6/6</b></span>
        </div>
      </section>

      <section className="wl-cta" id="cta">
        <div className="wl-cta-shell">
          <div className="wl-cta-copy-block">
            <div className="wl-cta-label">// Start Here</div>
            <h2 className="wl-cta-title">
              What&apos;s the problem
              <br />
              your site <em>can&apos;t solve?</em>
            </h2>
            <p className="wl-cta-copy">
              Describe it. We&apos;ll tell you whether a camera can solve it, and show you what that looks like live on
              your own footage.
            </p>
          </div>

          <div className="wl-form-panel">
            <div className="wl-form">
              <label htmlFor="problem">Describe your operational challenge</label>
              <textarea
                id="problem"
                className="wl-textarea"
                placeholder="e.g. We're losing material from our scrap yard and can't track when or how. We have cameras but they're not doing anything useful..."
              />
              <div className="wl-form-actions">
                <a href="mailto:hello@wonderlens.ai" className="wl-btn-light">
                  Send Us Your Problem
                </a>
                <span>or</span>
                <a href="mailto:hello@wonderlens.ai" className="wl-btn-ghost">
                  Book a Call Instead
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="wl-cta-note">// No pitch deck. No generic sales flow. Just a conversation about your problem.</p>
      </section>

      <footer className="wl-footer">
        <div className="wl-brand wl-footer-brand">
          <img src="/images/wonderlens-logo.svg" alt="WonderLens AI logo" className="wl-brand-mark" />
          <span>WonderLens AI</span>
        </div>
        <div>Industrial Vision Intelligence · © 2026</div>
      </footer>
    </main>
  )
}
