<template>
    <div class="sbr-row" :class="{ 'sbr-row--no-label': !showMetricLabel }">
        <div v-if="showMetricLabel" class="sbr-label" :class="`status--${status}`">
            {{ label }}
            <q-tooltip anchor="center right" self="center left" :offset="[6, 0]" class="sbr-tooltip">
                <div class="text-weight-bold" style="font-size: 12px">{{ labelInfo.name }}</div>
                <div style="font-size: 11px; opacity: 0.72; margin-top: 2px">{{ labelInfo.desc }}</div>
            </q-tooltip>
        </div>
        <div class="sbr-track">
            <div class="sbr-zone-base" />
            <div class="sbr-zone sbr-zone--warning" :style="leftWarningZoneStyle" />
            <div class="sbr-zone sbr-zone--ok" :style="okZoneStyle" />
            <div class="sbr-zone sbr-zone--warning" :style="rightWarningZoneStyle" />

            <span class="sbr-edge" :style="{ left: `calc(${minPct}% + 5px)` }">{{ fmtMin }}</span>
            <span class="sbr-edge sbr-edge--right" :style="{ right: `calc(${100 - maxPct}% + 5px)` }">{{ fmtMax
                }}</span>
            <div class="sbr-marker" :class="`marker--${status}`" :style="{ left: `${clampedPct}%` }" />
        </div>
        <div v-if="showCurrentValue" class="sbr-cur" :class="`cur--${status}`">{{ fmtCur }}</div>
        <div v-if="hasAction" class="sbr-action-wrap" :class="[
            `status--${status}`,
            { 'sbr-action-wrap--interactive': adjustable, 'sbr-action-wrap--disabled': !adjustable }]" @click="requestAdjust">
            <q-icon :name="resolvedActionIcon" size="14px" />
            <q-tooltip v-if="actionTooltip" anchor="center left" self="center right" :offset="[6, 0]"
                class="sbr-tooltip">
                <div class="text-weight-bold" style="font-size: 12px">{{ actionLabel }}</div>
                <div style="font-size: 11px; opacity: 0.72; margin-top: 2px">{{ actionHint }}</div>
            </q-tooltip>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { getStyleMetricStatus, getStyleMetricThresholds } from '@/pages/recipes/utils/styleMetricStatus'

const props = withDefaults(defineProps<{
    label: string
    current: number
    min: number
    max: number
    decimals?: number
    unit?: string
    adjustable?: boolean
    actionLabel?: string
    actionHint?: string
    actionIcon?: string
    showCurrentValue?: boolean
    showMetricLabel?: boolean
}>(), {
    adjustable: false,
    showCurrentValue: true,
    showMetricLabel: true,
})

const emit = defineEmits<{
    (e: 'adjust'): void
}>()

const $q = useQuasar()
const dark = computed(() => $q.dark.isActive)
const hasAction = computed(() => Boolean(props.actionLabel))
const actionTooltip = computed(() => props.actionLabel || props.actionHint)
const resolvedActionIcon = computed(() => props.actionIcon ?? (props.adjustable ? 'mdi-tune-variant' : 'mdi-help-circle-outline'))

const tooltipMap: Record<string, { name: string; desc: string }> = {
    ABV: { name: 'Alcohol By Volume (%)', desc: 'Teor alcoolico da cerveja' },
    OG: { name: 'Original Gravity', desc: 'Densidade do mosto antes da fermentacao' },
    FG: { name: 'Final Gravity', desc: 'Densidade residual apos fermentacao' },
    EBC: { name: 'European Brewery Convention', desc: 'Escala de cor da cerveja' },
    IBU: { name: 'International Bitterness Units', desc: 'Amargor percebido da cerveja' },
    'BU/GU': { name: 'Bitterness / Gravity Ratio', desc: 'Relacao entre amargor e densidade da receita' },
}

const labelInfo = computed(() => tooltipMap[props.label] ?? { name: props.label, desc: '' })

const pad = computed(() => (props.max - props.min) * 0.3 || 0.1)
const scaleMin = computed(() => props.min - pad.value)
const scaleRange = computed(() => (props.max - props.min) + pad.value * 2)

const thresholds = computed(() => getStyleMetricThresholds(props.min, props.max))
const minPct = computed(() => ((props.min - scaleMin.value) / scaleRange.value) * 100)
const maxPct = computed(() => ((props.max - scaleMin.value) / scaleRange.value) * 100)
const warningMinPct = computed(() => ((thresholds.value.warningMin - scaleMin.value) / scaleRange.value) * 100)
const warningMaxPct = computed(() => ((thresholds.value.warningMax - scaleMin.value) / scaleRange.value) * 100)
const curPct = computed(() => ((props.current - scaleMin.value) / scaleRange.value) * 100)
const clampedPct = computed(() => Math.min(Math.max(curPct.value, 1), 99))

const status = computed(() => getStyleMetricStatus(props.current, props.min, props.max))

const ready = ref(false)
onMounted(() => requestAnimationFrame(() => { ready.value = true }))

