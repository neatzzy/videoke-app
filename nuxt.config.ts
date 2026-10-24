// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { host: '0.0.0.0' },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      pusherKey: '',    // set via NUXT_PUBLIC_PUSHER_KEY
      pusherCluster: 'mt1', // set via NUXT_PUBLIC_PUSHER_CLUSTER
      siteUrl: '',      // set via NUXT_PUBLIC_SITE_URL — guest-reachable base URL for the host's QR code; falls back to the page origin
    },
  },
})
