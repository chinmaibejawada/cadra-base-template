/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        prairie: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#fdf8f0',
          100: '#f5e6ca',
          200: '#e8cc9a',
          300: '#d4a64a',
          400: '#c4912a',
          500: '#8b6914',
          600: '#6b5010',
          700: '#4f3b0c',
          800: '#3a2b08',
          900: '#261c06',
        },
      },
    },
  },
  plugins: [],
};