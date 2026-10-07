/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alpine: {
          50: '#f0f7fc',
          100: '#e0eff9',
          200: '#b8ddf2',
          300: '#7cc3e8',
          400: '#3ba4dc',
          500: '#1587c6',
          600: '#0c6ca7',
          700: '#0c5687',
          800: '#0e4971',
          900: '#113e5f',
          950: '#0b273e',
        },
        eaws: {
          1: '#ccff66',
          2: '#ffff00',
          3: '#ff9900',
          4: '#ff0000',
          5: '#800000',
        }
      }
    },
  },
  plugins: [],
}

