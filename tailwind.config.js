/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f0',
          100: '#ffe0dd',
          200: '#ffc5bf',
          300: '#ff9d92',
          400: '#ff6a5a',
          500: '#f23c2a',
          600: '#d61f10',
          700: '#b2170d',
          800: '#8f160f',
          900: '#761814',
          950: '#410806',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc171',
          400: '#ff9d39',
          500: '#fe8112',
          600: '#ef6906',
          700: '#c64d06',
          800: '#9d3d0d',
          900: '#7e3410',
          950: '#451705',
        },
        cream: {
          50: '#fdfbf7',
          100: '#faf5ec',
          200: '#f4ead5',
          300: '#ecdab8',
          400: '#e2c494',
          500: '#d9ad75',
          600: '#cf985d',
          700: '#b67d4b',
          800: '#966542',
          900: '#7b543b',
          950: '#422c1e',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
