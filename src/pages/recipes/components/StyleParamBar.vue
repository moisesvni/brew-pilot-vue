<template>
  <div class="spb-row">
    <!-- Label esquerdo -->
    <div class="spb-label">
      <q-tooltip anchor="center right" self="center left" :offset="[6, 0]" class="spb-tooltip">
        <div class="text-weight-bold" style="font-size: 12px">{{ labelInfo.name }}</div>
        <div style="font-size: 11px; opacity: 0.72; margin-top: 2px">{{ labelInfo.desc }}</div>
      </q-tooltip>
      {{ label }}
    </div>

    <!-- Trilha -->
    <div class="spb-track">
      <!-- Zona min–max (proporcional ao range total do estilo) -->
      <div class="spb-zone" :style="zoneStyle" />
      <!-- Texto min na borda esquerda da zona -->
      <span class="spb-val spb-val--min" :style="{ left: `calc(${minPct}% + 4px)` }">{{ fmtMin }}</span>
      <!-- Texto max na borda direita da zona -->
      <span class="spb-val spb-val--max" :style="{ right: `calc(${100 - maxPct}% + 4px)` }">{{ fmtMax }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps<{
  label: string
  min: number
  max: number
  decimals?: number
  unit?: string
}>()

const $q = useQuasar()
const dark = computed(() => $q.dark.isActive)

const tooltipMap: Record<string, { name: string; desc: string }> = {
  ABV:     { name: 'Alcohol By Volume (%)',          desc: 'Teor alcoólico esperado do estilo' },
  OG:      { name: 'Original Gravity',               desc: 'Densidade do mosto antes da fermentação' },
  FG:      { name: 'Final Gravity',                  desc: 'Densidade residual após fermentação' },
  EBC:     { name: 'European Brewery Convention',    desc: 'Escala de cor da cerveja' },
  IBU:     { name: 'International Bitterness Units', desc: 'Amargor da cerveja' },
  'BU/GU': { name: 'Bitterness / Gravity Ratio',    desc: 'Equilíbrio entre amargor e corpo' },
}
const labelInfo = computed(() => tooltipMap[props.label] ?? { name: props.label, desc: '' })

// Escala: 30% de padding em cada lado — zona proporcional ao range
const pad        = computed(() => (props.max - props.min) * 0.3 || 0.1)
const scaleMin   = computed(() => props.min - pad.value)
const scaleRange = computed(() => (props.max - props.min) + pad.value * 2)

const minPct = computed(() => ((props.min - scaleMin.value) / scaleRange.value) * 100)
const maxPct = computed(() => ((props.max - scaleMin.value) / scaleRange.value) * 100)

const ready = ref(false)
onMounted(() => requestAnimationFrame(() => { ready.value = true }))

const zoneStyle = computed(() => ({
  left: `${minPct.value}%`,
  width: ready.value ? `${maxPct.value - minPct.value}%` : '0%',
}))

// Formatação
const d      = computed(() => props.decimals ?? 0)
const u      = computed(() => props.unit ?? '')
const fmt    = (v: number) => v.toFixed(d.value) + u.value
const fmtMin = computed(() => fmt(props.min))
const fmtMax = computed(() => fmt(props.max))

// Cores reativas ao tema
const trackBg  = computed(() => dark.value ? 'rgba(255,255,255,.07)' : 'rgba(43,26,6,.10)')
const zoneBg   = computed(() => dark.value ? 'rgba(193,113,14,.40)'  : 'rgba(193,113,14,.30)')
const valColor = computed(() => dark.value ? 'rgba(255,255,255,.75)' : 'rgba(43,26,6,.70)')
const labelColor = computed(() => dark.value ? 'rgba(255,255,255,.55)' : 'rgba(80,55,20,.70)')
</script>

<style scoped>
.spb-row {
  display: grid;
  grid-template-columns: 46px 1fr;
  height: 22px;
  margin-bottom: 3px;
  align-items: center;
  gap: 0;
}

/* ── Label esquerdo ── */
.spb-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
  text-align: center;
  color: v-bind(labelColor);
  cursor: default;
  padding-right: 4px;
}

/* ── Trilha ── */
.spb-track {
  position: relative;
  height: 16px;
  background: v-bind(trackBg);
  border-radius: 3px;
  overflow: visible;
}

/* Zona âmbar — animada */
.spb-zone {
  position: absolute;
  top: 0; bottom: 0;
  background: v-bind(zoneBg);
  border-radius: 2px;
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Valores min / max dentro da trilha */
.spb-val {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
  color: v-bind(valColor);
  pointer-events: none;
  white-space: nowrap;
}
.spb-val--min { left: auto; }
.spb-val--max { right: auto; }

/* Tooltip */
.spb-tooltip {
  font-size: 11px;
}
</style>
