/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0F14',
          900: '#111820',
          800: '#1A232D',
          700: '#26313C',
        },
        paper: {
          100: '#EDE6D6',
          200: '#D8CFB9',
        },
        brass: {
          400: '#DDBB4E',
          500: '#C9A227',
          600: '#A6841D',
        },
        sage: {
          400: '#6BBE85',
          500: '#4F9D69',
          600: '#3B7A50',
        },
        rust: {
          400: '#D97A70',
          500: '#C1554B',
          600: '#9C3E36',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
