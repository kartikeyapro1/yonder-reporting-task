/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ─── Yonder brand palette ────────────────────────────────────────
        // Deep navy for internal/admin surfaces
        navy: {
          950: '#080A12',
          900: '#0B0F1E',
          800: '#111827',
          700: '#1A2235',
          600: '#243049',
          500: '#2E3E5F',
          400: '#4A5A7A',
          300: '#6B7A9A',
          200: '#9DAABF',
          100: '#D1D8E8',
          50:  '#EEF1F8',
        },
        // Coral — Yonder's primary accent
        coral: {
          DEFAULT: '#F04E37',
          light:   '#F97055',
          dark:    '#D43A25',
          muted:   '#FDE8E5',
          subtle:  '#FFF2F0',
        },
        // Warm neutral — partner-facing backgrounds
        sand: {
          DEFAULT: '#F7F4EF',
          dark:    '#EDE9E2',
          border:  '#DDD8CF',
        },
        // ─── Semantic surface tokens ──────────────────────────────────────
        surface: {
          DEFAULT:   '#ffffff',
          muted:     '#F8F9FC',
          warm:      '#F7F4EF',   // partner-facing warm bg
          card:      '#ffffff',
          border:    '#E6E9F4',
          dark:      '#111827',   // internal dark surfaces
          darkCard:  '#1A2235',
          darkBorder:'#2E3E5F',
        },
        // ─── Text tokens ─────────────────────────────────────────────────
        ink: {
          DEFAULT:   '#0B0F1E',
          secondary: '#4A5168',
          tertiary:  '#8A91A8',
          inverse:   '#F8F9FC',
          warm:      '#3D2E1E',   // warm dark for sand backgrounds
        },
        // ─── Semantic accents ────────────────────────────────────────────
        accent: {
          green:   '#00C98C',
          amber:   '#F5A623',
          red:     '#F24F4F',
          blue:    '#3D5EFF',
          purple:  '#8B5CF6',
          coral:   '#F04E37',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card:        '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 4px 16px 0 rgb(0 0 0 / 0.06)',
        'card-hover':'0 4px 24px 0 rgb(0 0 0 / 0.1)',
        'card-sm':   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        glow:        '0 0 0 3px rgb(240 78 55 / 0.18)',
        'glow-navy': '0 0 0 3px rgb(11 15 30 / 0.15)',
        deep:        '0 8px 40px -8px rgb(11 15 30 / 0.25)',
      },
      backgroundImage: {
        'coral-gradient': 'linear-gradient(135deg, #F04E37, #F97055)',
        'navy-gradient':  'linear-gradient(135deg, #080A12, #1A2235)',
        'card-gradient':  'linear-gradient(160deg, #ffffff, #F8F9FC)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
