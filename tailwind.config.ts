import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        surface: '#16120f',
        elevated: '#1e1915',
        highlight: '#27211c',
        hover: '#312a24',
        muted: '#574d44',
        subdued: '#c2b8ad',
        outline: '#8a7f74',
        accent: '#ffb020',
        'accent-hover': '#ffc24d',
        negative: '#f3727f',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'helvetica', 'arial', 'sans-serif'],
      },
      boxShadow: {
        // Única sombra projetada do sistema: capas, player e toast.
        cover: 'rgba(0, 0, 0, 0.5) 0 8px 24px',
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
