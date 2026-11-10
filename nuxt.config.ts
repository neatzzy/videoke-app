// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { host: '0.0.0.0' },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  // Inter self-hosted pelo @nuxt/fonts (sem <link> bloqueante); 'Inter' casa com tailwind.config.ts e main.css.
  fonts: {
    families: [{ name: 'Inter', weights: [400, 600, 700, 800], display: 'swap' }],
  },
  // Telão e sala são 100% client-side (dependem de Pusher/localStorage); /join segue com SSR.
  routeRules: {
    '/host': { ssr: false },
    '/room/**': { ssr: false },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        // viewport-fit=cover libera env(safe-area-inset-*) no app instalado (room/[code].vue).
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#000000' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },
  // Privado (só servidor). Os defaults leem o .env no build; NUXT_<CHAVE> sobrescreve em runtime.
  runtimeConfig: {
    youtubeApiKey: process.env.API_KEY || '',               // NUXT_YOUTUBE_API_KEY
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL || '',     // NUXT_UPSTASH_REDIS_REST_URL
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN || '', // NUXT_UPSTASH_REDIS_REST_TOKEN
    pusherAppId: process.env.PUSHER_APP_ID || '',           // NUXT_PUSHER_APP_ID
    pusherKey: process.env.PUSHER_KEY || '',                // NUXT_PUSHER_KEY
    pusherSecret: process.env.PUSHER_SECRET || '',          // NUXT_PUSHER_SECRET
    pusherCluster: process.env.PUSHER_CLUSTER || 'mt1',     // NUXT_PUSHER_CLUSTER
    public: {
      pusherKey: '',    // set via NUXT_PUBLIC_PUSHER_KEY
      pusherCluster: 'mt1', // set via NUXT_PUBLIC_PUSHER_CLUSTER
      siteUrl: '',      // set via NUXT_PUBLIC_SITE_URL — guest-reachable base URL for the host's QR code; falls back to the page origin
    },
  },
})
