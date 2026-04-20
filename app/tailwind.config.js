/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ── Typography ─────────────────────────────────────────── */
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'serif'],
      },
      fontSize: {
        // Fluid type scale — clamp(min, preferred, max)
        'fluid-xs':  'clamp(0.7rem,   0.65rem + 0.25vw,  0.8rem)',
        'fluid-sm':  'clamp(0.8rem,   0.75rem + 0.25vw,  0.875rem)',
        'fluid-base':'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',
        'fluid-lg':  'clamp(1.05rem,  0.95rem + 0.5vw,   1.25rem)',
        'fluid-xl':  'clamp(1.2rem,   1rem + 1vw,        1.5rem)',
        'fluid-2xl': 'clamp(1.5rem,   1.1rem + 2vw,      2.25rem)',
        'fluid-3xl': 'clamp(1.8rem,   1.2rem + 3vw,      3rem)',
        'fluid-4xl': 'clamp(2.25rem,  1.5rem + 4vw,      4rem)',
        'fluid-hero': 'clamp(3rem,    2rem + 5vw,         6rem)',
      },
      letterSpacing: {
        'display': '-0.035em',
        'heading': '-0.025em',
        'caps':     '0.12em',
      },

      /* ── Colour system ──────────────────────────────────────── */
      colors: {
        // Primary brand — Coral accent
        coral: {
          50:      '#FFF5F3',
          100:     '#FFE8E4',
          200:     '#FFD0C8',
          300:     '#FFB0A2',
          400:     '#FF8A76',
          DEFAULT: '#E8503A',
          600:     '#D04433',
          700:     '#B0372A',
          800:     '#8C2D22',
          900:     '#6B221A',
          950:     '#3D1210',
        },
        // Dark brand — Ink (derived from logo charcoal)
        ink: {
          50:  '#F4F6F7',
          100: '#E3E7EA',
          200: '#CAD0D6',
          300: '#A4AEB8',
          400: '#778593',
          500: '#5C6B78',
          600: '#4F5B66',
          700: '#444D56',
          800: '#3B434A',
          900: '#2A3038',
          950: '#1A1F25',
        },
        // Warm neutral scale
        gray: {
          50:  '#FAFAF8',
          100: '#F4F4F2',
          150: '#EEEEEC',
          200: '#E4E4E0',
          300: '#D1D1CC',
          400: '#A8A8A3',
          500: '#7C7C78',
          600: '#5C5C58',
          700: '#434340',
          800: '#2C2C2A',
          900: '#1A1A19',
          950: '#0F0F0E',
        },
        // Sand — warm background
        sand: {
          50:  '#FDFCFA',
          100: '#FAF8F5',
          200: '#F5F0EA',
          300: '#EDE5DB',
        },
        // Semantic
        positive: { DEFAULT: '#16A34A', light: '#DCFCE7', dark: '#14532D' },
        negative: { DEFAULT: '#DC2626', light: '#FEE2E2', dark: '#7F1D1D' },
        warning:  { DEFAULT: '#D97706', light: '#FEF3C7', dark: '#78350F' },
      },

      /* ── Elevation & depth ──────────────────────────────────── */
      boxShadow: {
        'xs':          '0 1px 2px rgba(0,0,0,0.04)',
        'sm':          '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card':        '0 0 0 1px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'card-hover':  '0 0 0 1px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08)',
        'float':       '0 12px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)',
        'lg':          '0 8px 24px rgba(0,0,0,0.08)',
        'xl':          '0 20px 60px rgba(0,0,0,0.12)',
        'glow-coral':  '0 0 20px rgba(232, 80, 58, 0.15)',
        'glow-ink':    '0 0 20px rgba(26, 31, 37, 0.2)',
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },

      /* ── Backdrop ───────────────────────────────────────────── */
      backdropBlur: {
        'xs': '2px',
        'xl': '20px',
        '2xl': '40px',
      },

      /* ── Motion tokens ──────────────────────────────────────── */
      transitionTimingFunction: {
        'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring':    'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        'draw-line': {
          '0%':   { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.4s ease-out both',
        'fade-in-up':     'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':       'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer':        'shimmer 2s linear infinite',
        'pulse-dot':      'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
