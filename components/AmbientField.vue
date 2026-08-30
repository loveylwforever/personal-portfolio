<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null)
let cleanup: (() => void) | undefined

onMounted(() => {
  const element = canvas.value
  const context = element?.getContext('2d', { alpha: true, desynchronized: true })
  if (!element || !context) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const GAP = 24
  const REST_R = 1.05
  const PEAK_R = 3.6
  const INFLUENCE = 160
  const LIFT = 20
  const PUSH = 8
  const SETTLE = 0.2
  const TRAIL = 4

  let width = 0
  let height = 0
  let cols = 0
  let rows = 0
  let count = 0
  let restX = new Float32Array(0)
  let restY = new Float32Array(0)
  let posX = new Float32Array(0)
  let posY = new Float32Array(0)
  let lift = new Float32Array(0)
  let flags = new Uint8Array(0)
  let coverMap = new Float32Array(0)
  let active: number[] = []
  let kept: number[] = []
  let originX = 0
  let originY = 0
  let boxes: { l: number, t: number, r: number, b: number }[] = []
  let overContent = 0
  let staticLayer: HTMLCanvasElement | null = null
  let staticCtx: CanvasRenderingContext2D | null = null
  let staticDirty = true
  let scrollTimer = 0

  const addRect = (rect: DOMRect, pad: number) => {
    if (rect.width < 2 || rect.height < 2) return
    boxes.push({
      l: rect.left - pad,
      t: rect.top - pad,
      r: rect.right + pad,
      b: rect.bottom + pad
    })
  }

  const pointerInContent = (x: number, y: number) => {
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      if (x >= box.l && x <= box.r && y >= box.t && y <= box.b) return true
    }
    return false
  }

  const collectBoxes = () => {
    boxes = []
    const nodes = document.querySelectorAll('[data-read-safe]')
    for (let n = 0; n < nodes.length; n++) {
      const node = nodes[n]
      const mode = node.getAttribute('data-read-safe')
      if (mode === 'block') {
        addRect(node.getBoundingClientRect(), 16)
        continue
      }
      const leaves = node.querySelectorAll('h1, h2, h3, p')
      let found = false
      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i]
        if (leaf.closest('[data-read-safe]') !== node) continue
        addRect(leaf.getBoundingClientRect(), 16)
        found = true
      }
      if (!found) addRect(node.getBoundingClientRect(), 14)
    }

    if (coverMap.length !== count) coverMap = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const x = restX[i]
      const y = restY[i]
      let max = 0
      for (let b = 0; b < boxes.length; b++) {
        const box = boxes[b]
        if (x < box.l || x > box.r || y < box.t || y > box.b) continue
        const inset = Math.min(x - box.l, box.r - x, y - box.t, box.b - y)
        const cover = inset >= 18 ? 1 : inset / 18
        if (cover > max) max = cover
      }
      coverMap[i] = max
    }
    staticDirty = true
  }

  const ensureStatic = () => {
    if (!staticLayer) {
      staticLayer = document.createElement('canvas')
      staticCtx = staticLayer.getContext('2d', { alpha: true })
    }
    if (!staticCtx) return
    if (staticLayer.width !== element.width || staticLayer.height !== element.height) {
      staticLayer.width = element.width
      staticLayer.height = element.height
      staticDirty = true
    }
  }

  const rebuildStatic = () => {
    ensureStatic()
    if (!staticCtx || !staticLayer) return
    const ratio = element.width / width || 1
    staticCtx.setTransform(ratio, 0, 0, ratio, 0, 0)
    staticCtx.clearRect(0, 0, width, height)
    staticCtx.fillStyle = 'rgba(176, 176, 172, 0.15)'
    for (let i = 0; i < count; i++) {
      const cover = coverMap[i]
      if (cover > 0.55) continue
      if (cover > 0.02) {
        staticCtx.fillStyle = `rgba(176, 176, 172, ${0.15 * (1 - cover * 0.85)})`
        staticCtx.fillRect(restX[i] - REST_R, restY[i] - REST_R, REST_R * 2, REST_R * 2)
        staticCtx.fillStyle = 'rgba(176, 176, 172, 0.15)'
      } else {
        staticCtx.fillRect(restX[i] - REST_R, restY[i] - REST_R, REST_R * 2, REST_R * 2)
      }
    }
    staticDirty = false
  }

  const punchReadSafe = () => {
    if (!boxes.length) return
    context.save()
    context.globalCompositeOperation = 'destination-out'
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      const x = box.l
      const y = box.t
      const w = box.r - box.l
      const h = box.b - box.t
      context.beginPath()
      const r = Math.min(8, w / 2, h / 2)
      context.moveTo(x + r, y)
      context.arcTo(x + w, y, x + w, y + h, r)
      context.arcTo(x + w, y + h, x, y + h, r)
      context.arcTo(x, y + h, x, y, r)
      context.arcTo(x, y, x + w, y, r)
      context.closePath()
      context.fillStyle = '#000'
      context.fill()
    }
    context.restore()
  }

  let pointerX = -9999
  let pointerY = -9999
  let smoothX = -9999
  let smoothY = -9999
  const trailX = new Float32Array(TRAIL)
  const trailY = new Float32Array(TRAIL)
  trailX.fill(-9999)
  trailY.fill(-9999)

  let frame = 0
  let running = false
  let visible = true
  let time = 0
  let last = 0
  let needsPaint = true

  const rebuild = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.25)
    width = window.innerWidth
    height = window.innerHeight
    element.width = Math.floor(width * ratio)
    element.height = Math.floor(height * ratio)
    element.style.width = `${width}px`
    element.style.height = `${height}px`
    context.setTransform(ratio, 0, 0, ratio, 0, 0)

    cols = Math.ceil((width + GAP * 2) / GAP)
    rows = Math.ceil((height + GAP * 2) / GAP)
    count = cols * rows
    restX = new Float32Array(count)
    restY = new Float32Array(count)
    posX = new Float32Array(count)
    posY = new Float32Array(count)
    lift = new Float32Array(count)
    flags = new Uint8Array(count)
    active = []
    kept = []

    const ox = (width - (cols - 1) * GAP) / 2
    const oy = (height - (rows - 1) * GAP) / 2
    originX = ox
    originY = oy
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x
        restX[i] = ox + x * GAP
        restY[i] = oy + y * GAP
        posX[i] = restX[i]
        posY[i] = restY[i]
      }
    }
    collectBoxes()
    needsPaint = true
  }

  const mark = (cx: number, cy: number, radius: number) => {
    if (cx < -500) return
    const minC = Math.max(0, Math.floor((cx - originX - radius) / GAP) - 1)
    const maxC = Math.min(cols - 1, Math.ceil((cx - originX + radius) / GAP) + 1)
    const minR = Math.max(0, Math.floor((cy - originY - radius) / GAP) - 1)
    const maxR = Math.min(rows - 1, Math.ceil((cy - originY + radius) / GAP) + 1)
    for (let row = minR; row <= maxR; row++) {
      for (let col = minC; col <= maxC; col++) {
        const i = row * cols + col
        if (!flags[i]) {
          flags[i] = 1
          active.push(i)
        }
      }
    }
  }

  const fieldAt = (x: number, y: number, cx: number, cy: number, radius: number, amp: number) => {
    const dx = x - cx
    const dy = y - cy
    const d2 = dx * dx + dy * dy
    const r2 = radius * radius
    if (d2 >= r2) return 0
    const t = 1 - d2 / r2
    return t * t * amp
  }

  const paint = (now: number) => {
    const dt = Math.min(32, now - (last || now))
    last = now
    time += dt * 0.001

    if (finePointer && !reduceMotion) {
      smoothX += (pointerX - smoothX) * 0.22
      smoothY += (pointerY - smoothY) * 0.22
      trailX[0] += (smoothX - trailX[0]) * 0.28
      trailY[0] += (smoothY - trailY[0]) * 0.28
      for (let t = 1; t < TRAIL; t++) {
        trailX[t] += (trailX[t - 1] - trailX[t]) * (0.18 - t * 0.012)
        trailY[t] += (trailY[t - 1] - trailY[t]) * (0.18 - t * 0.012)
      }
      overContent += ((pointerInContent(pointerX, pointerY) ? 1 : 0) - overContent) * 0.22
    }

    if (staticDirty) rebuildStatic()

    context.clearRect(0, 0, width, height)
    if (staticLayer) context.drawImage(staticLayer, 0, 0, width, height)

    if (reduceMotion || !finePointer) {
      punchReadSafe()
      return
    }

    for (let i = 0; i < active.length; i++) flags[active[i]] = 0
    const prev = active
    active = kept
    active.length = 0
    kept = prev

    mark(smoothX, smoothY, INFLUENCE)
    for (let t = 0; t < TRAIL; t++) mark(trailX[t], trailY[t], INFLUENCE - t * 12)
    for (let i = 0; i < prev.length; i++) {
      const idx = prev[i]
      if (!flags[idx]) {
        flags[idx] = 1
        active.push(idx)
      }
    }

    let stillMoving = false
    kept.length = 0
    for (let n = 0; n < active.length; n++) {
      const i = active[n]
      const x0 = restX[i]
      const y0 = restY[i]
      const cover = coverMap[i]
      let energy = fieldAt(x0, y0, smoothX, smoothY, INFLUENCE, 1)
      for (let t = 0; t < TRAIL; t++) {
        energy += fieldAt(x0, y0, trailX[t], trailY[t], INFLUENCE - t * 10, 0.4 - t * 0.06)
      }
      energy = Math.min(1, energy) * (1 - cover * 0.98) * (1 - overContent * 0.42)

      if (energy > 0.02) {
        const dx = x0 - smoothX
        const dy = y0 - smoothY
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const peak = energy * energy * (1 + 0.14 * Math.sin(time * 5.2 - dist * 0.046))
        posX[i] += (x0 + (dx / dist) * PUSH * peak - posX[i]) * 0.26
        posY[i] += (y0 + (dy / dist) * PUSH * peak * 0.28 - LIFT * peak - posY[i]) * 0.26
        lift[i] += (peak - lift[i]) * 0.28
        stillMoving = true
        kept.push(i)
      } else {
        posX[i] += (x0 - posX[i]) * SETTLE
        posY[i] += (y0 - posY[i]) * SETTLE
        lift[i] *= 1 - SETTLE
        if (Math.abs(posX[i] - x0) > 0.2 || Math.abs(posY[i] - y0) > 0.2 || lift[i] > 0.02) {
          stillMoving = true
          kept.push(i)
        } else {
          posX[i] = x0
          posY[i] = y0
          lift[i] = 0
          flags[i] = 0
        }
      }

      const k = Math.min(1, lift[i])
      if (cover > 0.55 || k < 0.02) continue

      const radius = REST_R + (PEAK_R - REST_R) * k * (1 - cover * 0.75)
      const a = (0.16 + 0.62 * k) * (1 - cover * 0.9)
      context.beginPath()
      context.arc(posX[i], posY[i], radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(${(176 + 38 * k) | 0}, ${(176 + 56 * k) | 0}, ${(172 + 12 * k) | 0}, ${a})`
      context.fill()
    }

    const swap = active
    active = kept
    kept = swap

    punchReadSafe()
    needsPaint = stillMoving || Math.hypot(pointerX - smoothX, pointerY - smoothY) > 0.4 || overContent > 0.01
  }

  const loop = (now: number) => {
    if (!running || !visible) {
      frame = 0
      return
    }
    paint(now)
    if (needsPaint && !reduceMotion) frame = requestAnimationFrame(loop)
    else frame = 0
  }

  const start = () => {
    if (frame || !running || !visible) return
    last = 0
    frame = requestAnimationFrame(loop)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!finePointer) return
    pointerX = event.clientX
    pointerY = event.clientY
    if (smoothX < -500) {
      smoothX = pointerX
      smoothY = pointerY
      trailX.fill(pointerX)
      trailY.fill(pointerY)
    }
    needsPaint = true
    start()
  }

  const onPointerLeave = () => {
    pointerX = -9999
    pointerY = -9999
    needsPaint = true
    start()
  }

  const onVisibility = () => {
    visible = !document.hidden
    if (visible) {
      needsPaint = true
      start()
    } else {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }

  const onScroll = () => {
    window.clearTimeout(scrollTimer)
    scrollTimer = window.setTimeout(() => {
      collectBoxes()
      needsPaint = true
      start()
    }, 60)
  }

  rebuild()
  running = true
  paint(performance.now())
  window.addEventListener('resize', rebuild, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerleave', onPointerLeave)
  document.addEventListener('visibilitychange', onVisibility)
  const fontsReady = document.fonts?.ready.then(() => {
    collectBoxes()
    needsPaint = true
    start()
  })

  cleanup = () => {
    running = false
    cancelAnimationFrame(frame)
    window.clearTimeout(scrollTimer)
    window.removeEventListener('resize', rebuild)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerleave', onPointerLeave)
    document.removeEventListener('visibilitychange', onVisibility)
    void fontsReady
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div class="ambient-field" aria-hidden="true">
    <div class="ambient-veil" />
    <canvas ref="canvas" />
  </div>
</template>
