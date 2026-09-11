export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'theme-color', content: '#0a0a0c' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'darkreader-lock', content: '' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'author', content: '高健JamieGao' },
        { name: 'keywords', content: '全栈开发工程师,金融科技,Java,Vue,Spring Boot,系统架构' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: 'anonymous' }
      ]
    }
  },
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true
  },
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    inlineSSRStyles: false
  }
})
