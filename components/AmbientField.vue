<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null)
let cleanup: (() => void) | undefined

onMounted(() => {
  const element = canvas.value
  if (!element) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 720
  // Sparse grid / lower DPR on constrained devices.
  const GAP = saveData ? 36 : smallScreen ? 30 : 24
  const DPR_CAP = saveData || smallScreen ? 1 : 1.25
  const REST_R = 1.05
  const PEAK_R = smallScreen ? 3.1 : 3.6
  const INFLUENCE = smallScreen ? 130 : 160
  const LIFT = 18
  const PUSH = 7
  const SETTLE = 0.22
  const TRAIL = 3

  // Static field only — skip interaction work on touch / reduced-motion / save-data.
  const interactive = finePointer && !reduceMotion && !saveData

  const context = element.getContext('2d', { alpha: true, desynchronized: true })
  if (!context) return

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
  let boxes: { l: number, t: number, r: number, b: number, soft: boolean, ink: boolean }[] = []
  let overContent = 0
  let staticLayer: HTMLCanvasElement | null = null
  let staticCtx: CanvasRenderingContext2D | null = null
  let staticDirty = true
  let scrollTimer = 0
  let resizeTimer = 0

  const addBox = (l: number, t: number, r: number, b: number, soft = true, ink = false) => {
    if (r - l < 2 || b - t < 2) return
    boxes.push({ l, t, r, b, soft, ink })
  }

  const addRect = (rect: DOMRectReadOnly, pad: number, soft = true, ink = false) => {
    addBox(rect.left - pad, rect.top - pad, rect.right + pad, rect.bottom + pad, soft, ink)
  }

  /** Merge fragmented inline rects on the same line into one ink band. */
  const mergeLineRects = (rects: DOMRectList | DOMRect[]) => {
    const list: { l: number, t: number, r: number, b: number }[] = []
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i]
      if (!rect || rect.width < 1 || rect.height < 1) continue
      list.push({ l: rect.left, t: rect.top, r: rect.right, b: rect.bottom })
    }
    list.sort((a, b) => a.t - b.t || a.l - b.l)

    const merged: { l: number, t: number, r: number, b: number }[] = []
    for (let i = 0; i < list.length; i++) {
      const cur = list[i]
      const prev = merged[merged.length - 1]
      if (
        prev
        && Math.abs(cur.t - prev.t) < 6
        && Math.abs(cur.b - prev.b) < 10
        && cur.l <= prev.r + 14
      ) {
        prev.l = Math.min(prev.l, cur.l)
        prev.t = Math.min(prev.t, cur.t)
        prev.r = Math.max(prev.r, cur.r)
        prev.b = Math.max(prev.b, cur.b)
      } else {
        merged.push({ ...cur })
      }
    }
    return merged
  }

  /**
   * CJK fullwidth punctuation keeps a wide advance box with empty trail space
   * (e.g. "。" ). Trim that hang so ink cover matches the visible mark.
   */
  const trailingPunctHang = (el: Element) => {
    const text = (el.textContent || '').replace(/\s+$/u, '')
    if (!/[。．！？；：，、…）》」』】〉]$/u.test(text)) return 0

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let lastText: Text | null = null
    while (walker.nextNode()) lastText = walker.currentNode as Text
    if (!lastText?.data) return 0

    const raw = lastText.data.replace(/\s+$/u, '')
    if (!raw) return 0
    const ch = raw[raw.length - 1]
    const offset = lastText.data.lastIndexOf(ch)
    if (offset < 0) return 0

    try {
      const range = document.createRange()
      range.setStart(lastText, offset)
      range.setEnd(lastText, offset + 1)
      const rect = range.getBoundingClientRect()
      if (rect.width < 1) return 0
      // Keep the leading half of the punct cell (where the mark usually sits).
      return rect.width * 0.5
    } catch {
      return 0
    }
  }

  /** Prefer ink/line boxes over full block width (centered text often stretches). */
  const addTextLeaf = (el: Element, padX: number, padY: number, soft = true, ink = false) => {
    try {
      const range = document.createRange()
      range.selectNodeContents(el)
      const bands = mergeLineRects(range.getClientRects())
      if (bands.length) {
        const hang = ink ? trailingPunctHang(el) : 0
        for (let i = 0; i < bands.length; i++) {
          const band = bands[i]
          const isLast = i === bands.length - 1
          const right = band.r - (isLast ? hang : 0)
          addBox(band.l - padX, band.t - padY, right + padX, band.b + padY, soft, ink)
        }
        return
      }
    } catch {
      // fall through to element box
    }
    addRect(el.getBoundingClientRect(), Math.max(padX, padY), soft, ink)
  }

  const pointerInContent = (x: number, y: number) => {
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      if (x >= box.l && x <= box.r && y >= box.t && y <= box.b) return true
    }
    return false
  }

  const rebuildCoverMap = () => {
    if (coverMap.length !== count) coverMap = new Float32Array(count)
    else coverMap.fill(0)

    // Box → dots (spatial) instead of dots → all boxes.
    for (let b = 0; b < boxes.length; b++) {
      const box = boxes[b]
      const boxH = box.b - box.t
      // Short text lines never reach full cover with a 14px edge — scale edge to height for ink.
      const edge = box.ink
        ? Math.max(2, Math.min(5, boxH * 0.22))
        : box.soft
          ? 22
          : 14
      const softScale = box.soft ? 0.62 : 1
      const minC = Math.max(0, Math.floor((box.l - originX) / GAP) - 1)
      const maxC = Math.min(cols - 1, Math.ceil((box.r - originX) / GAP) + 1)
      const minR = Math.max(0, Math.floor((box.t - originY) / GAP) - 1)
      const maxR = Math.min(rows - 1, Math.ceil((box.b - originY) / GAP) + 1)

      for (let row = minR; row <= maxR; row++) {
        for (let col = minC; col <= maxC; col++) {
          const i = row * cols + col
          const x = restX[i]
          const y = restY[i]
          if (x < box.l || x > box.r || y < box.t || y > box.b) continue
          const inset = Math.min(x - box.l, box.r - x, y - box.t, box.b - y)
          let cover = (inset >= edge ? 1 : inset / edge) * softScale
          // Ink core: once inside the padded glyph band, force a clean punch.
          if (box.ink && inset >= edge * 0.35) cover = 1
          if (cover > coverMap[i]) coverMap[i] = cover
        }
      }
    }
    staticDirty = true
  }

  const collectBoxes = () => {
    boxes = []
    const nodes = document.querySelectorAll('[data-read-safe]')
    for (let n = 0; n < nodes.length; n++) {
      const node = nodes[n]
      const mode = node.getAttribute('data-read-safe')
      if (mode === 'block') {
        const chip = node.classList.contains('stack-chip')
        addRect(node.getBoundingClientRect(), chip ? 3 : 10, false, chip)
        continue
      }

      // ink: punch only behind glyphs — keep side gutters ambient
      const ink = mode === 'ink'
      const leaves = node.querySelectorAll('h1, h2, h3, p, .section-label')
      let found = false
      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i]
        if (leaf.closest('[data-read-safe]') !== node) continue
        addTextLeaf(leaf, ink ? 4 : 6, ink ? 7 : 6, !ink, ink)
        found = true
      }
      if (!found) {
        const textLeaves = node.querySelectorAll('span')
        for (let i = 0; i < textLeaves.length; i++) {
          const leaf = textLeaves[i]
          if (leaf.closest('[data-read-safe]') !== node) continue
          if (leaf.parentElement?.closest('.stack-chip, .status-pill, .contact-cta')) continue
          addTextLeaf(leaf, ink ? 4 : 6, ink ? 7 : 6, !ink, ink)
          found = true
        }
      }
      if (!found) addRect(node.getBoundingClientRect(), 8, true, false)
    }
    rebuildCoverMap()
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

    // Bucket similar alphas to cut fillStyle churn.
    const buckets = [0.15, 0.11, 0.07, 0.04]
    for (let b = 0; b < buckets.length; b++) {
      const target = buckets[b]
      const lo = b === buckets.length - 1 ? 0.02 : (buckets[b + 1] + target) / 2
      const hi = b === 0 ? 1 : (buckets[b - 1] + target) / 2
      staticCtx.fillStyle = `rgba(176, 176, 172, ${target})`
      for (let i = 0; i < count; i++) {
        const cover = coverMap[i]
        if (cover > 0.92) continue
        const alpha = 0.15 * (1 - cover * 0.78)
        if (alpha < lo || alpha >= hi) continue
        staticCtx.fillRect(restX[i] - REST_R, restY[i] - REST_R, REST_R * 2, REST_R * 2)
      }
    }
    staticDirty = false
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
    const ratio = Math.min(window.devicePixelRatio || 1, DPR_CAP)
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

    if (interactive) {
      smoothX += (pointerX - smoothX) * 0.22
      smoothY += (pointerY - smoothY) * 0.22
      const headX = trailX[0] ?? smoothX
      const headY = trailY[0] ?? smoothY
      trailX[0] = headX + (smoothX - headX) * 0.28
      trailY[0] = headY + (smoothY - headY) * 0.28
      for (let t = 1; t < TRAIL; t++) {
        const prevX = trailX[t - 1] ?? smoothX
        const prevY = trailY[t - 1] ?? smoothY
        const curX = trailX[t] ?? prevX
        const curY = trailY[t] ?? prevY
        trailX[t] = curX + (prevX - curX) * (0.18 - t * 0.012)
        trailY[t] = curY + (prevY - curY) * (0.18 - t * 0.012)
      }
      overContent += ((pointerInContent(pointerX, pointerY) ? 1 : 0) - overContent) * 0.22
    }

    if (staticDirty) rebuildStatic()

    context.clearRect(0, 0, width, height)
    if (staticLayer) context.drawImage(staticLayer, 0, 0, width, height)

    if (!interactive) {
      needsPaint = false
      return
    }

    for (let i = 0; i < active.length; i++) {
      const idx = active[i]
      if (idx == null) continue
      flags[idx] = 0
    }
    const prev = active
    active = kept
    active.length = 0
    kept = prev

    mark(smoothX, smoothY, INFLUENCE)
    for (let t = 0; t < TRAIL; t++) {
      mark(trailX[t] ?? -9999, trailY[t] ?? -9999, INFLUENCE - t * 12)
    }
    for (let i = 0; i < prev.length; i++) {
      const idx = prev[i]
      if (idx == null || flags[idx]) continue
      flags[idx] = 1
      active.push(idx)
    }

    let stillMoving = false
    kept.length = 0
    for (let n = 0; n < active.length; n++) {
      const i = active[n]
      if (i == null) continue
      const x0 = restX[i] ?? 0
      const y0 = restY[i] ?? 0
      const cover = coverMap[i] ?? 0
      let energy = fieldAt(x0, y0, smoothX, smoothY, INFLUENCE, 1)
      for (let t = 0; t < TRAIL; t++) {
        energy += fieldAt(
          x0,
          y0,
          trailX[t] ?? -9999,
          trailY[t] ?? -9999,
          INFLUENCE - t * 10,
          0.4 - t * 0.06
        )
      }
      energy = Math.min(1, energy) * (1 - cover * 0.98) * (1 - overContent * 0.42)

      const px = posX[i] ?? x0
      const py = posY[i] ?? y0
      const lf = lift[i] ?? 0

      if (energy > 0.02) {
        const dx = x0 - smoothX
        const dy = y0 - smoothY
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const peak = energy * energy * (1 + 0.14 * Math.sin(time * 5.2 - dist * 0.046))
        posX[i] = px + (x0 + (dx / dist) * PUSH * peak - px) * 0.26
        posY[i] = py + (y0 + (dy / dist) * PUSH * peak * 0.28 - LIFT * peak - py) * 0.26
        lift[i] = lf + (peak - lf) * 0.28
        stillMoving = true
        kept.push(i)
      } else {
        const nextX = px + (x0 - px) * SETTLE
        const nextY = py + (y0 - py) * SETTLE
        const nextLift = lf * (1 - SETTLE)
        posX[i] = nextX
        posY[i] = nextY
        lift[i] = nextLift
        if (Math.abs(nextX - x0) > 0.2 || Math.abs(nextY - y0) > 0.2 || nextLift > 0.02) {
          stillMoving = true
          kept.push(i)
        } else {
          posX[i] = x0
          posY[i] = y0
          lift[i] = 0
          flags[i] = 0
        }
      }

      const k = Math.min(1, lift[i] ?? 0)
      if (cover > 0.55 || k < 0.02) continue

      const radius = REST_R + (PEAK_R - REST_R) * k * (1 - cover * 0.75)
      const a = (0.16 + 0.62 * k) * (1 - cover * 0.9)
      const size = radius * 2
      const drawX = posX[i] ?? x0
      const drawY = posY[i] ?? y0
      context.fillStyle = `rgba(${(176 + 38 * k) | 0}, ${(176 + 56 * k) | 0}, ${(172 + 12 * k) | 0}, ${a})`
      context.fillRect(drawX - radius, drawY - radius, size, size)
    }

    const swap = active
    active = kept
    kept = swap

    needsPaint = stillMoving || Math.hypot(pointerX - smoothX, pointerY - smoothY) > 0.4 || overContent > 0.01
  }

  const loop = (now: number) => {
    if (!running || !visible) {
      frame = 0
      return
    }
    paint(now)
    if (needsPaint && interactive) frame = requestAnimationFrame(loop)
    else frame = 0
  }

  const start = () => {
    if (frame || !running || !visible) return
    last = 0
    frame = requestAnimationFrame(loop)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!interactive) return
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
    if (!interactive) return
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
    }, 80)
  }

  const onResize = () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      rebuild()
      start()
    }, 120)
  }

  const boot = () => {
    rebuild()
    running = true
    paint(performance.now())
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    if (interactive) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerleave', onPointerLeave)
    }
    document.addEventListener('visibilitychange', onVisibility)
  }

  // Defer heavy grid build until the browser is idle so LCP stays free.
  let idleHandle: number | null = null
  const bootLater = () => {
    idleHandle = null
    boot()
  }
  if (typeof window.requestIdleCallback === 'function') {
    idleHandle = window.requestIdleCallback(bootLater, { timeout: 500 })
  } else {
    idleHandle = window.setTimeout(bootLater, 1) as unknown as number
  }

  const fontsReady = document.fonts?.ready.then(() => {
    if (!running) return
    collectBoxes()
    needsPaint = true
    start()
  })

  cleanup = () => {
    running = false
    cancelAnimationFrame(frame)
    window.clearTimeout(scrollTimer)
    window.clearTimeout(resizeTimer)
    if (idleHandle != null) {
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle)
      }
      window.clearTimeout(idleHandle)
      idleHandle = null
    }
    window.removeEventListener('resize', onResize)
    window.removeEventListener('scroll', onScroll, true)
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
