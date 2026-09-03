<script setup lang="ts">
defineProps<{
  name: string
}>()

type IconDef = { paths: string[], rect?: { x: number, y: number, width: number, height: number, rx?: number } }

const icons: Record<string, IconDef> = {
  'i-lucide-coffee': {
    paths: ['M10 2v2m4-2v2m2 4a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1M6 2v2']
  },
  'i-lucide-arrow-up-right': { paths: ['M7 7h10v10M7 17 17 7'] },
  'i-lucide-arrow-down': { paths: ['M12 5v14m7-7-7 7-7-7'] },
  'i-lucide-arrow-left': { paths: ['m12 19-7-7 7-7M19 12H5'] },
  'i-lucide-github': {
    paths: [
      'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4',
      'M9 18c-4.51 2-5-2-7-2'
    ]
  },
  'i-lucide-tv': {
    paths: ['m17 2-5 5-5-5'],
    rect: { x: 2, y: 7, width: 20, height: 15, rx: 2 }
  },
  'i-lucide-bookmark': {
    paths: ['M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z']
  }
}
</script>

<template>
  <span class="app-icon" aria-hidden="true">
    <svg
      v-if="icons[name]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path v-for="(d, i) in icons[name].paths" :key="i" :d="d" />
      <rect
        v-if="icons[name].rect"
        v-bind="icons[name].rect"
      />
    </svg>
  </span>
</template>
