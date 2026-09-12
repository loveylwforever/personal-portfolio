export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',

  // Keep Nuxt 3-style root layout; Nuxt 4 defaults to app/.
  srcDir: '.',
  dir: {
    app: 'app'
  },

  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'theme-color', content: '#0a0a0c' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'darkreader-lock', content: '' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }
      ]
    }
  },

  // Portfolio pages are static content — prerender at build for CDN/edge HTML.
  routeRules: {
    '/': { prerender: true },
    '/tip': { prerender: true },
    '/stack/**': {
      headers: { 'cache-control': 'public, max-age=31536000, immutable' }
    },
    '/tip/**': {
      headers: { 'cache-control': 'public, max-age=31536000, immutable' }
    },
    '/favicon.svg': {
      headers: { 'cache-control': 'public, max-age=86400' }
    }
  },

  nitro: {
    preset: 'vercel',
    compressPublicAssets: true,
    prerender: {
      crawlLinks: true,
      routes: ['/', '/tip']
    }
  },

  experimental: {
    // Inline payload on first paint; extract for client navigations (Nuxt 5-leaning default).
    payloadExtraction: 'client'
  },

  vite: {
    build: {
      // Modern browsers only — skip legacy modulepreload polyfill.
      modulePreload: { polyfill: false }
    }
  }
})
