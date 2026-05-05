/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0e1017',
          800: '#161b25',
          700: '#1c2333',
          600: '#252d3d',
          500: '#1e2535',
        },
        accent: {
          blue: '#3b82f6',
          'blue-dark': '#1d4ed8',
          green: '#34d399',
          amber: '#fbbf24',
          red: '#f87171',
          purple: '#a78bfa',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};