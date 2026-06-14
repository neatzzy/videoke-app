// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { host: '0.0.0.0' },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      pusherKey: '',    // set via NUXT_PUBLIC_PUSHER_KEY
      pusherCluster: 'mt1', // set via NUXT_PUBLIC_PUSHER_CLUSTER
    },
  },
})
