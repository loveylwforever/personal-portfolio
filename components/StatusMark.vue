<script setup lang="ts">
withDefaults(defineProps<{
  /** pulse = available · radar = now · coop = collaboration */
  variant?: 'pulse' | 'radar' | 'coop'
}>(), {
  variant: 'pulse'
})
</script>

<template>
  <span
    class="status-mark"
    :class="`status-${variant}`"
    aria-hidden="true"
  >
    <template v-if="variant === 'pulse'">
      <span class="status-pulse-ring" />
      <span class="status-pulse-core" />
    </template>

    <template v-else-if="variant === 'radar'">
      <span class="status-radar-sweep" />
      <span class="status-radar-ring" />
      <span class="status-radar-core" />
    </template>

    <template v-else>
      <span class="status-coop-a" />
      <span class="status-coop-b" />
      <span class="status-coop-core" />
    </template>
  </span>
</template>
