<script setup lang="ts">
withDefaults(defineProps<{
  as?: string
}>(), {
  as: 'div'
})

const card = useTemplateRef<HTMLElement>('card')
let frame = 0

const onMove = (event: PointerEvent) => {
  const el = card.value
  if (!el) return
  const { clientX, clientY } = event
  if (frame) return
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
