<script setup lang="ts">
import { profile } from '~/data/profile'

const title = `打赏一下 — ${profile.name}`
const description = '请作者喝一杯咖啡。微信扫码打赏 JamieGao。'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

// LCP: start QR fetch in parallel with HTML/CSS parse.
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: '/tip/wechat-reward.webp',
      type: 'image/webp'
    }
  ]
})
</script>

<template>
  <div class="tip-shell">
    <div class="tip-atmosphere" aria-hidden="true">
      <div class="tip-atmosphere-base" />
      <div class="tip-atmosphere-grain" />
    </div>

    <PillNav />

    <main class="tip-main">
      <p class="tip-eyebrow tip-reveal tip-reveal-1" data-read-safe>
        <span class="tip-eyebrow-mark" aria-hidden="true" />
        一杯咖啡的距离
      </p>

      <h1 class="tip-title tip-reveal tip-reveal-2" data-read-safe>
        请作者喝一杯咖啡
      </h1>

      <p class="tip-lead tip-reveal tip-reveal-3" data-read-safe>
        喜欢我的作品，一杯咖啡的支持，就是我继续独立开发的动力。
      </p>

      <!-- No tip-reveal opacity fade — QR is LCP; show immediately -->
      <figure class="tip-stage">
        <div class="tip-qr-wrap">
          <div class="tip-cup-stage" aria-hidden="true">
            <svg class="tip-cup" viewBox="0 0 520 380" preserveAspectRatio="xMidYMid meet">
              <ellipse class="tip-cup-saucer" cx="260" cy="360" rx="222" ry="14" />
              <ellipse class="tip-cup-saucer-inner" cx="260" cy="354" rx="190" ry="9" />
              <path
                class="tip-cup-body"
                d="M50 48h420l-14 248c-3 20-22 36-48 36H112c-26 0-45-16-48-36L50 48z"
              />
              <path
                class="tip-cup-rim"
                d="M40 48c0-9 98-17 220-17s220 8 220 17"
              />
              <path
                class="tip-cup-rim-line"
                d="M62 58h396"
              />
              <path
                class="tip-cup-handle"
                d="M470 78c52 12 66 42 50 78-12 26-42 40-76 36"
              />
            </svg>
            <svg class="tip-cup-steam" viewBox="0 0 240 55" preserveAspectRatio="xMidYMax meet">
              <path class="tip-steam tip-steam-d" d="M38 48C22 38 48 34 30 24C12 14 36 8 24 2" />
              <path class="tip-steam tip-steam-a" d="M78 50C64 40 94 36 76 26C58 16 84 10 70 2" />
              <path class="tip-steam tip-steam-b" d="M120 52C140 42 100 38 124 26C148 14 108 8 122 2" />
              <path class="tip-steam tip-steam-c" d="M162 48C182 38 150 34 170 24C190 14 158 8 168 2" />
              <path class="tip-steam tip-steam-e" d="M202 46C218 36 192 32 210 22C228 12 204 6 216 2" />
            </svg>
          </div>
          <div class="tip-frame" data-read-safe="block">
            <img
              class="tip-qr"
              src="/tip/wechat-reward.webp"
              alt="JamieGao 的微信赞赏码，请用微信扫一扫"
              width="720"
              height="720"
              decoding="async"
              fetchpriority="high"
            >
          </div>
        </div>
        <figcaption class="tip-caption tip-reveal tip-reveal-4" data-read-safe>
          <span class="tip-caption-label">微信扫一扫</span>
          <span class="tip-caption-name">JamieGao 的赞赏码</span>
        </figcaption>
      </figure>

      <div class="tip-actions tip-reveal tip-reveal-5" data-read-safe="block">
        <NuxtLink class="tip-back" to="/">
          <AppIcon name="i-lucide-arrow-left" />
          <span>返回主页</span>
        </NuxtLink>
        <a class="tip-mail" :href="`mailto:${profile.email}`">
          <span>{{ profile.email }}</span>
          <AppIcon name="i-lucide-arrow-up-right" />
        </a>
      </div>
    </main>
  </div>
</template>
