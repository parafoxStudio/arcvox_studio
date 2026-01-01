/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'arcvox': {
          'dark': '#0D0F33',
          'cyan': '#00FFFF',
          'violet': '#8A2BE2',
          'amber': '#F59E0B'
        }
      },
      fontFamily: {
        'crimson': ['"Crimson Pro"', 'serif'],
        'inter': ['Inter', 'sans-serif']
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '500px' }
        }
      }
    },
  },
  plugins: [],
}
