import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1180px' } },
    extend: {
      colors: {
        brand: {
          50: '#effaff',
          100: '#def3ff',
          200: '#b6e9ff',
          300: '#75d9ff',
          400: '#2cc5ff',
          500: '#00aef0',
          600: '#008bcd',
          700: '#006ea6',
          800: '#035d89',
          900: '#094d71',
        },
        accent: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        ink: { DEFAULT: '#0f172a', soft: '#334155', mute: '#64748b' },
        paper: '#f7f7f4',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(15, 23, 42, 0.25)',
        glow: '0 0 0 4px rgba(0, 174, 240, 0.15)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'marquee-rev': { from: { transform: 'translateX(-50%)' }, to: { transform: 'translateX(0)' } },
        'ken-burns': {
          '0%': { transform: 'scale(1.05) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.18) translate3d(-1.5%, -1%, 0)' },
        },
        'scroll-dot': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '80%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '0' },
        },
        ping2: { '75%, 100%': { transform: 'scale(1.8)', opacity: '0' } },
        walk: { from: { left: '-40px' }, to: { left: '100%' } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-2px)' } },
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 40s) linear infinite',
        'marquee-rev': 'marquee-rev var(--marquee-duration, 40s) linear infinite',
        'ken-burns': 'ken-burns 22s ease-in-out infinite alternate',
        'scroll-dot': 'scroll-dot 1.6s ease-in-out infinite',
        ping2: 'ping2 1.8s cubic-bezier(0,0,0.2,1) infinite',
        walk: 'walk 28s linear infinite',
        bob: 'bob 0.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
