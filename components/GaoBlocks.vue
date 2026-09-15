<script setup lang="ts">
import { createTiks, defineTheme, init as initTiks } from '@rexa-developer/tiks'

type Cell = { x: number, y: number }
type SoundName = 'pop' | 'click' | 'notify' | 'success'

/** 5×7 pixel fonts — square voxels like AmbientField dots */
const GLYPHS: Record<string, string[]> = {
  G: [
    '.###.',
    '#...#',
    '#....',
    '#.###',
    '#...#',
    '#...#',
    '.###.'
  ],
  A: [
    '.###.',
    '#...#',
    '#...#',
    '#####',
    '#...#',
    '#...#',
    '#...#'
  ],
  O: [
    '.###.',
    '#...#',
    '#...#',
    '#...#',
    '#...#',
    '#...#',
    '.###.'
  ]
}

/** Higher / shorter — crisp art-letter tick for A */
const pingTheme = defineTheme({
  name: 'gao-ping',
  baseFreq: 980,
  noiseColor: 'white',
  oscType: 'triangle',
  filterFreq: 7800,
  filterQ: 3.2,
  attack: 0.0008,
  decay: 0.22,
  brightness: 7200
})

const LETTERS = [
  { char: 'G', tone: 'arcade' as const, sound: 'pop' as SoundName },
  { char: 'A', tone: pingTheme, sound: 'success' as SoundName },
  { char: 'O', tone: 'glass' as const, sound: 'pop' as SoundName }
]

/** Two spaced layers — less overlap, clearer rightward 拖影 */
const TRAIL_LAYERS = [2, 4]

const engines = LETTERS.map(letter =>
  createTiks({
    theme: letter.tone,
    volume: letter.char === 'A' ? 0.7 : letter.char === 'O' ? 0.68 : 0.55,
    respectReducedMotion: true
  })
)

const cellsFor = (char: string): Cell[] => {
  const rows = GLYPHS[char] || []
  const cells: Cell[] = []
  rows.forEach((row, y) => {
    ;[...row].forEach((bit, x) => {
      if (bit === '#') cells.push({ x, y })
    })
  })
  return cells
}

const letters = LETTERS.map((letter, index) => ({
  ...letter,
  cells: cellsFor(letter.char),
  engineIndex: index
}))

const pressed = ref<string | null>(null)

const playSound = (engineIndex: number, sound: SoundName) => {
  const engine = engines[engineIndex]
  if (!engine) return
  initTiks()
  if (sound === 'pop') engine.pop()
  else if (sound === 'notify') engine.notify()
  else if (sound === 'success') engine.success()
  else engine.click()
}

/** whileTap-style press — spring on release, no hover motion */
const onPress = (
  event: PointerEvent,
  char: string,
  engineIndex: number,
  sound: SoundName
) => {
  if (event.button !== 0 && event.pointerType === 'mouse') return
  pressed.value = char
  playSound(engineIndex, sound)
  try {
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  } catch {
    // ignore capture failures on unsupported targets
  }
}

const onRelease = () => {
  pressed.value = null
}
</script>

<template>
  <div class="gao-blocks" data-read-safe="block">
    <div class="gao-stage" role="group" aria-label="可点击的 GAO 立体字母">
      <button
        v-for="letter in letters"
        :key="letter.char"
        type="button"
        class="gao-letter"
        :class="[
          `gao-letter-${letter.char.toLowerCase()}`,
          { 'is-pressed': pressed === letter.char }
        ]"
        :aria-label="`字母 ${letter.char}，点击发声`"
        @pointerdown="onPress($event, letter.char, letter.engineIndex, letter.sound)"
        @pointerup="onRelease"
        @pointercancel="onRelease"
        @lostpointercapture="onRelease"
      >
        <!-- Full 5×7 hit pad — holes inside the letter also click -->
        <span class="gao-hit" aria-hidden="true" />

        <!-- Trails stay in stage space (not letter yaw) so 拖影 direction matches -->
        <span
          v-for="layer in TRAIL_LAYERS"
          :key="`${letter.char}-trail-${layer}`"
          class="gao-trail"
          :style="{ '--trail': layer }"
          aria-hidden="true"
        >
          <span
            v-for="(cell, index) in letter.cells"
            :key="`${letter.char}-t${layer}-${index}`"
            class="gao-trail-cell"
            :style="{
              '--vx': cell.x,
              '--vy': cell.y
            }"
          />
        </span>

        <span class="gao-solid" aria-hidden="true">
          <span
            v-for="(cell, index) in letter.cells"
            :key="`${letter.char}-${index}`"
            class="gao-voxel"
            :style="{
              '--vx': cell.x,
              '--vy': cell.y
            }"
          >
            <span class="gao-face gao-face-top" />
            <span class="gao-face gao-face-left" />
            <span class="gao-face gao-face-right" />
            <span class="gao-face gao-face-bottom" />
          </span>
        </span>
      </button>
    </div>

    <!-- Handwritten-style note — floats beside letters, arrow points at them -->
    <p class="gao-hint" aria-hidden="true">
      <svg
        class="gao-hint-arrow"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M34 4c1 15-5 26-21 30" />
        <path d="m21 36-8-2 7-7" />
      </svg>
      <span class="gao-hint-text">点按字母发声</span>
    </p>
  </div>
</template>
