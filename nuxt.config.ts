export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'theme-color', content: '#0a0a0c' },
        { name: 'color-scheme', content: 'dark' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }
      ]
    }
  },
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true
  },
  experimental: {
    payloadExtraction: true
  }
})
