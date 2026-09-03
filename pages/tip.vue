<script setup lang="ts">
import { profile } from '~/data/profile'

useSeoMeta({
  title: `打赏一下 — ${profile.name}`,
  description: '请作者喝一杯咖啡。微信扫码打赏 JamieGao。',
  ogTitle: `打赏一下 — ${profile.name}`,
  ogDescription: '请作者喝一杯咖啡。微信扫码打赏 JamieGao。',
  ogType: 'website',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div class="tip-shell">
    <ClientOnly>
      <LazyAmbientField />
    </ClientOnly>
    <PillNav />

    <main class="tip-main">
      <div class="tip-glow" aria-hidden="true" />

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

      <figure class="tip-stage tip-reveal tip-reveal-4">
        <div class="tip-qr-wrap">
          <div class="tip-orbit" aria-hidden="true" />
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
        <figcaption class="tip-caption" data-read-safe>
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
