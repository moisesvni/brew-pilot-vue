<template>
    <brew-pilot-dialog v-model="open" :title="meta.title" :icon="meta.icon" icon-color="primary" width="720px"
        :scrollable="true">
        <template #header-actions>
            <brew-pilot-button variant="flat" round dense icon="mdi-help-circle-outline"
                tooltip="Como este ajuste funciona" class="rsad-help-btn">
                <q-menu anchor="bottom right" self="top right" :offset="[0, 6]" class="rsad-help-menu">
                    <div class="rsad-help-panel">
                        <div class="rsad-help-title">Como o Brew Pilot ajusta este parametro</div>
                        <div class="rsad-help-copy">{{ meta.description }}</div>
                        <div class="rsad-help-copy q-mt-xs">{{ meta.caption }}</div>
                        <div class="rsad-help-copy q-mt-sm">{{ meta.footer }}</div>
                    </div>
                </q-menu>
            </brew-pilot-button>
        </template>
        <q-card-section class="q-pt-sm q-pb-xs">
            <div class="rsad-summary row q-col-gutter-sm">
                <div class="col-12 col-md-4">
                    <div class="rsad-stat-card">
                        <brew-pilot-label>Atual</brew-pilot-label>
                        <div class="rsad-stat-value">{{ formatValue(current) }}</div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="rsad-stat-card rsad-stat-card--accent">
                        <brew-pilot-label>Previa</brew-pilot-label>
                        <div class="rsad-stat-value">{{ formatValue(displayPreviewValue) }}</div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="rsad-stat-card">
                        <brew-pilot-label>Faixa do estilo</brew-pilot-label>
                        <div class="rsad-stat-range">{{ formatValue(min) }} ate {{ formatValue(max) }}</div>
                    </div>
                </div>
            </div>

        </q-card-section>

        <q-card-section class="q-pt-xs q-pb-sm">
            <div class="rsad-bar-caption">Atual na faixa do estilo</div>
            <recipe-style-range-bar :label="label" :current="current" :min="min" :max="max" :decimals="decimals"
                :unit="unit" :show-current-value="false" />

            <div class="rsad-bar-caption q-mt-sm">Previa apos aplicar</div>
            <recipe-style-range-bar :label="label" :current="plan?.achieved ?? targetValue" :min="min" :max="max"
                :decimals="decimals" :unit="unit" :show-current-value="false" />
        </q-card-section>

        <q-card-section class="q-pt-none q-pb-sm">
            <div class="row items-center no-wrap q-mb-sm">
                <div class="rsad-track-label-spacer" />
                <div class="col">
                    <div class="row items-center no-wrap">
                        <div class="rsad-track-side-spacer" :style="presetLeftStyle" />
                        <div class="row items-center no-wrap" :style="presetZoneStyle">
                            <div class="col-4 row justify-start">
                                <brew-pilot-button variant="outline" round dense icon="mdi-arrow-collapse-left"
                                    @click="setTarget(min)" size="10px" padding="5px 5px">
                                    <q-tooltip anchor="top middle" self="bottom middle" :offset="[5, 5]">
                                        Definir no minimo do estilo
                                    </q-tooltip>
                                </brew-pilot-button>
                            </div>
                            <div class="col-4 row justify-center">
                                <brew-pilot-button variant="outline" round dense icon="mdi-image-filter-center-focus"
                                    @click="setTarget(midpoint)" size="10px" padding="5px 5px">
                                    <q-tooltip anchor="top middle" self="bottom middle" :offset="[5, 5]">
                                        Definir no centro da faixa
                                    </q-tooltip>
                                </brew-pilot-button>
                            </div>
                            <div class="col-4 row justify-end">
                                <brew-pilot-button variant="outline" round dense icon="mdi-arrow-collapse-right"
                                    @click="setTarget(max)" size="10px" padding="5px 5px">
                                    <q-tooltip anchor="top middle" self="bottom middle" :offset="[5, 5]">
                                        Definir no maximo do estilo
                                    </q-tooltip>
                                </brew-pilot-button>
                            </div>
                        </div>
                        <div class="rsad-track-side-spacer" :style="presetRightStyle" />
                    </div>
                </div>
            </div>
            <div class="row items-center q-col-gutter-sm q-mb-sm">
                <div class="col-12 col-md">
                    <div class="rsad-slider-shell" :class="`rsad-slider-shell--${previewStatus}`">
                        <div class="rsad-slider-bound rsad-slider-bound--min">{{ formatValue(sliderMin) }}</div>
                        <q-slider label :label-value="formatValue(targetValue)" v-model="targetValue" :min="sliderMin" :max="sliderMax" :step="step"
                           markers :color="sliderColor" track-color="grey-4"  />
                        <div class="rsad-slider-bound rsad-slider-bound--max">{{ formatValue(sliderMax) }}</div>
                    </div>
                </div>
                <div class="col-12 col-md-auto">
                    <brew-pilot-input v-model.number="displayTargetValue" type="number" :step="step" :min="sliderMin"
                        :max="sliderMax" :label="`${label} alvo`" :suffix="unit?.trim()" class="rsad-input" />
                </div>
            </div>

            <div class="rsad-feedback" :class="{ 'rsad-feedback--ok': previewInsideStyle }">
                <q-icon :name="previewInsideStyle ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'"
                    size="16px" />
                <span>
                    {{ previewInsideStyle
                        ? 'A previa fica dentro da faixa do estilo.'
                        : 'A previa ainda fica fora da faixa do estilo. Ajuste o alvo ou revise os ingredientes da receita.'
                    }}
                </span>
            </div>
        </q-card-section>

        <q-card-section class="q-pt-xs">
            <div class="rsad-driver-header">
                <div class="rsad-driver-title">{{ plan?.ingredientLabel ?? meta.ingredientLabel }} usados neste ajuste</div>
                <div class="rsad-driver-subtitle">Os itens abaixo sao escalados proporcionalmente para preservar o
                    perfil atual
                    da receita.</div>
            </div>

            <q-list bordered separator class="rsad-driver-list">
                <q-item v-for="ingredient in plan?.ingredients ?? []" :key="ingredient.id" class="rsad-driver-item">
                    <q-item-section>
                        <q-item-label class="rsad-driver-name">{{ ingredient.name }}</q-item-label>
                        <q-item-label caption class="rsad-driver-caption">
                            {{ ingredient.kind === 'hop' ? 'Contribui para o amargor total' : 'Contribui para a carga fermentavel e cor' }}
                        </q-item-label>
                        <div class="rsad-driver-preview q-mt-xs">
                            <div class="rsad-driver-preview-line">
                                <span class="rsad-driver-preview-label">Atual</span>
                                <strong>{{ formatIngredientAmount(ingredient.amount, ingredient.unit) }}</strong>
                            </div>
                            <div class="rsad-driver-preview-arrow">→</div>
                            <div class="rsad-driver-preview-line rsad-driver-preview-line--accent"
                                :class="{ 'rsad-driver-preview-line--negative': ingredient.previewAmount < ingredient.amount }">
                                <span class="rsad-driver-preview-label">Previa</span>
                                <strong v-if="showPreviewAmount">{{ formatIngredientAmount(ingredient.previewAmount, ingredient.unit) }}</strong>
                            </div>
                            <q-icon v-if="showPreviewAmount" 
                                :name="ingredient.previewAmount >= ingredient.amount ? 'mdi-weight' : 'mdi-weight'"
                                size="15px"
                                :class="ingredient.previewAmount >= ingredient.amount ? 'rsad-driver-preview-icon' : 'rsad-driver-preview-icon rsad-driver-preview-icon--negative'" />
                            <div v-if="showPreviewAmount" class="rsad-driver-preview-delta"
                                :class="{ 'rsad-driver-preview-delta--negative': ingredient.previewAmount < ingredient.amount }">
                                {{ formatIngredientDelta(ingredient.previewAmount - ingredient.amount, ingredient.unit) }}
                            </div>
                        </div>
                    </q-item-section>
                    <q-item-section side class="items-end">
                        <div class="rsad-driver-amount">{{ formatIngredientAmount(ingredient.amount, ingredient.unit) }}</div>
                        <div class="rsad-driver-pct">{{ ingredient.contributionPct.toFixed(1) }}%</div>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card-section>

        <template #footer>
            <q-card-actions class="q-px-md q-py-sm row items-center">
                <div class="rsad-footer-copy">{{ meta.footer }}</div>
                <q-space />
                <brew-pilot-button variant="outline" no-caps label="Cancelar" @click="open = false" />
                <brew-pilot-button variant="filled" color="primary" no-caps icon="mdi-check" label="Aplicar na receita"
                    class="q-ml-sm" :disable="!plan?.adjustable" @click="apply" />
            </q-card-actions>
        </template>
    </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import type { StyleAdjustmentIngredient, StyleAdjustmentMetric } from '@/pages/recipes/utils/styleAdjustments'
