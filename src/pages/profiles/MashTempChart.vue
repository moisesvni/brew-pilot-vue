<template>
  <div class="mash-chart">
    <svg
      :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      :width="svgWidth"
      :height="svgHeight"
      style="overflow: visible; display: block; width: 100%; height: auto"
    >
      <!-- ── Grade horizontal (temperatura) ──────────────────────── -->
      <line
        v-for="gridTemp in gridLines"
        :key="'hg-' + gridTemp"
        :x1="leftPad"
        :y1="tempToY(gridTemp)"
        :x2="svgWidth - rightPad"
        :y2="tempToY(gridTemp)"
        stroke="var(--bp-border)"
        stroke-width="0.5"
        stroke-dasharray="3,3"
      />
      <text
        v-for="gridTemp in gridLines"
        :key="'yl-' + gridTemp"
        :x="leftPad - 5"
        :y="tempToY(gridTemp) + 3.5"
        text-anchor="end"
        font-size="9"
        fill="var(--bp-text-muted)"
      >{{ gridTemp }}°</text>

      <!-- ── Grade vertical (tempo) ──────────────────────────────── -->
      <line
        v-for="t in timeGridTicks"
        :key="'vg-' + t"
        :x1="leftPad + t * pxPerMin"
        :y1="topPad"
        :x2="leftPad + t * pxPerMin"
        :y2="baselineY"
        stroke="var(--bp-border)"
        stroke-width="0.5"
        stroke-dasharray="3,3"
      />


      <!-- ── Polígonos de rampa (trapézios entre barras) ─────────── -->
      <polygon
        v-for="(seg, i) in rampPolygons"
        :key="'ramp-' + i"
        :points="seg.points"
        :fill="seg.fill"
        fill-opacity="0.20"
        stroke="none"
      />
      <!-- ── Duração da rampa sobre a área da rampa ─────────── -->
      <template v-for="(bar, i) in layout" :key="'rlbl-' + i">
        <text
          v-if="bar.rampW >= 20"
          :x="bar.rampX + bar.rampW / 2"
          :y="baselineY - 5"
          text-anchor="middle"
          font-size="8"
          fill="var(--bp-text-muted)"
          font-style="italic"
        >{{ bar.rampMin }}min</text>
      </template>

      <!-- ── Linha vertical no início de cada etapa (todas) ─────── -->
      <line
        v-for="(bar, i) in layout"
        :key="'vline-' + i"
        :x1="bar.barX"
        :y1="topPad"
        :x2="bar.barX"
        :y2="baselineY"
        stroke="var(--bp-text-muted)"
        stroke-width="0.8"
        opacity="0.45"
      />

      <!-- ── Tempo acumulado no início de cada etapa (exceto 1ª) ─ -->
      <template v-for="(bar, i) in layout" :key="'stime-' + i">
        <text
          v-if="bar.rampMin > 0"
          :x="bar.barX"
          :y="svgHeight - 2"
          text-anchor="middle"
          font-size="8"
          fill="var(--bp-text-muted)"
        >{{ Math.round((bar.barX - leftPad) / pxPerMin) }}min</text>
      </template>
      <!-- ── Barras das etapas ───────────────────────────────────── -->
      <g v-for="(bar, i) in layout" :key="'bar-' + i">
        <rect
          :x="bar.barX"
          :y="bar.barY"
          :width="bar.barW"
          :height="bar.barH"
          rx="3"
          :fill="bar.fill"
          fill-opacity="0.32"
          stroke="none"
        />
        <!-- Temperatura acima da barra -->
        <text
          :x="bar.barX + bar.barW / 2"
          :y="bar.barY - 4"
          text-anchor="middle"
          font-size="9.5"
          font-weight="600"
          :fill="bar.fill"
        >{{ bar.temp }}°C</text>
        <!-- Nome da etapa abaixo da barra -->
        <text
          :x="bar.barX + bar.barW / 2"
          :y="baselineY + 13"
          text-anchor="middle"
          font-size="8.5"
          fill="var(--bp-text-muted)"
        >{{ bar.name }}</text>
        <!-- Tempo dentro da barra -->
        <text
          v-if="bar.barH > 16"
          :x="bar.barX + bar.barW / 2"
          :y="bar.barY + bar.barH / 2 + 4"
          text-anchor="middle"
          font-size="9"
          fill="var(--bp-text-secondary)"
          opacity="0.85"
        >{{ bar.time }}min</text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MashProfileStep } from '@/types/mash'
import type { MashStepType } from '@/types/recipe'

const props = defineProps<{ steps: MashProfileStep[] }>()

