<script setup lang="ts">
import { profile } from '~/data/profile'

const route = useRoute()

const links = computed(() => [
  { label: '关于', to: '/#about' },
  ...(profile.showExperience ? [{ label: '经历', to: '/#experience' }] : []),
  { label: '联系', to: '/#contact' },
  { label: '技术', to: '/#stack' }
])
</script>

<template>
  <header class="nav-wrap">
    <nav class="pill-nav" aria-label="主要导航" data-read-safe="block">
      <NuxtLink class="monogram" to="/" aria-label="返回首页">
        {{ profile.initials }}
      </NuxtLink>

      <div class="nav-links">
        <a
          v-for="link in links"
          :key="link.to"
          :href="link.to"
        >
          {{ link.label }}
        </a>
      </div>

      <NuxtLink
        class="nav-tip"
        to="/tip"
        :aria-current="route.path === '/tip' ? 'page' : undefined"
      >
        <span class="nav-tip-text">打赏一下</span>
        <AppIcon name="i-lucide-coffee" />
      </NuxtLink>
    </nav>
  </header>
</template>
