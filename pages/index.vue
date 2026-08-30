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

const toggleExperience = (index: number) => {
  openExperience.value = openExperience.value === index ? null : index
  nextTick(() => {
    window.dispatchEvent(new Event('scroll'))
  })
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

          <p class="hero-intro reveal reveal-3">
            {{ profile.intro }}
          </p>

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
            <a class="primary-action" href="#experience">
              <span class="primary-action-spin" aria-hidden="true" />
              <span class="primary-action-inner">
                工作经历
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
          <span>{{ profile.location }}</span>
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
            <span class="about-focus-label">
              <span class="about-focus-pulse" aria-hidden="true">
                <span class="about-focus-pulse-core" />
                <span class="about-focus-pulse-ring" />
              </span>
              现在
            </span>
            <p>{{ profile.focus }}</p>
          </div>
        </div>
      </section>

      <section id="experience" class="experience section-shell content-section">
        <div class="section-label" data-read-safe>
          <span>经历</span>
          <span>{{ profile.experience.length.toString().padStart(2, '0') }}</span>
        </div>

        <ol class="experience-list">
          <li
            v-for="(item, index) in profile.experience"
            :key="item.company"
          >
            <SpotlightCard
              as="div"
              class="experience-item"
              :class="{ current: item.current, open: openExperience === index }"
              data-read-safe="block"
            >
              <button
                type="button"
                class="experience-toggle"
                :aria-expanded="openExperience === index"
                :aria-controls="`experience-panel-${index}`"
                @click="toggleExperience(index)"
              >
                <span class="experience-index">{{ String(index + 1).padStart(2, '0') }}</span>
                <div class="experience-main">
                  <div class="experience-heading">
                    <h2>{{ item.company }}</h2>
                    <span v-if="item.current" class="experience-badge">在职</span>
                  </div>
                  <p>
                    <span class="experience-title">{{ item.title }}</span>
                    <span class="experience-sep" aria-hidden="true">·</span>
                    <span>{{ item.start }}</span>
                    <span class="experience-dash">—</span>
                    <span>{{ item.end }}</span>
                  </p>
                </div>
                <span class="experience-plus" aria-hidden="true">
                  <span />
                  <span />
                </span>
              </button>

              <div
                :id="`experience-panel-${index}`"
                class="experience-panel"
                :inert="openExperience !== index"
              >
                <div class="experience-panel-inner">
                  <ul>
                    <li v-for="(detail, detailIndex) in item.details" :key="detailIndex">
                      {{ detail }}
                    </li>
                  </ul>
                </div>
              </div>
            </SpotlightCard>
          </li>
        </ol>
      </section>

      <section id="contact" class="contact section-shell content-section">
        <div class="section-label" data-read-safe>
          <span>联系</span>
          <span>合作</span>
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
