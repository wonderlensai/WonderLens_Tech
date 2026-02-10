import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // ── Pupil & Iris darks ──
          dark: '#060608',          // pupil center
          primary: '#0C1018',       // deep iris
          secondary: '#141A26',     // mid iris
          line: 'rgba(59,140,196,0.12)',

          // ── Iris accent — vivid, clearly visible ──
          iris: '#3B8CC4',          // primary iris blue
          irisLight: '#5AAAD8',     // lighter iris ring
          irisDim: '#2A6A96',       // darker iris ring

          // ── Limbal ring — warm amber ──
          amber: '#D4A54A',         // golden limbal ring
          amberDim: '#A88030',      // darker amber

          // ── Clinical ──
          success: '#3D9B6B',       // lab green (pass)
          danger: '#C45B5B',        // lab red (fail)

          // ── Sclera & cornea ──
          text: '#F0EDE6',          // sclera white
          muted: '#7E8694',         // corneal grey
          faint: '#4A5060',         // faint label

          // keep backwards compat
          accent: '#3B8CC4',
          accentHover: '#5AAAD8',
          glint: '#D4A54A',
          limbic: '#D4A54A',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [],
}
export default config
