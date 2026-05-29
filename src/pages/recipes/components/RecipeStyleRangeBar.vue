<template>
  <div class="sbr-row">
    <!-- Label colorido por status — com tooltip -->
    <div class="sbr-label" :class="`status--${status}`">
      {{ label }}
      <q-tooltip anchor="center right" self="center left" :offset="[6, 0]" class="sbr-tooltip">
        <div class="text-weight-bold" style="font-size:12px">{{ labelInfo.name }}</div>
        <div style="font-size:11px; opacity: 0.72; margin-top:2px">{{ labelInfo.desc }}</div>
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
import { useQuasar } from 'quasar'

const props = defineProps<{
  label: string
  current: number
  min: number
  max: number
  decimals?: number
  unit?: string
}>()

const $q = useQuasar()
const dark = computed(() => $q.dark.isActive)

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

// Escala: 30% de padding em cada lado → zona ocupa ~55% da trilha
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

// Formatação
const d      = computed(() => props.decimals ?? 0)
const fmt    = (v: number) => v.toFixed(d.value)
const u      = computed(() => props.unit ?? '')
const fmtMin = computed(() => fmt(props.min) + u.value)
const fmtMax = computed(() => fmt(props.max) + u.value)
const fmtCur = computed(() => fmt(props.current) + u.value)

// ── Cores reativas ao tema (v-bind no CSS) ───────────────────────────────────
const trackBg    = computed(() => dark.value ? '#1a1a1a'              : '#E2D9C8')
const edgeColor  = computed(() => dark.value ? 'rgba(255,255,255,.68)': 'rgba(43,26,6,.60)')

// Zonas (fundo da área ok/low/high na trilha)
const zoneOkBg   = computed(() => dark.value ? '#3d6b28'              : 'rgba(76,128,45,0.42)')
const zoneLowBg  = computed(() => dark.value ? '#56460a'              : 'rgba(180,130,10,0.38)')
const zoneHighBg = computed(() => dark.value ? '#5a1a1a'              : 'rgba(160,30,30,0.32)')

// Marcador vertical
const markerOk   = computed(() => dark.value ? '#7ad4ff' : '#155a28')
const markerLow  = computed(() => dark.value ? '#f5ca30' : '#8B6000')
const markerHigh = computed(() => dark.value ? '#e05050' : '#9B1C1C')

// Valor atual (coluna direita)
const curOkColor  = computed(() => dark.value ? '#6fcf6f' : '#1a5e20')
const curOkBg     = computed(() => dark.value ? 'rgba(90,140,58,.18)' : 'rgba(76,128,45,.14)')
const curLowColor = computed(() => dark.value ? '#ffd860' : '#7B5000')
const curLowBg    = computed(() => dark.value ? 'rgba(245,202,48,.08)': 'rgba(180,130,10,.13)')
const curHighColor= computed(() => dark.value ? '#ff9090' : '#8B1A1A')
const curHighBg   = computed(() => dark.value ? 'rgba(224,80,80,.10)' : 'rgba(160,30,30,.11)')
</script>

<style scoped>
.sbr-row {
  display: grid;
  grid-template-columns: 46px 1fr 56px;
  height: 26px;
  margin-bottom: 2px;
  align-items: center;
}

/* ── Label esquerdo (sempre colorido por status) ── */
.sbr-label {
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  letter-spacing: .04em;
  color: #fff;
  border-radius: 3px 0 0 3px;
  cursor: default;
}
/* status colors — iguais em ambos os modos (verde/amarelo/vermelho) */
.status--ok   { background: #4a7c30; }
.status--low  { background: #a07c10; }
.status--high { background: #932020; }

/* ── Trilha ── */
.sbr-track {
  position: relative;
  height: 100%;
  background: v-bind(trackBg);
  overflow: hidden;
}

/* Zona recomendada — animada */
.sbr-zone {
  position: absolute;
  top: 0; bottom: 0;
  transition: width 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.zone--ok   { background: v-bind(zoneOkBg); }
.zone--low  { background: v-bind(zoneLowBg); }
.zone--high { background: v-bind(zoneHighBg); }

/* Textos min/max nas bordas da zona */
.sbr-edge {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 9px;
  color: v-bind(edgeColor);
  z-index: 3;
  pointer-events: none;
  white-space: nowrap;
}
.sbr-edge--right { left: auto; }

/* Marcador vertical — animado */
.sbr-marker {
  position: absolute;
  top: 0; bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  z-index: 4;
  border-radius: 1px;
  transition: left 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.marker--ok   { background: v-bind(markerOk); }
.marker--low  { background: v-bind(markerLow); }
.marker--high { background: v-bind(markerHigh); }

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
.cur--ok   { color: v-bind(curOkColor);   background: v-bind(curOkBg);   }
.cur--low  { color: v-bind(curLowColor);  background: v-bind(curLowBg);  }
.cur--high { color: v-bind(curHighColor); background: v-bind(curHighBg); }

.sbr-tooltip { font-size: 12px; }
</style>
