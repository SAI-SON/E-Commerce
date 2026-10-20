/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Heritage Jewel" Design System Tokens
        jewel: {
          bg: '#FFF9F0', // warm cream
          surface: '#FFFFFF', // pure white card surface
          primary: {
            DEFAULT: '#1E2A5E', // deep indigo
            hover: '#2B3A85',
            light: '#EEF1FA',
            dark: '#141C3E',
          },
          accent: {
            DEFAULT: '#F2A33A', // saffron
            hover: '#E08E1F',
            light: '#FEF6EC',
            dark: '#C87612',
          },
          rose: {
            DEFAULT: '#B83A4B', // rose madder
            hover: '#9E2E3E',
            light: '#FBF0F2',
          },
          emerald: {
            DEFAULT: '#2E8B6E', // emerald success
            hover: '#247058',
            light: '#EDF7F4',
          },
          ink: {
            DEFAULT: '#15131F', // deep ink text
            light: '#28243A',
          },
          muted: '#6B6880',
          border: '#EDE6DA',
          gold: '#D4AF37',
        },
        // Legacy alias mapped to Heritage Jewel palette to preserve compatibility
        vastra: {
          bg: '#FFF9F0',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#EDE6DA',
          charcoal: '#15131F',
          muted: '#6B6880',
          light: '#9E9AB0',
          terracotta: {
            DEFAULT: '#F2A33A', // saffron
            hover: '#E08E1F',
            light: '#FEF6EC',
          },
          olive: {
            DEFAULT: '#2E8B6E', // emerald
            hover: '#247058',
            light: '#EDF7F4',
          },
          sand: {
            DEFAULT: '#F2A33A',
            hover: '#E08E1F',
            light: '#FEF6EC',
          },
          indigo: {
            DEFAULT: '#1E2A5E', // deep indigo
            hover: '#2B3A85',
            light: '#EEF1FA',
          },
          rose: {
            DEFAULT: '#B83A4B',
            hover: '#9E2E3E',
            light: '#FBF0F2',
          },
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'jewel-sm': '0 2px 8px -1px rgba(30, 42, 94, 0.05)',
        'jewel': '0 8px 24px -4px rgba(30, 42, 94, 0.08), 0 2px 6px -1px rgba(30, 42, 94, 0.04)',
        'jewel-lg': '0 16px 40px -6px rgba(30, 42, 94, 0.12), 0 4px 12px -2px rgba(30, 42, 94, 0.06)',
        'jewel-hover': '0 22px 48px -8px rgba(30, 42, 94, 0.18)',
        'saffron-glow': '0 0 24px -2px rgba(242, 163, 58, 0.4)',
        'indigo-glow': '0 0 28px -4px rgba(30, 42, 94, 0.35)',
        'rose-glow': '0 0 20px -2px rgba(184, 58, 75, 0.35)',
        'subtle': '0 2px 10px rgba(30, 42, 94, 0.04)',
        'elevated': '0 12px 32px rgba(30, 42, 94, 0.08)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1E2A5E 0%, #3A1F5C 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        'gold-sheen': 'linear-gradient(120deg, #F2A33A 0%, #FBE3B5 50%, #E08E1F 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}
