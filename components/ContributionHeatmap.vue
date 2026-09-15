<script setup lang="ts">
import { profile } from '~/data/profile'

type ContributionDay = {
  date: string
  count: number
  level: number
}

type ContributionsPayload = {
  username: string
  total: number
  days: ContributionDay[]
}

const CELL = 12
const GAP = 3
const STEP = CELL + GAP
const DAYS = 7

const { data, status, error } = await useFetch<ContributionsPayload>(
  '/api/github-contributions',
  {
    server: false,
    lazy: true,
    timeout: 12_000
  }
)

const weeks = computed(() => {
  const days = data.value?.days
  if (!days?.length) return [] as ContributionDay[][]

  const columns: ContributionDay[][] = []
  for (let i = 0; i < days.length; i += DAYS) {
    columns.push(days.slice(i, i + DAYS))
  }
  return columns
})

const monthLabels = computed(() => {
  const cols = weeks.value
  if (!cols.length) return [] as { label: string, x: number }[]

  const labels: { label: string, x: number }[] = []
  let lastMonth = -1

  cols.forEach((week, index) => {
    const first = week[0]
    if (!first) return
    const month = new Date(`${first.date}T12:00:00`).getMonth()
    if (month === lastMonth) return
    lastMonth = month
    // Skip cramped first label when the week starts mid-month and is too left.
    if (index === 0 && new Date(`${first.date}T12:00:00`).getDate() > 7) return
    labels.push({
      label: new Date(`${first.date}T12:00:00`).toLocaleString('zh-CN', { month: 'short' }),
      x: index * STEP
    })
  })

  return labels
})

const gridWidth = computed(() => Math.max(weeks.value.length * STEP - GAP, 0))
const gridHeight = DAYS * STEP - GAP
const labelOffset = 18
const svgWidth = computed(() => gridWidth.value)
const svgHeight = computed(() => gridHeight + labelOffset)

const profileUrl = computed(
  () => `https://github.com/${data.value?.username || profile.githubUsername}`
)

const levelClass = (level: number) => `gh-level-${Math.min(4, Math.max(0, level))}`

const dayTitle = (day: ContributionDay) => {
  const when = new Date(`${day.date}T12:00:00`).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  if (day.count === 0) return `${when}：无贡献`
  return `${when}：${day.count} 次贡献`
}
</script>

<template>
  <section id="github" class="gh-heatmap section-shell content-section" data-read-safe="block">
    <div class="section-label section-label--github" data-read-safe>GitHub 动态</div>

    <div class="gh-heatmap-panel">
      <div class="gh-heatmap-head">
        <p class="gh-heatmap-total">
          <template v-if="data">
            过去半年 <strong>{{ data.total.toLocaleString('zh-CN') }}</strong> 次贡献
          </template>
          <template v-else-if="status === 'pending'">
            正在同步 GitHub 贡献…
          </template>
          <template v-else>
            暂时无法加载贡献数据
          </template>
        </p>
        <a
          class="gh-heatmap-link"
          :href="profileUrl"
          target="_blank"
          rel="noreferrer"
        >
          <AppIcon name="i-lucide-github" />
          <span>@{{ data?.username || profile.githubUsername }}</span>
        </a>
      </div>

      <div v-if="status === 'pending'" class="gh-heatmap-skeleton" aria-hidden="true" />

      <div v-else-if="error" class="gh-heatmap-fallback">
        <p>需要配置 <code>GITHUB_TOKEN</code> 后才能拉取实时贡献图。</p>
        <a :href="profileUrl" target="_blank" rel="noreferrer">在 GitHub 查看贡献</a>
      </div>

      <div v-else-if="weeks.length" class="gh-heatmap-scroll">
        <svg
          class="gh-heatmap-svg"
          :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
          :width="svgWidth"
          :height="svgHeight"
          role="img"
          :aria-label="`GitHub 贡献热点图，过去半年 ${data?.total ?? 0} 次贡献`"
        >
          <g class="gh-month-labels" :transform="`translate(0, 10)`">
            <text
              v-for="item in monthLabels"
              :key="`${item.label}-${item.x}`"
              :x="item.x"
              y="0"
            >
              {{ item.label }}
            </text>
          </g>

          <g :transform="`translate(0, ${labelOffset})`">
            <g
              v-for="(week, weekIndex) in weeks"
              :key="weekIndex"
              :transform="`translate(${weekIndex * STEP}, 0)`"
            >
              <rect
                v-for="(day, dayIndex) in week"
                :key="day.date"
                :class="['gh-day', levelClass(day.level)]"
                :x="0"
                :y="dayIndex * STEP"
                :width="CELL"
                :height="CELL"
                rx="2"
                ry="2"
              >
                <title>{{ dayTitle(day) }}</title>
              </rect>
            </g>
          </g>
        </svg>

        <div class="gh-heatmap-legend" aria-hidden="true">
          <span>少</span>
          <span class="gh-day gh-level-0" />
          <span class="gh-day gh-level-1" />
          <span class="gh-day gh-level-2" />
          <span class="gh-day gh-level-3" />
          <span class="gh-day gh-level-4" />
          <span>多</span>
        </div>
      </div>
    </div>
  </section>
</template>
