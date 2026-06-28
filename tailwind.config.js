/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        grape: '#7c3aed',
        bubble: '#ec4899',
        tangerine: '#f97316',
        sunny: '#facc15',
        mint: '#10b981',
        sky: '#0ea5e9',
      },
      boxShadow: {
        pop: '0 10px 30px -10px rgba(124, 58, 237, 0.45)',
        card: '0 8px 24px -8px rgba(15, 23, 42, 0.25)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.25s ease-out',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
