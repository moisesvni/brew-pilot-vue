<template>
  <component :is="tag" class="bp-label" :class="`bp-label--${variant}`" :style="sizeStyle">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * BrewPilotLabel — texto que responde automaticamente ao tema dark/light.
 *
 * Variantes:
 *   primary      → cor principal do texto     (dark: rgba(255,255,255,.87) | light: #2B1A06)
 *   secondary    → cor secundária / labels     (dark: rgba(255,255,255,.55) | light: #705C3A marrom)
 *   muted        → texto atenuado / hints      (dark: rgba(255,255,255,.38) | light: rgba(43,26,6,.45))
 *   value        → números / valores           (dark: #ccc                  | light: #4A3520)
 *   stats        → rodapé de stats (menor)     (dark: rgba(255,255,255,.45) | light: rgba(80,60,28,.60))
 *   stats-value  → valor no rodapé de stats    (dark: #ccc                  | light: #3A2A12)
 */
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'muted' | 'value' | 'stats' | 'stats-value'
  size?: string
  tag?: string
}>(), {
  variant: 'secondary',
  tag: 'span',
})

const sizeStyle = computed(() =>
  props.size ? { fontSize: props.size } : undefined
)
</script>

<style scoped>
.bp-label--primary     { color: var(--bp-text-primary); }
.bp-label--secondary   { color: var(--bp-text-secondary); }
.bp-label--muted       { color: var(--bp-text-muted); }
.bp-label--value       { color: var(--bp-text-value); }
.bp-label--stats       { color: var(--bp-text-stats-muted); }
.bp-label--stats-value { color: var(--bp-text-stats-value); }
</style>
