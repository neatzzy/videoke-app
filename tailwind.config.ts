import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        surface: '#121212',
        elevated: '#181818',
        highlight: '#1f1f1f',
        hover: '#252525',
        muted: '#4d4d4d',
        subdued: '#b3b3b3',
        outline: '#7c7c7c',
        accent: '#1ed760',
        'accent-hover': '#3be477',
        negative: '#f3727f',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'helvetica', 'arial', 'sans-serif'],
      },
      letterSpacing: {
        label: '1.4px',
      },
    },
  },
} satisfies Config
