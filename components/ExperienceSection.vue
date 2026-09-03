<script setup lang="ts">
import { profile } from '~/data/profile'

defineProps<{
  openIndex: number | null
}>()

const emit = defineEmits<{
  toggle: [index: number]
}>()
</script>

<template>
  <section id="experience" class="experience section-shell content-section">
    <div class="section-label" data-read-safe>工作经历</div>

    <ol class="experience-list">
      <li
        v-for="(item, index) in profile.experience"
        :key="item.company"
      >
        <SpotlightCard
          as="div"
          class="experience-item"
          :class="{ current: item.current, open: openIndex === index }"
          data-read-safe="block"
        >
          <button
            type="button"
            class="experience-toggle"
            :aria-expanded="openIndex === index"
            :aria-controls="`experience-panel-${index}`"
            @click="emit('toggle', index)"
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
            :inert="openIndex !== index"
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
</template>
