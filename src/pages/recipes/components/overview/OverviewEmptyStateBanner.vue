<template>
  <div class="overview-empty" :class="`overview-empty--${tone}`">
    <div class="overview-empty__icon-wrap">
      <q-icon :name="icon" size="22px" :color="iconColor" />
    </div>
    <div class="overview-empty__title">{{ title }}</div>
    <div class="overview-empty__description">{{ description }}</div>
    <div v-if="$slots.action" class="overview-empty__action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const props = withDefaults(defineProps<{
  icon: string
  title: string
  description: string
  tone?: 'amber' | 'green' | 'purple' | 'teal' | 'orange' | 'blue'
}>(), {
  tone: 'amber',
})

const $q = useQuasar()
const dark = computed(() => $q.dark.isActive)

const toneMap = {
  amber: { light: '#C1710E', dark: '#f0c24d' },
  green: { light: '#3f8c4f', dark: '#79d98d' },
  purple: { light: '#7e57c2', dark: '#b69cf2' },
  teal: { light: '#118a7e', dark: '#5ed1c6' },
  orange: { light: '#d97706', dark: '#f7b955' },
  blue: { light: '#3b82f6', dark: '#7fb0ff' },
} as const

const baseTone = computed(() => toneMap[props.tone])
const accentColor = computed(() => dark.value ? baseTone.value.dark : baseTone.value.light)
const iconColor = computed(() => accentColor.value)
const bannerBg = computed(() => dark.value
  ? `color-mix(in srgb, ${accentColor.value} 10%, var(--bp-surface-alt))`
  : `color-mix(in srgb, ${accentColor.value} 8%, white)`)
const bannerBorder = computed(() => dark.value
  ? `color-mix(in srgb, ${accentColor.value} 28%, transparent)`
  : `color-mix(in srgb, ${accentColor.value} 22%, transparent)`)
const iconBg = computed(() => dark.value
  ? `color-mix(in srgb, ${accentColor.value} 18%, transparent)`
  : `color-mix(in srgb, ${accentColor.value} 12%, white)`)
</script>

<style scoped>
.overview-empty {
  border: 1px solid v-bind(bannerBorder);
  background: v-bind(bannerBg);
  border-radius: 12px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}

.overview-empty__icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: v-bind(iconBg);
}

.overview-empty__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--bp-text-primary);
}

.overview-empty__description {
  max-width: 320px;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--bp-text-secondary);
}

.overview-empty__action {
  margin-top: 2px;
}
</style>