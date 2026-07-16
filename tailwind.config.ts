import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        void: '#060211',
        'sidebar-void': '#0A0618',
        panel: '#130924',
        'neon-pink': '#FF007F',
        'neon-cyan': '#00F0FF',
        'violet-glow': '#8B00FF',
        'button-gradient-start': '#2A0A3E',
        'button-gradient-end': '#3D0A2A',
        // Lightened from the original #7E6E9B — full-opacity dim only hit 4.48:1
        // on void and 4.20:1 on panel, both under WCAG AA's 4.5:1 body-text floor.
        dim: '#8B7DA5',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config
