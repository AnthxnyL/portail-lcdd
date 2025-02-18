export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  css: [
    '@fortawesome/fontawesome-svg-core/styles.css'
    ],

  plugins: [
    '~/plugins/axios.js'
  ],

  build: {
    transpile: [
    '@fortawesome/vue-fontawesome'
    ]
  },
  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:4000',
      SHOP_NAME: process.env.SHOP_NAME,
      SHOPIFY_BASE_URL: process.env.SHOPIFY_BASE_URL,
      SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
      SHOPIFY_PASSWORD: process.env.SHOPIFY_PASSWORD,
      API_VERSION: process.env.API_VERSION,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS
    },
    private: {
      JWT_SECRET: process.env.JWT_SECRET,
      DATABASE_URL: process.env.DATABASE_URL
    },
  },
  compatibilityDate: '2024-12-27'
})