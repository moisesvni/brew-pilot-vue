<template>
  <div class="sbr-row">

    <!-- Label colorido por status — com tooltip -->
    <div class="sbr-label" :class="`status--${status}`">
      {{ label }}
      <q-tooltip anchor="center right" self="center left" :offset="[6, 0]" class="sbr-tooltip">
        <div class="text-weight-bold">{{ labelInfo.name }}</div>
        <div class="text-grey-4" style="font-size:11px">{{ labelInfo.desc }}</div>
      </q-tooltip>
    </div>

    <!-- Trilha central -->
    <div class="sbr-track">

      <!-- Zona do range (animada na montagem) -->
      <div class="sbr-zone" :class="`zone--${status}`" :style="zoneStyle" />

      <!-- Min: texto na borda esquerda da zona -->
      <span class="sbr-edge" :style="{ left: `calc(${minPct}% + 5px)` }">{{ fmtMin }}</span>

      <!-- Max: texto na borda direita da zona -->
      <span class="sbr-edge sbr-edge--right" :style="{ right: `calc(${100 - maxPct}% + 5px)` }">{{ fmtMax }}</span>

      <!-- Marcador do valor atual (clamped 1–99) -->
      <div
        class="sbr-marker"
        :class="`marker--${status}`"
        :style="{ left: `${clampedPct}%` }"
      />

    </div>

    <!-- Valor atual — sempre à direita, colorido por status -->
    <div class="sbr-cur" :class="`cur--${status}`">{{ fmtCur }}</div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

const props = defineProps<{
  label: string
  current: number
  min: number
  max: number
  decimals?: number
  unit?: string
}>()

// Mapa de tooltips para cada sigla
const tooltipMap: Record<string, { name: string; desc: string }> = {
  ABV:    { name: 'Alcohol By Volume (%)',           desc: 'Teor alcoólico da cerveja' },
  OG:     { name: 'Original Gravity',                desc: 'Densidade do mosto antes da fermentação' },
  FG:     { name: 'Final Gravity',                   desc: 'Densidade residual após fermentação' },
  EBC:    { name: 'European Brewery Convention',     desc: 'Escala de cor da cerveja (quanto maior, mais escura)' },
  IBU:    { name: 'International Bitterness Units',  desc: 'Amargor percebido da cerveja' },
  'BU/GU':{ name: 'Bitterness / Gravity Ratio',     desc: 'Relação entre amargor e densidade — equilíbrio da receita' },
}
const labelInfo = computed(() => tooltipMap[props.label] ?? { name: props.label, desc: '' })

// Escala: 30% de padding em cada lado
const pad        = computed(() => (props.max - props.min) * 0.3 || 0.1)
const scaleMin   = computed(() => props.min - pad.value)
const scaleRange = computed(() => (props.max - props.min) + pad.value * 2)

const minPct     = computed(() => ((props.min - scaleMin.value) / scaleRange.value) * 100)
const maxPct     = computed(() => ((props.max - scaleMin.value) / scaleRange.value) * 100)
const curPct     = computed(() => ((props.current - scaleMin.value) / scaleRange.value) * 100)
const clampedPct = computed(() => Math.min(Math.max(curPct.value, 1), 99))

// Status
const status = computed<'ok' | 'low' | 'high'>(() => {
  if (props.current < props.min) return 'low'
  if (props.current > props.max) return 'high'
  return 'ok'
})

// Animação
const ready = ref(false)
onMounted(() => requestAnimationFrame(() => { ready.value = true }))

const zoneStyle = computed(() => ({
  left: `${minPct.value}%`,
  width: ready.value ? `${maxPct.value - minPct.value}%` : '0%',
}))

// Formatação — min/max com unidade quando aplicável
const d      = computed(() => props.decimals ?? 0)
const fmt    = (v: number) => v.toFixed(d.value)
const u      = computed(() => props.unit ?? '')
const fmtMin = computed(() => fmt(props.min) + u.value)
const fmtMax = computed(() => fmt(props.max) + u.value)
const fmtCur = computed(() => fmt(props.current) + u.value)
</script>

<style scoped>
.sbr-row {
  display: grid;
  grid-template-columns: 46px 1fr 56px;
  height: 26px;
  margin-bottom: 2px;
  align-items: center;
}

/* ── Label esquerdo ── */
.sbr-label {
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  letter-spacing: .04em;
  color: #111;
  border-radius: 3px 0 0 3px;
  cursor: default;
}
.status--ok   { background: #5a8c3a; }
.status--low  { background: #c9a010; }
.status--high { background: #b02020; }

/* ── Trilha ── */
.sbr-track {
  position: relative;
  height: 100%;
  background: #1a1a1a;
  overflow: hidden;
}

/* Zona recomendada — animada */
.sbr-zone {
  position: absolute;
  top: 0; bottom: 0;
  transition: width 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.zone--ok   { background: #3d6b28; }
.zone--low  { background: #3a5e26; }
.zone--high { background: #3a5e26; }

/* Textos min/max — brancos com padding lateral */
.sbr-edge {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 9px;
  color: rgba(255,255,255,0.70);
  z-index: 3;
  pointer-events: none;
  white-space: nowrap;
}
.sbr-edge--right { left: auto; }

/* Marcador vertical */
.sbr-marker {
  position: absolute;
  top: 0; bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  z-index: 4;
  border-radius: 1px;
}
.marker--ok   { background: #7ad4ff; }
.marker--low  { background: #f5ca30; }
.marker--high { background: #e05050; }

/* ── Valor atual (coluna direita) ── */
.sbr-cur {
  font-size: 10px;
  font-weight: 700;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 5px;
  white-space: nowrap;
  border-radius: 0 3px 3px 0;
}
.cur--ok   { color: #6fcf6f; background: rgba(90,140,58,0.18); }
.cur--low  { color: #ffd860; background: rgba(245,202,48,0.08); }
.cur--high { color: #ff9090; background: rgba(224,80,80,0.10);  }

/* Tooltip */
.sbr-tooltip { font-size: 12px; }
</style>