import { getStyleAdjustmentPlan } from '@/pages/recipes/utils/styleAdjustments'
import { getStyleMetricStatus, getStyleMetricThresholds } from '@/pages/recipes/utils/styleMetricStatus'
import RecipeStyleRangeBar from '../../RecipeStyleRangeBar.vue'

const props = defineProps<{
    modelValue: boolean
    metric: StyleAdjustmentMetric
    label: string
    current: number
    min: number
    max: number
    decimals: number
    unit?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const metricMeta = {
    og: {
        title: 'Ajustar Gravidade Original',
        icon: 'mdi-scale',
        description: 'Escala os fermentaveis ja presentes para aproximar a gravidade original do alvo escolhido.',
        caption: 'Use este ajuste quando quiser subir ou descer corpo e potencial alcoolico mantendo a proporcao atual dos maltes.',
        ingredientLabel: 'Fermentaveis',
        footer: 'OG ajusta a carga total de fermentaveis. ABV e BU/GU reagem automaticamente depois da aplicacao.',
    },
    ibu: {
        title: 'Ajustar Amargor',
        icon: 'mdi-hops',
        description: 'Escala os lupulos com contribuicao de IBU para aproximar o amargor ao alvo escolhido.',
        caption: 'O ajuste preserva o perfil relativo dos lupulos ja usados na fervura, first wort, whirlpool e hopstand.',
        ingredientLabel: 'Lupulos',
        footer: 'Dry hop nao entra neste calculo. BU/GU reage automaticamente quando o IBU muda.',
    },
    ebc: {
        title: 'Ajustar Cor',
        icon: 'mdi-palette-outline',
        description: 'Escala os fermentaveis da receita para aproximar a cor ao alvo escolhido.',
        caption: 'A cor e recalculada por Morey. Isso tambem afeta OG e, por consequencia, ABV e BU/GU.',
        ingredientLabel: 'Fermentaveis',
        footer: 'Use este ajuste para explorar a faixa visual do estilo sem sair do padrao de ingredientes atual.',
    },
} as const

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe)

