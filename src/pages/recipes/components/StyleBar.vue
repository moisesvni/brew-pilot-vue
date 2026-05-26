<template>
  <div class="q-mb-md">
    <div class="row items-center q-mb-xs">
      <div class="text-caption text-grey-5 col-2">{{ label }}</div>
      <div class="col-8 style-bar-container">
        <!-- Faixa do estilo -->
        <div
          class="style-bar-range"
          :style="{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }"
        />
        <!-- Valor atual -->
        <div
          class="style-bar-value"
          :style="{ left: `${valuePos}%`, backgroundColor: inRange ? '#c1710e' : '#c10015' }"
        />
      </div>
      <div class="text-caption q-ml-sm col-2" :class="inRange ? 'text-amber' : 'text-negative'">
        {{ displayValue }}{{ unit }}
      </div>
    </div>
    <div class="row text-caption text-grey-7 q-ml-xs" style="font-size: 0.65rem">
      <span>{{ min }}{{ unit }}</span>
      <q-space />
      <span>{{ max }}{{ unit }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: number
  min: number
  max: number
  unit?: string
}>()

// Estender a escala um pouco além do máximo para exibir valores fora
const scale = computed(() => (props.max - props.min) * 1.4 || 1)
const rangeLeft = computed(() => 15) // % de margem visual
const rangeWidth = computed(() => 70) // % da largura total

const valuePos = computed(() => {
  const pct = (props.value - props.min) / (props.max - props.min)
  // Mapear para a zona visual (15% a 85%)
  return Math.min(Math.max(15 + pct * 70, 2), 98)
})

const inRange = computed(() => props.value >= props.min && props.value <= props.max)
const displayValue = computed(() => {
  if (props.label === 'OG') return (props.value / 1000 + 1).toFixed(3)
  if (Number.isInteger(props.value)) return props.value.toString()
  return props.value.toFixed(1)
})
</script>
