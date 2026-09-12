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
    <!-- Available: classic glowing pulse -->
    <template v-if="variant === 'pulse'">
      <span class="status-dot-ring" />
      <span class="status-dot" />
    </template>

    <!-- Now: soft breath ring -->
    <template v-else-if="variant === 'radar'">
      <span class="status-dot-ring" />
      <span class="status-dot" />
    </template>

    <!-- Collaboration: two nodes gently meet -->
    <template v-else>
      <span class="status-coop-a" />
      <span class="status-coop-b" />
    </template>
  </span>
</template>