const open = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
})

const meta = computed(() => metricMeta[props.metric])
const targetValue = ref(0)
const hasPendingAdjustment = ref(false)
const hasTouchedTarget = ref(false)
const syncingDialogState = ref(false)

const step = computed(() => {
    if (props.metric === 'og') return 0.001
    if (props.metric === 'ibu') return 1
    return 1
})

const midpoint = computed(() => round((props.min + props.max) / 2, props.decimals))

const rangePad = computed(() => (props.max - props.min) * 0.3 || 0.1)

const barScaleMin = computed(() => props.min - rangePad.value)

const barScaleRange = computed(() => (props.max - props.min) + rangePad.value * 2)

const okZoneStartPct = computed(() => ((props.min - barScaleMin.value) / barScaleRange.value) * 100)

const okZoneEndPct = computed(() => ((props.max - barScaleMin.value) / barScaleRange.value) * 100)

const presetLeftStyle = computed(() => ({
    width: `${Math.max(okZoneStartPct.value, 0)}%`,
}))

const presetZoneStyle = computed(() => ({
    width: `${Math.max(okZoneEndPct.value - okZoneStartPct.value, 0)}%`,
}))

const presetRightStyle = computed(() => ({
    width: `${Math.max(100 - okZoneEndPct.value, 0)}%`,
}))

const sliderMin = computed(() => getSliderBounds().min)

const sliderMax = computed(() => getSliderBounds().max)

const plan = computed(() => {
    if (!recipe.value) return null
    return getStyleAdjustmentPlan(recipe.value, props.metric, effectiveTargetValue.value)
})

const effectiveTargetValue = computed(() => hasPendingAdjustment.value ? targetValue.value : props.current)

const previewInsideStyle = computed(() => {
    const achieved = plan.value?.achieved ?? targetValue.value
    return achieved >= props.min && achieved <= props.max
})

const previewStatus = computed(() => getStyleMetricStatus(plan.value?.achieved ?? targetValue.value, props.min, props.max))

const displayPreviewValue = computed(() => {
    if (!hasTouchedTarget.value) return 0
    return plan.value?.achieved ?? props.current
})

const displayTargetValue = computed({
    get: () => hasTouchedTarget.value ? targetValue.value : 0,
    set: value => {
        if (value == null || Number.isNaN(value) || value <= 0) {
            syncingDialogState.value = true
            targetValue.value = round(clamp(props.current, sliderMin.value, sliderMax.value), props.decimals)
            hasPendingAdjustment.value = false
            hasTouchedTarget.value = false
            syncingDialogState.value = false
            return
        }

        syncingDialogState.value = true
        targetValue.value = round(clamp(value, sliderMin.value, sliderMax.value), props.decimals)
        hasTouchedTarget.value = true
        hasPendingAdjustment.value = !isSameValue(targetValue.value, props.current)
        syncingDialogState.value = false
    },
})

