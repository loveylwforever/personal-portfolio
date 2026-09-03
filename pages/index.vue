<script setup lang="ts">
import { profile } from '~/data/profile'

useSeoMeta({
  title: `${profile.name} — ${profile.role}`,
  description: profile.intro,
  ogTitle: `${profile.name} — ${profile.role}`,
  ogDescription: profile.intro,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

const currentYear = new Date().getFullYear()
const openExperience = ref<number | null>(null)

const primaryAction = computed(() =>
  profile.showExperience
    ? { href: '#experience', label: '工作经历' }
    : { href: '#contact', label: '联系合作' }
)

const toggleExperience = (index: number) => {
  openExperience.value = openExperience.value === index ? null : index
  nextTick(() => window.dispatchEvent(new Event('scroll')))
}
</script>

<template>
  <div id="top" class="site-shell">
    <ClientOnly>
      <LazyAmbientField />
    </ClientOnly>
    <PillNav :initials="profile.initials" />

    <main>
      <section class="hero section-shell" aria-labelledby="hero-title">
        <div class="hero-glow" aria-hidden="true" />

        <div class="hero-copy" data-read-safe>
          <div class="status-pill reveal reveal-1" data-read-safe="block">
            <span class="status-pulse" aria-hidden="true">
              <span class="status-pulse-ring" />
              <span class="status-pulse-core" />
            </span>
            <span>{{ profile.status }}</span>
          </div>

          <h1 id="hero-title" class="reveal reveal-2">
            {{ profile.name }}
          </h1>

          <p class="hero-role reveal reveal-2">{{ profile.role }}</p>
          <p class="hero-intro reveal reveal-3">{{ profile.intro }}</p>

          <div class="hero-socials reveal reveal-3" data-read-safe="block">
            <a
              v-for="item in profile.social"
              :key="item.label"
              :href="item.url"
              :aria-label="item.label"
              target="_blank"
              rel="noreferrer"
            >
              <AppIcon :name="item.icon" />
            </a>
          </div>

          <div class="hero-actions reveal reveal-4" data-read-safe="block">
            <a class="primary-action" :href="primaryAction.href">
              <span class="primary-action-spin" aria-hidden="true" />
              <span class="primary-action-inner">
                {{ primaryAction.label }}
                <AppIcon name="i-lucide-arrow-down" />
              </span>
            </a>
            <a class="text-action" :href="`mailto:${profile.email}`">
              {{ profile.email }}
            </a>
          </div>
        </div>
      </section>

      <section id="about" class="about section-shell content-section">
        <div class="section-label" data-read-safe>
          <span>关于</span>
        </div>

        <div class="about-body">
          <div class="about-lead" data-read-safe>
            <p
              v-for="(paragraph, index) in profile.bio"
              :key="index"
              :class="{ 'about-lead-primary': index === 0 }"
            >
              {{ paragraph }}
            </p>
          </div>

          <div class="about-highlights">
            <SpotlightCard class="about-card" data-read-safe="block">
              <span class="about-card-label">目标</span>
              <p>{{ profile.goal }}</p>
            </SpotlightCard>
            <SpotlightCard class="about-card" data-read-safe="block">
              <span class="about-card-label">价值观</span>
              <p>{{ profile.values }}</p>
            </SpotlightCard>
          </div>

          <div class="about-focus" data-read-safe="block">
            <span class="status-pill about-focus-label">
              <span class="status-radar" aria-hidden="true">
                <span class="status-radar-sweep" />
                <span class="status-radar-ring" />
                <span class="status-radar-core" />
              </span>
              现在
            </span>
            <p>{{ profile.focus }}</p>
          </div>
        </div>
      </section>

      <ExperienceSection
        v-if="profile.showExperience"
        :open-index="openExperience"
        @toggle="toggleExperience"
      />

      <section id="contact" class="contact section-shell content-section">
        <div class="section-label" data-read-safe>
          <span>联系</span>
        </div>

        <SpotlightCard class="contact-inner" data-read-safe="block">
          <div class="contact-copy">
            <p class="contact-kicker">
              <span class="status-dot" />
              欢迎合作
            </p>
            <h2>有合适的项目，随时联系。</h2>
          </div>
          <a class="contact-cta" :href="`mailto:${profile.email}`">
            <span>{{ profile.email }}</span>
            <AppIcon name="i-lucide-arrow-up-right" />
          </a>
        </SpotlightCard>
      </section>

      <StackSection />
    </main>

    <footer class="section-shell footer" data-read-safe>
      <div>
        <span>© {{ currentYear }} {{ profile.name }}</span>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">沪ICP备2022019503号</a>
      </div>
      <div class="social-links">
        <a
          v-for="item in profile.social"
          :key="item.label"
          :href="item.url"
          target="_blank"
          rel="noreferrer"
        >
          <AppIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </div>
    </footer>
  </div>
</template>
