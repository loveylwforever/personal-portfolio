<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <span class="tech-icon" aria-hidden="true">
    <img
      :src="`/stack/${name}.svg`"
      alt=""
      width="16"
      height="16"
      loading="lazy"
      decoding="async"
    >
  </span>
</template>
