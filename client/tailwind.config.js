/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vastra: {
          bg: '#FDFBF7',
          surface: '#F8F5EE',
          card: '#FFFFFF',
          border: '#EAE4D9',
          charcoal: '#22201E',
          muted: '#6B665F',
          light: '#9E988F',
          terracotta: {
            DEFAULT: '#8C4A2F',
            hover: '#733B24',
            light: '#F5ECE6',
          },
          olive: {
            DEFAULT: '#4A5D4E',
            hover: '#3A4B3E',
            light: '#EAF0EB',
          },
          sand: {
            DEFAULT: '#C5A880',
            hover: '#B59569',
            light: '#F8F4EE',
          },
          indigo: {
            DEFAULT: '#1E3A5F',
            hover: '#162B47',
            light: '#E9EEF5',
          }
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 30px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
