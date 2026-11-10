// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { host: '0.0.0.0' },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  // Telão e sala são 100% client-side (dependem de Pusher/localStorage); /join segue com SSR.
  routeRules: {
    '/host': { ssr: false },
    '/room/**': { ssr: false },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap' },
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
