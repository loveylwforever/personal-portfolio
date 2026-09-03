<script setup lang="ts">
import { profile } from '~/data/profile'
</script>

<template>
  <section id="stack" class="stack section-shell content-section">
    <div class="section-label" data-read-safe>
      <span>技术</span>
    </div>

    <div class="stack-groups">
      <div
        v-for="group in profile.stacks"
        :key="group.title"
        class="stack-group"
        data-read-safe="block"
      >
        <h2 class="stack-group-title">{{ group.title }}</h2>
        <ul class="stack-list">
          <li v-for="item in group.items" :key="item.name">
            <span class="stack-chip">
              <TechIcon :name="item.icon" />
              <span>{{ item.name }}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