const leftWarningZoneStyle = computed(() => ({
    left: `${warningMinPct.value}%`,
    width: ready.value ? `${Math.max(minPct.value - warningMinPct.value, 0)}%` : '0%',
}))

const okZoneStyle = computed(() => ({
    left: `${minPct.value}%`,
    width: ready.value ? `${Math.max(maxPct.value - minPct.value, 0)}%` : '0%',
}))

const rightWarningZoneStyle = computed(() => ({
    left: `${maxPct.value}%`,
    width: ready.value ? `${Math.max(warningMaxPct.value - maxPct.value, 0)}%` : '0%',
}))

const decimals = computed(() => props.decimals ?? 0)
const unit = computed(() => props.unit ?? '')
const fmt = (value: number) => value.toFixed(decimals.value)
const fmtMin = computed(() => fmt(props.min) + unit.value)
const fmtMax = computed(() => fmt(props.max) + unit.value)
const fmtCur = computed(() => fmt(props.current) + unit.value)

function requestAdjust() {
    if (!props.adjustable) return
    emit('adjust')
}

const showMetricLabel = computed(() => props.showMetricLabel)

const trackBg = computed(() => dark.value ? '#2a1e1b' : '#f3e4dd')
const edgeColor = computed(() => dark.value ? 'rgba(255,243,224,.78)' : '#5d4037')

const zoneWarningBg = computed(() => dark.value ? 'rgba(240,194,77,.70)' : 'rgba(240,194,45,.60)')
const zoneOkBg = computed(() => dark.value ? '#3c7d48' : '#82b56b')

const labelOkBg = computed(() => dark.value ? '#3f8c4f' : '#58a56b')
const labelWarningBg = computed(() => dark.value ? '#b88428' : '#c7963a')
const labelDangerBg = computed(() => dark.value ? '#b42323' : '#cf5757')
const labelTextOk = computed(() => dark.value ? '#f3fff1' : '#f4fff2')
const labelTextWarning = computed(() => dark.value ? '#fff6da' : '#fff9eb')
const labelTextDanger = computed(() => dark.value ? '#fff0f0' : '#fff5f5')

const markerOk = computed(() => dark.value ? '#79d98d' : '#24783b')
const markerWarning = computed(() => dark.value ? '#f0c24d' : '#b8821b')
const markerHigh = computed(() => dark.value ? '#ff6b6b' : '#c62828')

const curOkColor = computed(() => dark.value ? '#9be6ad' : '#1f6d35')
const curOkBg = computed(() => dark.value ? 'rgba(60,125,72,.26)' : 'rgba(130,181,107,.20)')
const curWarningColor = computed(() => dark.value ? '#f4d27a' : '#9a6a12')
const curWarningBg = computed(() => dark.value ? 'rgba(240,194,77,.18)' : 'rgba(240,194,77,.16)')
const curHighColor = computed(() => dark.value ? '#ff8e8e' : '#b42323')
const curHighBg = computed(() => dark.value ? 'rgba(198,40,40,.20)' : 'rgba(198,40,40,.12)')

const actionNeutralBg = computed(() => dark.value ? 'rgba(84,69,61,.24)' : 'rgba(120,96,78,.08)')
const actionNeutralBorder = computed(() => dark.value ? 'rgba(198,173,148,.18)' : 'rgba(132,103,73,.18)')
const actionNeutralText = computed(() => dark.value ? 'rgba(231,212,188,.72)' : 'rgba(112,84,56,.72)')
const actionHover = computed(() => dark.value ? 'rgba(173,128,67,.26)' : 'rgba(193,113,14,.14)')
const actionDisabledBg = computed(() => dark.value ? 'rgba(84,69,61,.12)' : 'rgba(120,96,78,.05)')
const actionDisabledBorder = computed(() => dark.value ? 'rgba(198,173,148,.10)' : 'rgba(132,103,73,.10)')
const actionDisabledText = computed(() => dark.value ? 'rgba(231,212,188,.28)' : 'rgba(112,84,56,.28)')
const actionOkBg = computed(() => dark.value ? 'rgba(60,125,72,.22)' : 'rgba(130,181,107,.18)')
const actionOkBorder = computed(() => dark.value ? 'rgba(121,217,141,.28)' : 'rgba(36,120,59,.18)')
const actionOkText = computed(() => dark.value ? '#8fe0a1' : '#24783b')
const actionWarningBg = computed(() => dark.value ? 'rgba(240,194,77,.16)' : 'rgba(240,194,77,.14)')
const actionWarningBorder = computed(() => dark.value ? 'rgba(240,194,77,.28)' : 'rgba(184,130,27,.18)')
const actionWarningText = computed(() => dark.value ? '#f0c24d' : '#9a6a12')
const actionDangerBg = computed(() => dark.value ? 'rgba(198,40,40,.22)' : 'rgba(198,40,40,.12)')
const actionDangerBorder = computed(() => dark.value ? 'rgba(255,107,107,.28)' : 'rgba(180,35,35,.18)')
const actionDangerText = computed(() => dark.value ? '#ff7b7b' : '#b42323')
</script>

