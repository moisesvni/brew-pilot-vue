<template>
    <div class="mash-chart-compact">
        <svg :viewBox="`0 0 ${vbWidth} ${vbHeight}`"
            style="overflow: visible; display: block; width: 100%; height: auto">
            <!-- ── Grade horizontal (temperatura) ──────────────────────── -->
            <line v-for="gridTemp in gridLines" :key="'hg-' + gridTemp" :x1="leftPad" :y1="tempToY(gridTemp)"
                :x2="vbWidth - rightPad" :y2="tempToY(gridTemp)" :stroke="chartColors.grid" stroke-width="0.5"
                stroke-dasharray="3,3" />
            <text v-for="gridTemp in gridLines" :key="'yl-' + gridTemp" :x="leftPad - 5" :y="tempToY(gridTemp) + 3.5"
                text-anchor="end" font-size="9" :fill="chartColors.label">{{ gridTemp }}°</text>
            <!-- ── Polígonos de rampa (trapézios entre barras) ─────────── -->
            <polygon v-for="(seg, i) in rampPolygons" :key="'ramp-' + i" :points="seg.points" :fill="seg.fill"
                fill-opacity="0.20" stroke="none" />
            <!-- ── Duração da rampa sobre a área da rampa ─────────── -->
            <template v-for="(bar, i) in layout" :key="'rlbl-' + i">
                <text v-if="bar.rampW >= 20" :x="bar.rampX + bar.rampW / 2" :y="baselineY - 5" text-anchor="middle"
                    font-size="8" :fill="chartColors.label" font-style="italic">{{ bar.rampMin }}min</text>
            </template>
            <!-- ── Linha vertical no início de cada etapa (todas) ─────── -->
            <line v-for="(bar, i) in layout" :key="'vline-' + i" :x1="bar.barX" :y1="topPad" :x2="bar.barX"
                :y2="baselineY" :stroke="chartColors.divider" stroke-width="0.8" opacity="0.45" />
            <!-- ── Tempo acumulado no início de cada etapa (exceto 1ª) ─ -->
            <template v-for="(bar, i) in layout" :key="'stime-' + i">
                <text v-if="bar.rampMin > 0" :x="bar.barX" :y="vbHeight - 2" text-anchor="middle" font-size="8"
                    :fill="chartColors.label">{{ Math.round((bar.barX - leftPad) / pxPerMin) }}min</text>
            </template>
            <!-- ── Barras das etapas ───────────────────────────────────── -->
            <g v-for="(bar, i) in layout" :key="'bar-' + i">
                <rect :x="bar.barX" :y="bar.barY" :width="bar.barW" :height="bar.barH" rx="0" :fill="bar.fill"
                    fill-opacity="0.32" stroke="none" />
                <!-- Temperatura acima da barra -->
                <text :x="bar.barX + bar.barW / 2" :y="bar.barY - 4" text-anchor="middle" font-size="9.5"
                    font-weight="600" :fill="bar.fill">{{ bar.temp }}°C</text>
                <!-- Nome da etapa abaixo da barra -->
                <text :x="bar.barX + bar.barW / 2" :y="baselineY + 13" text-anchor="middle" font-size="8.5"
                    :fill="chartColors.label">{{ bar.name }}</text>
                <!-- Tempo dentro da barra -->
                <text v-if="bar.barH > 16" :x="bar.barX + bar.barW / 2" :y="bar.barY + bar.barH / 2 + 4"
                    text-anchor="middle" font-size="9" :fill="chartColors.time" opacity="0.85">{{ bar.time
                    }}min</text>
            </g>
        </svg>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import type { MashProfileStep } from '@/types/mash'
import type { MashStepType } from '@/types/recipe'

const props = defineProps<{
    steps: MashProfileStep[]
    width?: number
    height?: number
}>()

// ── Dimensões (viewBox fixo via props) ────────────────────────────────────
const vbWidth = computed(() => props.width ?? 600)
const vbHeight = computed(() => props.height ?? 100)
const leftPad = 32
const rightPad = 12
const topPad = 20
const bottomPad = 28
const baselineY = computed(() => vbHeight.value - bottomPad)

const $q = useQuasar()

// ── Cores por tipo (reativo ao dark mode) ────────────────────────────────
const stepFillColors = computed((): Record<MashStepType, string> =>
    $q.dark.isActive ? {
        Infusion: '#7bbde8',       // azul apagado
        Temperature: '#d49840',    // âmbar apagado
        Decoction: '#c96460',      // vermelho apagado
    } : {
        Infusion: '#2196f3',       // azul vivo
        Temperature: '#e6830a',    // âmbar quente
        Decoction: '#d32f2f',      // vermelho vivo
    }
)