// ── Dimensões ──────────────────────────────────────────────────────────────
const svgHeight = 136
const leftPad   = 32
const rightPad  = 12
const topPad    = 20
const bottomPad = 28
const baselineY = svgHeight - bottomPad   // fundo das barras

// ── Cores por tipo ─────────────────────────────────────────────────────────
const stepFillColors: Record<MashStepType, string> = {
  Infusion:    '#2196f3',   // azul  — infusão direta com água
  Temperature: '#ff9800',   // âmbar — repouso por temperatura (HERMS/RIMS)
  Decoction:   '#f44336',   // vermelho — decocção (fervura de parte do mosto)
}

// ── Eixo de tempo ──────────────────────────────────────────────────────────
const totalDisplayedTime = computed(() =>
  props.steps.reduce((sum, s) => sum + (s.rampTime ?? 0) + s.time, 0)
)

const pxPerMin = computed(() => {
  const n = props.steps.length
  if (!n || !totalDisplayedTime.value) return 4
  const minChartW = Math.max(200, n * 50)
  return Math.max(3, minChartW / totalDisplayedTime.value)
})

const svgWidth = computed(() =>
  leftPad + rightPad + Math.ceil(totalDisplayedTime.value * pxPerMin.value)
)

// ── Eixo de temperatura ────────────────────────────────────────────────────
const tempMin = computed(() => Math.min(...props.steps.map(s => s.temperature)) - 10)
const tempMax = computed(() => Math.max(...props.steps.map(s => s.temperature)) + 6)

function tempToY(temp: number): number {
  const chartH = svgHeight - topPad - bottomPad
  const ratio = (tempMax.value - temp) / (tempMax.value - tempMin.value)
  return topPad + ratio * chartH
}

// Grid horizontal (temperatura)
const gridLines = computed(() => {
  const lo = Math.ceil(tempMin.value / 10) * 10
  const hi = Math.floor(tempMax.value / 10) * 10
  const lines: number[] = []
  for (let t = lo; t <= hi; t += 10) lines.push(t)
  return lines
})

// Grid vertical (tempo)
const timeGridTicks = computed(() => {
  const total = totalDisplayedTime.value
  const interval = total <= 30 ? 5 : total <= 60 ? 10 : total <= 120 ? 15 : total <= 180 ? 30 : 60
  const ticks: number[] = []
  for (let t = interval; t < total; t += interval) ticks.push(t)
  return ticks
})

// ── Layout das barras (proporcional ao tempo) ──────────────────────────────
interface StepBar {
  rampX: number; rampW: number; rampMin: number
  barX:  number; barW:  number
  barY:  number; barH:  number
  temp:  number; time:  number
  name:  string; fill:  string
}

const layout = computed((): StepBar[] => {
  if (!props.steps.length) return []
  let tCurrent = 0
  return props.steps.map((s, i) => {
    const rampT = s.rampTime ?? 0
    const rampW = rampT * pxPerMin.value
    const rampX = leftPad + tCurrent * pxPerMin.value
    tCurrent += rampT
    const barX = leftPad + tCurrent * pxPerMin.value
    const barW = s.time * pxPerMin.value
    tCurrent += s.time
    const barY = tempToY(s.temperature)
    return {
      rampX, rampW, rampMin: rampT,
      barX,  barW,
      barY,  barH: Math.max(4, baselineY - barY),
      temp: s.temperature,
      time: s.time,
      name: s.name || `Etapa ${i + 1}`,
      fill: stepFillColors[s.type] ?? '#9e9e9e',
    }
  })
})

// ── Polígonos de rampa (trapézios) ─────────────────────────────────────────
const rampPolygons = computed(() => {
  const polys: { points: string; fill: string }[] = []
  for (let i = 0; i < layout.value.length; i++) {
    const curr = layout.value[i]
    if (curr.rampW < 1) continue
    if (i === 0) {
      // Triângulo inicial: sobe da baseline até a temperatura da 1ª etapa
      polys.push({
        points: `${curr.rampX},${baselineY} ${curr.barX},${curr.barY} ${curr.barX},${baselineY}`,
        fill: curr.fill,
      })
    } else {
      const prev = layout.value[i - 1]
      const x1 = prev.barX + prev.barW   // canto superior-direito da barra anterior
      const y1 = prev.barY
      const x2 = curr.barX               // canto superior-esquerdo da próxima barra
      const y2 = curr.barY
      polys.push({
        points: `${x1},${y1} ${x2},${y2} ${x2},${baselineY} ${x1},${baselineY}`,
        fill: curr.fill,
      })
    }
  }
  return polys
})
</script>

<style scoped>
.mash-chart {
  width: 100%;
  overflow-x: auto;
}
</style>