<style scoped>
.sbr-row {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) 66px 28px;
    column-gap: 4px;
    height: 26px;
    margin-bottom: 2px;
    align-items: center;
}

.sbr-row:has(.sbr-cur):not(:has(.sbr-action-wrap)) {
    grid-template-columns: 42px minmax(0, 1fr) 66px;
}

.sbr-row:not(:has(.sbr-cur)):has(.sbr-action-wrap) {
    grid-template-columns: 42px minmax(0, 1fr) 28px;
}

.sbr-row:not(:has(.sbr-cur)):not(:has(.sbr-action-wrap)) {
    grid-template-columns: 42px minmax(0, 1fr);
}

.sbr-row--no-label {
    grid-template-columns: minmax(0, 1fr) 66px 28px;
}

.sbr-row--no-label:has(.sbr-cur):not(:has(.sbr-action-wrap)) {
    grid-template-columns: minmax(0, 1fr) 66px;
}

.sbr-row--no-label:not(:has(.sbr-cur)):has(.sbr-action-wrap) {
    grid-template-columns: minmax(0, 1fr) 28px;
}

.sbr-row--no-label:not(:has(.sbr-cur)):not(:has(.sbr-action-wrap)) {
    grid-template-columns: minmax(0, 1fr);
}

.sbr-label {
    font-size: 10px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    letter-spacing: .04em;
    border-radius: 3px 0 0 3px;
    cursor: default;
}

.sbr-label.status--ok {
    background: v-bind(labelOkBg);
    color: v-bind(labelTextOk);
}

.sbr-label.status--warning {
    background: v-bind(labelWarningBg);
    color: v-bind(labelTextWarning);
}

.sbr-label.status--low,
.sbr-label.status--high {
    background: v-bind(labelDangerBg);
    color: v-bind(labelTextDanger);
}

.sbr-track {
    position: relative;
    height: 100%;
    background: v-bind(trackBg);
    overflow: hidden;
    border-radius: 0;
}

.sbr-zone-base {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(180, 35, 35, .34), rgba(180, 35, 35, .28));
}

.sbr-zone {
    position: absolute;
    top: 0;
    bottom: 0;
    transition: width .55s cubic-bezier(0.22, 1, 0.36, 1);
}

.sbr-zone--warning {
    background: v-bind(zoneWarningBg);
}

.sbr-zone--ok {
    background: v-bind(zoneOkBg);
}

.sbr-edge {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    font-weight: 700;
    color: v-bind(edgeColor);
    z-index: 3;
    pointer-events: none;
    white-space: nowrap;
}

.sbr-edge--right {
    left: auto;
}

.sbr-marker {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    transform: translateX(-50%);
    z-index: 4;
    border-radius: 1px;
    transition: left .55s cubic-bezier(0.22, 1, 0.36, 1);
}

.marker--ok {
    background: v-bind(markerOk);
}

.marker--warning {
    background: v-bind(markerWarning);
}

.marker--low,
.marker--high {
    background: v-bind(markerHigh);
}

.sbr-cur {
    font-size: 10px;
    font-weight: 700;
    height: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 5px;
    white-space: nowrap;
    border-radius: 0 3px 3px 0;
}

.cur--ok {
    color: v-bind(curOkColor);
    background: v-bind(curOkBg);
}

.cur--warning {
    color: v-bind(curWarningColor);
    background: v-bind(curWarningBg);
}

.cur--low,
.cur--high {
    color: v-bind(curHighColor);
    background: v-bind(curHighBg);
}

.sbr-action-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    width: 24px;
    border-radius: 999px;
    border: 1px solid v-bind(actionNeutralBorder);
    background: v-bind(actionNeutralBg);
    color: v-bind(actionNeutralText);
    transition: background-color .18s ease, color .18s ease, border-color .18s ease, transform .18s ease;
}

.sbr-action-wrap--interactive {
    cursor: pointer;
}

.sbr-action-wrap--interactive:hover {
    background: v-bind(actionHover);
    transform: translateY(-1px);
}

.sbr-action-wrap.status--ok:not(.sbr-action-wrap--disabled) {
    background: v-bind(actionOkBg);
    border-color: v-bind(actionOkBorder);
    color: v-bind(actionOkText);
}

.sbr-action-wrap.status--warning:not(.sbr-action-wrap--disabled) {
    background: v-bind(actionWarningBg);
    border-color: v-bind(actionWarningBorder);
    color: v-bind(actionWarningText);
}

.sbr-action-wrap.status--low:not(.sbr-action-wrap--disabled),
.sbr-action-wrap.status--high:not(.sbr-action-wrap--disabled) {
    background: v-bind(actionDangerBg);
    border-color: v-bind(actionDangerBorder);
    color: v-bind(actionDangerText);
}

.sbr-action-wrap--disabled {
    background: v-bind(actionDisabledBg);
    border-color: v-bind(actionDisabledBorder);
    color: v-bind(actionDisabledText);
}

.sbr-tooltip {
    font-size: 12px;
}
</style>