// ── Cores do gráfico (grid, labels) ──────────────────────────────────────
const chartColors = computed(() =>
    $q.dark.isActive ? {
        grid: 'rgba(255, 255, 255, 0.20)',
        label: 'rgba(255, 255, 255, 0.72)',
        time: 'rgba(255, 255, 255, 0.65)',
        divider: 'rgba(255, 255, 255, 0.18)',
    } : {
        grid: 'rgba(170, 110, 50, 0.18)',
        label: '#7a4a1e',
        time: '#8b5e3c',
        divider: 'rgba(170, 110, 50, 0.28)',
    }
)

// ── Eixo de tempo ──────────────────────────────────────────────────────────
const totalDisplayedTime = computed(() =>
    props.steps.reduce((sum, s) => sum + (s.rampDuration ?? 0) + s.time, 0)
)

const pxPerMin = computed(() => {
    if (!totalDisplayedTime.value) return 4
    return (vbWidth.value - leftPad - rightPad) / totalDisplayedTime.value
})

// ── Eixo de temperatura ────────────────────────────────────────────────────
const tempMin = computed(() => Math.min(...props.steps.map(s => s.temperature)) - 10)
const tempMax = computed(() => Math.max(...props.steps.map(s => s.temperature)) + 6)

function tempToY(temp: number): number {
    const chartH = vbHeight.value - topPad - bottomPad
    const ratio = (tempMax.value - temp) / (tempMax.value - tempMin.value)
    return topPad + ratio * chartH
}

const gridLines = computed(() => {
    const lo = Math.ceil(tempMin.value / 10) * 10
    const hi = Math.floor(tempMax.value / 10) * 10
    const lines: number[] = []
    for (let t = lo; t <= hi; t += 10) lines.push(t)
    return lines
})

const timeGridTicks = computed(() => {
    const total = totalDisplayedTime.value
    const interval = total <= 30 ? 5 : total <= 60 ? 10 : total <= 120 ? 15 : total <= 180 ? 30 : 60
    const ticks: number[] = []
    for (let t = interval; t < total; t += interval) ticks.push(t)
    return ticks
})

// ── Layout das barras ──────────────────────────────────────────────────────
interface StepBar {
    rampX: number; rampW: number; rampMin: number
    barX: number; barW: number
    barY: number; barH: number
    temp: number; time: number
    name: string; fill: string
}

const layout = computed((): StepBar[] => {
    if (!props.steps.length) return []
    let tCurrent = 0
    return props.steps.map((s, i) => {
        const rampT = s.rampDuration ?? 0
        const rampW = rampT * pxPerMin.value
        const rampX = leftPad + tCurrent * pxPerMin.value
        tCurrent += rampT
        const barX = leftPad + tCurrent * pxPerMin.value
        const barW = s.time * pxPerMin.value
        tCurrent += s.time
        const barY = tempToY(s.temperature)
        return {
            rampX, rampW, rampMin: rampT,
            barX, barW,
            barY, barH: Math.max(4, baselineY.value - barY),
            temp: s.temperature,
            time: s.time,
            name: s.name || `Etapa ${i + 1}`,
            fill: stepFillColors.value[s.stepType] ?? '#9e9e9e',
        }
    })
})

// ── Polígonos de rampa ─────────────────────────────────────────────────────
const rampPolygons = computed(() => {
    const polys: { points: string; fill: string }[] = []
    for (let i = 0; i < layout.value.length; i++) {
        const curr = layout.value[i]
        if (curr.rampW < 1) continue
        if (i === 0) {
            polys.push({
                points: `${curr.rampX},${baselineY.value} ${curr.barX},${curr.barY} ${curr.barX},${baselineY.value}`,
                fill: curr.fill,
            })
        } else {
            const prev = layout.value[i - 1]
            polys.push({
                points: `${prev.barX + prev.barW},${prev.barY} ${curr.barX},${curr.barY} ${curr.barX},${baselineY.value} ${prev.barX + prev.barW},${baselineY.value}`,
                fill: curr.fill,
            })
        }
    }
    return polys
})
</script>

<style scoped>
.mash-chart-compact {
    width: 100%;
    overflow: hidden;
}
</style>
