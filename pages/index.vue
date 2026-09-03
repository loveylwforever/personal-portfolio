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
    <PillNav />

    <main>
      <!-- Hero -->
      <section class="hero section-shell" aria-labelledby="hero-title">
        <div class="hero-glow" aria-hidden="true" />

        <div class="hero-copy" data-read-safe>
          <div class="status-pill reveal reveal-1" data-read-safe="block">
            <StatusMark variant="pulse" />
            <span>{{ profile.status }}</span>
          </div>

          <h1 id="hero-title" class="reveal reveal-2">
            {{ profile.name }}
          </h1>

          <p class="hero-role reveal reveal-2">{{ profile.role }}</p>
          <p class="hero-intro reveal reveal-3">{{ profile.intro }}</p>
          <p class="hero-intro-en reveal reveal-3">{{ profile.introEn }}</p>

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
              {{ primaryAction.label }}
              <AppIcon name="i-lucide-arrow-down" />
            </a>
          </div>
        </div>
      </section>

      <!-- About -->
      <section id="about" class="about section-shell content-section">
        <div class="section-label" data-read-safe>关于作者</div>

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
              <StatusMark variant="radar" />
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

      <!-- Contact -->
      <section id="contact" class="contact section-shell content-section">
        <div class="section-label" data-read-safe>联系作者</div>

        <SpotlightCard class="contact-inner" data-read-safe="block">
          <div class="contact-copy">
            <span class="status-pill contact-kicker">
              <StatusMark variant="coop" />
              {{ profile.contactLabel }}
            </span>
            <span class="contact-line">{{ profile.contactLine }}</span>
          </div>

          <a class="contact-cta" :href="`mailto:${profile.email}`">
            <span class="contact-cta-label">{{ profile.email }}</span>
            <span class="contact-cta-icon" aria-hidden="true">
              <AppIcon name="i-lucide-arrow-up-right" />
            </span>
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