const sliderColor = computed(() => {
    if (previewStatus.value === 'ok') return 'positive'
    if (previewStatus.value === 'warning') return 'warning'
    return 'negative'
})

const showPreviewAmount = computed(() => hasPendingAdjustment.value && targetValue.value > 0)

const showIngredientPreview = computed(() => {
    if (!hasPendingAdjustment.value || !plan.value?.ingredients.length) return false

    return plan.value.ingredients.some(ingredient => {
        const delta = Math.abs(ingredient.previewAmount - ingredient.amount)
        return delta > (ingredient.unit === 'g' ? 0.49 : 0.0005)
    })
})

watch(
    () => [props.modelValue, props.current, props.metric],
    ([isOpen]) => {
        if (!isOpen) {
            resetFormState()
            return
        }

        syncingDialogState.value = true
        targetValue.value = round(clamp(props.current, sliderMin.value, sliderMax.value), props.decimals)
        hasPendingAdjustment.value = false
        hasTouchedTarget.value = false
        syncingDialogState.value = false
    },
    { immediate: true },
)

watch(targetValue, value => {
    if (value == null || Number.isNaN(value)) return

    if (syncingDialogState.value) return

    const clampedValue = round(clamp(value, sliderMin.value, sliderMax.value), props.decimals)
    if (clampedValue !== value) {
        targetValue.value = clampedValue
        return
    }

    if (!open.value) return
    hasTouchedTarget.value = true
    hasPendingAdjustment.value = !isSameValue(clampedValue, props.current)
})

function setTarget(value: number) {
    targetValue.value = round(clamp(value, sliderMin.value, sliderMax.value), props.decimals)
}

function apply() {
    store.applyStyleMetricTarget(props.metric, targetValue.value)
    resetFormState()
    open.value = false
}

function resetFormState() {
    targetValue.value = 0
    hasPendingAdjustment.value = false
    hasTouchedTarget.value = false
}

function isSameValue(left: number, right: number): boolean {
    return Math.abs(left - right) < Math.max(step.value / 2, 0.0005)
}

function formatValue(value: number): string {
    return `${value.toFixed(props.decimals)}${props.unit ?? ''}`
}

function formatIngredientAmount(amount: number, unit: StyleAdjustmentIngredient['unit']): string {
    if (unit === 'g') {
        return amount >= 1000 ? `${(amount / 1000).toFixed(2)} kg` : `${amount.toFixed(0)} g`
    }

    return amount >= 1 ? `${amount.toFixed(3)} kg` : `${(amount * 1000).toFixed(0)} g`
}

function formatIngredientDelta(amount: number, unit: StyleAdjustmentIngredient['unit']): string {
    const prefix = amount > 0 ? '+' : ''

    if (unit === 'g') {
        return amount >= 1000 || amount <= -1000
            ? `${prefix}${(amount / 1000).toFixed(2)} kg`
            : `${prefix}${amount.toFixed(0)} g`
    }

    return amount >= 1 || amount <= -1
        ? `${prefix}${amount.toFixed(3)} kg`
        : `${prefix}${(amount * 1000).toFixed(0)} g`
}

function defaultPad(metric: StyleAdjustmentMetric): number {
    if (metric === 'og') return 0.02
    if (metric === 'ibu') return 10
    return 6
}

function getSliderBounds(): { min: number; max: number } {
    const range = Math.max(props.max - props.min, 0)
    const thresholds = getStyleMetricThresholds(props.min, props.max)
    const softMin = thresholds.warningMin
    const softMax = thresholds.warningMax
    const hardPad = getSliderHardPad(props.metric, range)
    const lowerFloor = props.metric === 'og' ? 1 : 0

    const min = round(Math.max(lowerFloor, Math.min(props.current, softMin) - hardPad), props.decimals)
    const max = round(Math.max(props.current, softMax) + hardPad, props.decimals)

    return { min, max }
}

function getSliderHardPad(metric: StyleAdjustmentMetric, range: number): number {
    if (metric === 'og') return Math.max(0.004, range * 0.35)
    if (metric === 'ibu') return Math.max(6, Math.min(10, range * 0.5))
    return Math.max(4, Math.min(7, range * 0.45))
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

function round(value: number, decimals: number): number {
    return Number(value.toFixed(decimals))
}
</script>

<style scoped>
.rsad-summary {
    align-items: stretch;
}

.rsad-help-btn {
    color: var(--q-primary) !important;
}

.rsad-stat-card {
    height: 100%;
    border: 1px solid var(--bp-card-border);
    border-radius: 14px;
    background: color-mix(in srgb, var(--bp-card-bg) 88%, transparent);
    padding: 12px 14px;
}

.rsad-stat-card--accent {
    border-color: color-mix(in srgb, var(--q-primary) 55%, var(--bp-card-border));
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--q-primary) 18%, transparent);
}

