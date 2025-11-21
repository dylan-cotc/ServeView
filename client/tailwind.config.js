/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#03989e',
          50: '#e6f7f9',
          100: '#cceff2',
          200: '#99dfe6',
          300: '#66cfd9',
          400: '#33bfcd',
          500: '#03989e',
          600: '#028086',
          700: '#02686d',
          800: '#015054',
          900: '#01383b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
