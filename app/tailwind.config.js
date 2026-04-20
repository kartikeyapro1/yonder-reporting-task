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
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // ─── Yonder brand palette (from yonder.com) ──────────────────────
        navy: {
          950: '#050507',
          900: '#0A0A0F',
          800: '#111118',
          700: '#1A1A24',
          600: '#262636',
          500: '#36364D',
          400: '#52526E',
          300: '#7E7E99',
          200: '#ABABBE',
          100: '#D5D5E0',
          50:  '#EDEDF2',
        },
        coral: {
          DEFAULT: '#F04E37',
          light:   '#FF6B52',
          dark:    '#D43A25',
          muted:   '#FDE8E5',
          subtle:  '#FFF5F3',
        },
        sand: {
          DEFAULT: '#FAF8F5',
          dark:    '#F0EDE8',
          border:  '#E5E0D8',
        },
        // ─── Semantic surface tokens ──────────────────────────────────────
        surface: {
          DEFAULT:   '#ffffff',
          muted:     '#FAFAFA',
          warm:      '#FAF8F5',
          card:      '#ffffff',
          border:    '#EAEAEF',
          hover:     '#F5F5F8',
          dark:      '#111118',
          darkCard:  '#1A1A24',
          darkBorder:'#262636',
          darkHover: '#1F1F2C',
          glass:     'rgba(255,255,255,0.72)',
          darkGlass: 'rgba(10,10,15,0.85)',
        },
        // ─── Text tokens ─────────────────────────────────────────────────
        ink: {
          DEFAULT:   '#0A0A0F',
          secondary: '#52526E',
          tertiary:  '#9292A8',
          inverse:   '#FAFAFA',
          warm:      '#3D3427',
          muted:     '#B0B0C0',
        },
        // ─── Semantic accents ────────────────────────────────────────────
        accent: {
          green:   '#10B981',
          emerald: '#059669',
          amber:   '#F59E0B',
          red:     '#EF4444',
          blue:    '#3B82F6',
          purple:  '#8B5CF6',
          coral:   '#F04E37',
          teal:    '#14B8A6',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'card':        '0 0 0 1px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.05)',
        'card-hover':  '0 0 0 1px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.08)',
        'card-sm':     '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.04)',
        'card-lg':     '0 0 0 1px rgba(0,0,0,0.03), 0 8px 32px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.08)',
        'glow':        '0 0 0 3px rgba(240,78,55,0.15)',
        'glow-coral':  '0 0 24px rgba(240,78,55,0.2)',
        'glow-navy':   '0 0 0 3px rgba(10,10,15,0.1)',
        'deep':        '0 16px 64px -16px rgba(10,10,15,0.3)',
        'float':       '0 20px 60px -15px rgba(0,0,0,0.12)',
        'inner-light': 'inset 0 1px 0 0 rgba(255,255,255,0.1)',
        'inner-glow':  'inset 0 0 24px rgba(240,78,55,0.05)',
      },
      backgroundImage: {
        'coral-gradient':   'linear-gradient(135deg, #F04E37 0%, #FF6B52 100%)',
        'coral-gradient-r': 'linear-gradient(135deg, #FF6B52 0%, #F04E37 100%)',
        'navy-gradient':    'linear-gradient(135deg, #050507 0%, #1A1A24 100%)',
        'navy-radial':      'radial-gradient(ellipse at top, #1A1A24 0%, #050507 70%)',
        'card-gradient':    'linear-gradient(160deg, #ffffff 0%, #FAFAFA 100%)',
        'glass-gradient':   'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
        'shimmer':          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
        'hero-mesh':        'radial-gradient(at 20% 30%, rgba(240,78,55,0.08) 0%, transparent 50%), radial-gradient(at 80% 70%, rgba(59,130,246,0.05) 0%, transparent 50%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-scale': {
          '0%':   { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'count-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
        'shimmer': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up':        'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':        'fade-in 0.5s ease-out both',
        'fade-in-scale':  'fade-in-scale 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-left':  'slide-in-left 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'count-up':       'count-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-soft':     'pulse-soft 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s infinite',
      },
      transitionTimingFunction: {
        'spring':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth':  'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
