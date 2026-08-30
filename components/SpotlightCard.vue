<script setup lang="ts">
withDefaults(defineProps<{
  as?: string
}>(), {
  as: 'div'
})

const card = ref<HTMLElement | null>(null)

const onMove = (event: PointerEvent) => {
  const el = card.value
  if (!el) return
  const box = el.getBoundingClientRect()
  el.style.setProperty('--spot-x', `${event.clientX - box.left}px`)
  el.style.setProperty('--spot-y', `${event.clientY - box.top}px`)
}

const setRef = (el: Element | null) => {
  card.value = el as HTMLElement | null
}
</script>

<template>
  <component
    :is="as"
    :ref="setRef"
    class="spotlight-card"
    @pointermove="onMove"
  >
    <slot />
  </component>
</template>