.rsad-stat-label {
    color: var(--bp-text-secondary);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.rsad-stat-value,
.rsad-stat-range {
    color: var(--bp-text-primary);
    font-size: 20px;
    font-weight: 700;
    margin-top: 6px;
}

.rsad-stat-range {
    font-size: 15px;
}

.rsad-help-panel {
    width: min(320px, 82vw);
    padding: 14px;
    background: var(--bp-card-bg);
}

.rsad-help-title {
    color: var(--bp-text-primary);
    font-size: 13px;
    font-weight: 700;
}

.rsad-help-copy {
    color: var(--bp-text-secondary);
    font-size: 12px;
    line-height: 1.45;
    margin-top: 6px;
}

.rsad-bar-caption {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--bp-text-secondary);
    margin-bottom: 6px;
}

.rsad-input {
    min-width: 150px;
}

.rsad-track-label-spacer {
    width: 42px;
    min-width: 42px;
}

.rsad-track-side-spacer {
    flex: 0 0 auto;
}

.rsad-slider-shell {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
}

.rsad-slider {
    margin: 0;
}

.rsad-slider-bound {
    min-width: 54px;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    color: var(--bp-text-secondary);
    background: color-mix(in srgb, var(--bp-card-bg) 90%, transparent);
    text-align: center;
}

.rsad-slider-shell--ok .rsad-slider-bound {
    color: #1f5f24;
}

.rsad-slider-shell--warning .rsad-slider-bound {
    color: #7a5600;
}

.rsad-slider-shell--low .rsad-slider-bound,
.rsad-slider-shell--high .rsad-slider-bound {
    color: #8b1a1a;
}

.rsad-slider :deep(.q-slider__thumb) {
    width: 22px;
    height: 22px;
    border-radius: 8px;
    background: var(--q-primary);
    box-shadow: 0 4px 12px rgba(97, 57, 13, 0.24);
}


.rsad-slider :deep(.q-slider__track-container) {
    height: 6px;
}

.rsad-slider :deep(.q-slider__track) {
    opacity: 0.26;
}

.rsad-slider :deep(.q-slider__selection) {
    border-radius: 999px;
}

.rsad-feedback {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 10px;
    padding: 9px 12px;
    font-size: 12px;
    color: #b85c38;
    background: color-mix(in srgb, #b85c38 9%, transparent);
}

.rsad-feedback--ok {
    color: #2f7a39;
    background: color-mix(in srgb, #2f7a39 10%, transparent);
}

.rsad-driver-header {
    margin-bottom: 10px;
}

.rsad-driver-title {
    color: var(--bp-text-primary);
    font-size: 13px;
    font-weight: 700;
}

.rsad-driver-subtitle {
    color: var(--bp-text-secondary);
    font-size: 12px;
    margin-top: 4px;
}

.rsad-driver-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.rsad-driver-preview-line {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--bp-card-bg) 92%, transparent);
    color: var(--bp-text-primary);
    font-size: 11px;
}

.rsad-driver-preview-line--accent {
    background: color-mix(in srgb, var(--q-primary) 12%, transparent);
}

.rsad-driver-preview-line--negative {
    background: color-mix(in srgb, #8b1a1a 10%, transparent);
}

.rsad-driver-preview-label {
    color: var(--bp-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 10px;
}

.rsad-driver-preview-arrow {
    color: var(--bp-text-secondary);
    font-size: 12px;
}

.rsad-driver-preview-delta {
    color: #2f7a39;
    font-size: 11px;
    font-weight: 700;
}

.rsad-driver-preview-icon {
    color: #2f7a39;
}

.rsad-driver-preview-icon--negative {
    color: #8b1a1a;
}

.rsad-driver-preview-delta--negative {
    color: #8b1a1a;
}

.rsad-driver-amount {
    color: var(--bp-text-primary);
    font-size: 12px;
    font-weight: 600;
}

.rsad-driver-pct {
    color: var(--q-primary);
    font-size: 11px;
    font-weight: 700;
}

.rsad-footer-copy {
    max-width: 380px;
    color: var(--bp-text-secondary);
    font-size: 12px;
    line-height: 1.45;
}

@media (max-width: 767px) {
    .rsad-footer-copy {
        max-width: 100%;
        margin-bottom: 10px;
    }
}
</style>