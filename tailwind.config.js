/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF1F9',
          100: '#C5CDE8',
          200: '#9CAAD7',
          300: '#7387C6',
          400: '#4A63B5',
          500: '#2140A4',
          600: '#1B2E5E',
          700: '#152444',
          800: '#0F1A2E',
          900: '#090F1A',
        },
        gold: {
          50: '#FEF9EC',
          100: '#FCEDC5',
          200: '#FAE09E',
          300: '#F8D477',
          400: '#F5C750',
          500: '#F0A500',
          600: '#C88B00',
          700: '#A07100',
          800: '#785600',
          900: '#503B00',
        },
        cream: '#F8F7F2',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Source Sans 3"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
