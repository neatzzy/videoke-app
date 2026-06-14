import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        void: '#060211',
        panel: '#130924',
        'neon-pink': '#FF007F',
        'neon-cyan': '#00F0FF',
        dim: '#7E6E9B',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config
