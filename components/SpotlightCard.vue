<script setup lang="ts">
withDefaults(defineProps<{
  as?: string
}>(), {
  as: 'div'
})

const card = useTemplateRef<HTMLElement>('card')
const interactive = ref(false)
let frame = 0

onMounted(() => {
  interactive.value =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const onMove = (event: PointerEvent) => {
  if (!interactive.value) return
  const el = card.value
  if (!el || frame) return
  const { clientX, clientY } = event
  frame = requestAnimationFrame(() => {
    frame = 0
    const box = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${clientX - box.left}px`)
    el.style.setProperty('--spot-y', `${clientY - box.top}px`)
  })
}

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <component
    :is="as"
    ref="card"
    class="spotlight-card"
    @pointermove="onMove"
  >
    <slot />
  </component>
</template>
