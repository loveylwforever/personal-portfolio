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
    <!-- Collaboration: twin dots meet inside the shared 10px slot -->
    <template v-if="variant === 'coop'">
      <span class="status-coop-a" />
      <span class="status-coop-b" />
    </template>

    <!-- Available / now: shared ring + dot; motion differs via CSS class -->
    <template v-else>
      <span class="status-dot-ring" />
      <span class="status-dot" />
    </template>
  </span>
</template>
