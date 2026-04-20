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
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c0d2ff',
          300: '#93b0ff',
          400: '#6585ff',
          500: '#3d5eff',
          600: '#2641f5',
          700: '#1d30de',
          800: '#1d2db3',
          900: '#1e2d8c',
          950: '#131a57',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f7f8fc',
          card: '#ffffff',
          border: '#eaecf4',
        },
        ink: {
          DEFAULT: '#0e0f1a',
          secondary: '#4b5168',
          tertiary: '#8a91a8',
        },
        accent: {
          green: '#00c98c',
          amber: '#f5a623',
          red: '#f24f4f',
          blue: '#3d5eff',
          purple: '#8b5cf6',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 4px 16px 0 rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 24px 0 rgb(0 0 0 / 0.1)',
        glow: '0 0 0 3px rgb(61 94 255 / 0.15)',
      },
    },
  },
  plugins: [],
}
