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
      boxShadow: {
        // Única sombra projetada do sistema: capas, player e toast.
        cover: 'rgba(0, 0, 0, 0.5) 0 8px 24px',
      },
      letterSpacing: {
        label: '1.4px',
      },
      spacing: {
        page: '1.25rem',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        base: 'var(--motion-base)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
    },
  },
} satisfies Config
