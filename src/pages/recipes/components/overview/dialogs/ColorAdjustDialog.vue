<template>
  <brew-pilot-dialog
    v-model="open"
    title="Ajustar Cor da Receita"
    icon="mdi-palette-outline"
    icon-color="primary"
    width="820px"
    scrollable
    persistent
  >
    <template #header-actions>
      <brew-pilot-button
        variant="flat"
        round
        dense
        icon="mdi-help-circle-outline"
        tooltip="Como este ajuste funciona"
        class="cad-help-btn"
      >
        <q-menu anchor="bottom right" self="top right" :offset="[0, 6]" class="cad-help-menu">
          <div class="cad-help-panel">
            <div class="cad-help-title">O que este ajuste pode fazer</div>
            <div class="cad-help-copy">
              O Brew Pilot recalcula a cor pela formula de Morey e escala somente os fermentaveis que voce deixar marcados.
              Os fermentaveis desmarcados ficam congelados exatamente como estao.
            </div>
            <div class="cad-help-copy q-mt-xs">
              A faixa do slider usa o minimo e o maximo do estilo com uma margem de 10 EBC para cada lado, para facilitar exploracao sem perder referencia.
            </div>
            <div class="cad-help-copy q-mt-sm">
              Ajustar cor altera a carga de graos selecionada. Isso pode impactar OG, ABV e BU/GU depois da aplicacao.
            </div>
          </div>
        </q-menu>
      </brew-pilot-button>
    </template>

    <q-card-section class="q-pt-sm q-pb-xs">
      <div class="cad-summary row q-col-gutter-sm">
        <div class="col-12 col-md-3">
          <div class="cad-stat-card">
            <brew-pilot-label>Atual</brew-pilot-label>
            <div class="cad-stat-value">{{ formatEbc(currentEbc) }}</div>
            <div class="cad-stat-beer">
              <q-icon name="mdi-beer" size="44px" :style="{ color: ebcToHex(currentEbc) }" />
            </div>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="cad-stat-card cad-stat-card--accent" :class="previewInsideStyle ? 'cad-stat-card--ok' : 'cad-stat-card--danger'">
            <brew-pilot-label>Previa</brew-pilot-label>
            <div class="cad-stat-value cad-stat-value--with-trend">
              <span>{{ formatEbc(colorAchieved) }}</span>
              <q-icon
                :name="previewTrendIcon"
                size="18px"
                class="cad-trend-icon"
                :class="previewTrendClass"
              />
            </div>
            <div class="cad-stat-beer">
              <q-icon name="mdi-beer" size="44px" :style="{ color: ebcToHex(colorAchieved) }" />
            </div>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="cad-stat-card" :class="previewInsideStyle ? 'cad-stat-card--ok' : 'cad-stat-card--danger'">
            <brew-pilot-label>Status</brew-pilot-label>
            <div class="cad-status-row">
              <q-icon :name="previewInsideStyle ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'" size="18px" />
              <span>{{ previewInsideStyle ? 'Dentro do estilo' : 'Fora do estilo' }}</span>
            </div>
            <div class="cad-stat-caption">
              {{ selectedCount }} fermentavel{{ selectedCount === 1 ? '' : 'eis' }} participando do ajuste.
            </div>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="cad-stat-card" :class="impactDelta >= 0 ? 'cad-stat-card--warm' : 'cad-stat-card--cool'">
            <brew-pilot-label>Impacto</brew-pilot-label>
            <div class="cad-stat-value">{{ formatSignedAmount(colorWeightDelta) }}</div>
            <div class="cad-stat-caption">
              {{ impactDirectionText }} na carga selecionada
            </div>
            <div class="cad-stat-caption q-mt-xs">
              Escala aplicada: {{ colorScaleFactor.toFixed(2) }}x sobre {{ formatAmount(selectedWeight) }}
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-xs q-pb-sm">
      <div class="cad-bar-caption">Previa na faixa do estilo</div>
      <recipe-style-range-bar
        label="EBC"
        :current="colorAchieved"
        :min="styleMin"
        :max="styleMax"
        :decimals="1"
        unit=" EBC"
        :show-current-value="false"
        :show-metric-label="false"
      />

    </q-card-section>

    <q-card-section class="q-pt-none q-pb-sm">
      <div class="row items-center q-col-gutter-sm q-mb-sm">
        <div class="col-12 col-md">
          <div class="cad-slider-shell">
            <div class="cad-slider-bound">{{ formatEbc(sliderMin) }}</div>
            <q-slider
              v-model="colorTarget"
              :min="sliderMin"
              :max="sliderMax"
              :step="0.1"
              label
              :label-value="formatEbc(colorTarget)"
              color="primary"
              track-color="grey-4"
              markers
              class="col"
            />
            <div class="cad-slider-bound cad-slider-bound--right">{{ formatEbc(sliderMax) }}</div>
          </div>
        </div>
        <div class="col-12 col-md-auto">
          <brew-pilot-input
            v-model.number="colorTarget"
            type="number"
            :min="sliderMin"
            :max="sliderMax"
            :step="0.1"
            label="Cor alvo"
            suffix="EBC"
            class="cad-target-input"
          />
        </div>
      </div>

      <div class="cad-feedback" :class="previewInsideStyle ? 'cad-feedback--ok' : 'cad-feedback--danger'">
        <q-icon :name="feedbackIcon" size="16px" />
        <span>{{ feedbackText }}</span>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-xs">
      <div class="cad-list-header">
        <div class="cad-list-title">Fermentaveis usados neste ajuste</div>
        <div class="cad-list-subtitle">
          So os fermentaveis marcados sao redimensionados. Os demais permanecem travados e servem como referencia da receita atual.
        </div>
      </div>

      <q-list bordered separator class="cad-list">
        <q-item v-for="item in previewItems" :key="item.id" class="cad-item">
          <q-item-section side top>
            <q-checkbox v-model="colorSelected[item.index]" dense color="positive" />
          </q-item-section>

          <q-item-section avatar>
            <div class="cad-item-swatch" :style="{ background: ebcToHex(item.colorEbc) }" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="cad-item-name">{{ item.name }}</q-item-label>
            <q-item-label caption class="cad-item-caption">
              {{ item.currentPct.toFixed(1) }}% da carga atual · {{ item.colorEbc.toFixed(1) }} EBC
            </q-item-label>
            <div class="cad-item-preview q-mt-xs">
              <div class="cad-item-preview-line">
                <span class="cad-item-preview-label">Atual</span>
                <strong>{{ formatAmount(item.amount) }}</strong>
              </div>
              <div class="cad-item-preview-arrow">→</div>
              <div class="cad-item-preview-line" :class="item.selected ? 'cad-item-preview-line--active' : 'cad-item-preview-line--locked'">
                <span class="cad-item-preview-label">Previa</span>
                <strong>{{ formatAmount(item.previewAmount) }}</strong>
              </div>
              <q-icon name="mdi-weight" size="14px" class="cad-item-delta-icon"
                :class="item.delta >= 0 ? 'cad-item-delta-icon--positive' : 'cad-item-delta-icon--negative'" />
              <div class="cad-item-delta" :class="item.delta >= 0 ? 'cad-item-delta--positive' : 'cad-item-delta--negative'">
                {{ formatSignedAmount(item.delta) }}
              </div>
            </div>
          </q-item-section>

          <q-item-section side class="items-end cad-item-side">
            <div class="cad-item-chip" :class="item.selected ? 'cad-item-chip--active' : 'cad-item-chip--locked'">
              {{ item.selected ? 'Ajustado' : 'Travado' }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-if="previewBreakdown.length" class="cad-breakdown q-mt-md">
        <div class="cad-breakdown-row">
          <div class="cad-breakdown-head">
            <div class="cad-breakdown-title">Participação da cor</div>
            <div class="cad-breakdown-caption">Contribuição estimada de cada fermentável para a cor final</div>
          </div>
          <div class="cad-breakdown-bar">
            <div
              v-for="item in previewBreakdown"
              :key="`color-${item.id}`"
              class="cad-breakdown-segment"
              :style="{ width: `${item.colorPct}%`, background: ebcToHex(item.colorEbc) }"
            >
              <q-tooltip class="cad-breakdown-tooltip">
                <div class="text-weight-bold">{{ item.name }}</div>
                <div>{{ item.colorPct.toFixed(1) }}% da contribuição de cor</div>
              </q-tooltip>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <template #footer>
      <q-card-actions class="q-px-md q-py-sm row items-center">
        <div class="cad-footer-copy">
          <div>Cor alcançada: <strong>{{ formatEbc(colorAchieved) }}</strong></div>
          <div>Mudanca total da carga de graos: <strong>{{ formatSignedAmount(colorWeightDelta) }}</strong></div>
        </div>
        <q-space />
        <brew-pilot-button variant="outline" no-caps label="Cancelar" @click="open = false" />
        <brew-pilot-button
          variant="filled"
          color="primary"
          no-caps
          icon="mdi-check"
          label="Aplicar na receita"
          class="q-ml-sm"
          :disable="!canApply"
          @click="apply"
        />
      </q-card-actions>
    </template>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import { ebcToHex } from '@/core/utils/brewColors'
import { getStyleMetricStatus } from '@/pages/recipes/utils/styleMetricStatus'
import RecipeStyleRangeBar from '../../RecipeStyleRangeBar.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats = computed(() => store.stats)

const colorTarget = ref(20)
const colorSelected = ref<boolean[]>([])

const currentEbcRaw = computed(() => calculateEbcRaw(
  recipe.value.fermentables.map(fermentable => ({ amount: fermentable.amount, colorEbc: fermentable.colorEbc })),
  recipe.value.batchVolume,
))
const currentEbc = computed(() => roundEbc(currentEbcRaw.value))
const styleMin = computed(() => Number((recipe.value.styleGuide?.ebcMin ?? Math.max(currentEbc.value - 10, 0)).toFixed(1)))
const styleMax = computed(() => Number((recipe.value.styleGuide?.ebcMax ?? (currentEbc.value + 10)).toFixed(1)))
const sliderMin = computed(() => Number(Math.max(styleMin.value - 10, 0).toFixed(1)))
const sliderMax = computed(() => Number((styleMax.value + 10).toFixed(1)))
const totalWeight = computed(() => recipe.value.fermentables.reduce((sum, fermentable) => sum + fermentable.amount, 0))
const selectedCount = computed(() => colorSelected.value.filter(Boolean).length)
const canApply = computed(() => recipe.value.fermentables.length > 0 && selectedCount.value > 0)
const selectedWeight = computed(() => recipe.value.fermentables.reduce((sum, fermentable, index) => {
  if (!colorSelected.value[index]) return sum
  return sum + fermentable.amount
}, 0))

function normalizeTarget(value: number) {
  return Number(Math.min(Math.max(value, sliderMin.value), sliderMax.value).toFixed(1))
}

function calculatePreviewEbc(scale: number) {
  const fermentables = recipe.value.fermentables.map((fermentable, index) => ({
    amount: colorSelected.value[index] ? fermentable.amount * scale : fermentable.amount,
    colorEbc: fermentable.colorEbc,
  }))

  return calculateEbcRaw(fermentables, recipe.value.batchVolume)
}

const colorScaleFactor = computed(() => {
  if (!canApply.value) return 1

  const target = normalizeTarget(colorTarget.value)
  const current = calculatePreviewEbc(1)

  if (roundEbc(current) === target) return 1

  if (Math.abs(current - target) < 0.01) return 1

  let low = 0
  let high = 1

  if (current < target) {
    let achieved = calculatePreviewEbc(high)
    while (achieved < target && high < 64) {
      high *= 2
      achieved = calculatePreviewEbc(high)
    }
  }

  let mid = 1
  for (let index = 0; index < 40; index += 1) {
    mid = (low + high) / 2
    const achieved = calculatePreviewEbc(mid)
    if (achieved < target) low = mid
    else high = mid
  }

  return mid
})

const colorAchievedRaw = computed(() => calculatePreviewEbc(colorScaleFactor.value))
const colorAchieved = computed(() => roundEbc(colorAchievedRaw.value))
const previewStatus = computed(() => getStyleMetricStatus(colorAchievedRaw.value, styleMin.value, styleMax.value))
const previewInsideStyle = computed(() => previewStatus.value === 'ok')

const previewDiff = computed(() => colorAchievedRaw.value - currentEbcRaw.value)
const previewTrendIcon = computed(() => {
  if (Math.abs(previewDiff.value) < 0.049) return 'mdi-minus'
  return previewDiff.value > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'
})

const previewTrendClass = computed(() => {
  if (Math.abs(previewDiff.value) < 0.049) return 'cad-trend-icon--neutral'
  return previewDiff.value > 0 ? 'cad-trend-icon--up' : 'cad-trend-icon--down'
})

const colorWeightDelta = computed(() => {
  const factor = colorScaleFactor.value
  return recipe.value.fermentables.reduce((sum, fermentable, index) => {
    if (!colorSelected.value[index]) return sum
    return sum + fermentable.amount * (factor - 1)
  }, 0)
})

const impactDelta = computed(() => Number(colorWeightDelta.value.toFixed(3)))
const impactDirectionText = computed(() => {
  if (Math.abs(impactDelta.value) < 0.001) return 'Sem mudanca'
  return impactDelta.value > 0 ? 'Aumento' : 'Reducao'
})

const previewItems = computed(() => recipe.value.fermentables.map((fermentable, index) => {
  const previewAmount = colorSelected.value[index]
    ? Number((fermentable.amount * colorScaleFactor.value).toFixed(3))
    : fermentable.amount

  return {
    ...fermentable,
    index,
    previewAmount,
    delta: Number((previewAmount - fermentable.amount).toFixed(3)),
    selected: Boolean(colorSelected.value[index]),
    currentPct: totalWeight.value ? (fermentable.amount / totalWeight.value) * 100 : 0,
  }
}))

const previewBreakdown = computed(() => {
  const totalPreviewWeight = previewItems.value.reduce((sum, item) => sum + item.previewAmount, 0)
  const totalColorContribution = previewItems.value.reduce((sum, item) => (
    sum + getColorContribution(item.previewAmount, item.colorEbc)
  ), 0)

  return previewItems.value
    .map(item => {
      const weightPct = totalPreviewWeight ? (item.previewAmount / totalPreviewWeight) * 100 : 0
      const colorContribution = getColorContribution(item.previewAmount, item.colorEbc)
      const colorPct = totalColorContribution ? (colorContribution / totalColorContribution) * 100 : 0

      return {
        ...item,
        colorPct: Number(colorPct.toFixed(1)),
      }
    })
    .filter(item => item.colorPct > 0)
})

const feedbackIcon = computed(() => {
  if (!selectedCount.value) return 'mdi-checkbox-blank-circle-outline'
  return previewInsideStyle.value ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'
})

const feedbackText = computed(() => {
  if (!selectedCount.value) return 'Selecione ao menos um fermentavel para recalcular a cor da receita.'
  if (previewInsideStyle.value) return 'A previa fica dentro da faixa do estilo com base apenas nos fermentaveis selecionados.'
  return 'A previa ainda fica fora da faixa do estilo. Ajuste o alvo ou revise quais fermentaveis participam do calculo.'
})

function formatEbc(value: number) {
  return `${value.toFixed(1)} EBC`
}

function roundEbc(value: number) {
  return Number(value.toFixed(1))
}

function calculateEbcRaw(
  fermentables: Array<{ amount: number; colorEbc: number }>,
  batchVolume: number,
) {
  if (!fermentables.length || !batchVolume) return 0

  const gallons = batchVolume * 0.264172
  const mcu = fermentables.reduce((sum, fermentable) => {
    const pounds = fermentable.amount * 2.20462
    const srm = fermentable.colorEbc / 1.97
    return sum + ((pounds * srm) / gallons)
  }, 0)

  const srm = 1.4922 * Math.pow(mcu, 0.6859)
  return srm * 1.97
}

function getColorContribution(amount: number, colorEbc: number) {
  return amount * colorEbc
}

function formatAmount(kg: number) {
  if (kg >= 1) return `${parseFloat(kg.toFixed(3))} kg`
  return `${Math.round(kg * 1000)} g`
}

function formatSignedAmount(kg: number) {
  if (Math.abs(kg) < 0.0005) return '0 g'
  const sign = kg > 0 ? '+' : '-'
  return `${sign}${formatAmount(Math.abs(kg))}`
}

watch(open, value => {
  if (!value) return
  colorTarget.value = normalizeTarget(currentEbc.value || styleMin.value)
  colorSelected.value = recipe.value.fermentables.map(() => true)
})

watch([sliderMin, sliderMax], () => {
  colorTarget.value = normalizeTarget(colorTarget.value)
})

function apply() {
  if (!canApply.value) return

  const factor = colorScaleFactor.value
  recipe.value.fermentables.forEach((fermentable, index) => {
    if (!colorSelected.value[index]) return
    fermentable.amount = Number((fermentable.amount * factor).toFixed(3))
  })
  open.value = false
}
</script>

<style scoped>
.cad-help-panel {
  width: min(360px, 86vw);
  padding: 14px;
  background: var(--bp-card-bg);
}

.cad-help-title {
  color: var(--bp-text-primary);
  font-size: 13px;
  font-weight: 700;
}

.cad-help-copy {
  color: var(--bp-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin-top: 6px;
}

.cad-stat-card {
  height: 100%;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--q-primary) 10%, var(--bp-card-border));
  background: linear-gradient(180deg, color-mix(in srgb, var(--bp-card-bg) 98%, transparent), color-mix(in srgb, var(--bp-card-bg) 91%, transparent));
}

.cad-stat-card--accent {
  box-shadow: 0 10px 26px rgba(0, 0, 0, .05);
}

.cad-stat-card--ok {
  border-color: rgba(51, 171, 92, .24);
}

.cad-stat-card--danger {
  border-color: rgba(198, 40, 40, .22);
}

.cad-stat-card--warm {
  border-color: rgba(193, 113, 14, .22);
}

.cad-stat-card--cool {
  border-color: rgba(36, 120, 59, .20);
}

.cad-stat-value {
  color: var(--bp-text-primary);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.1;
  margin-top: 8px;
}

.cad-stat-value--with-trend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cad-trend-icon--up {
  color: #2e7d32;
}

.cad-trend-icon--down {
  color: #c62828;
}

.cad-trend-icon--neutral {
  color: var(--bp-text-secondary);
}

.cad-stat-beer {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.cad-stat-caption {
  color: var(--bp-text-secondary);
  font-size: 11px;
  line-height: 1.5;
  margin-top: 8px;
}

.cad-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--bp-text-primary);
  font-size: 16px;
  font-weight: 700;
  margin-top: 10px;
}

.cad-bar-caption {
  color: var(--bp-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.cad-slider-shell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cad-slider-bound {
  color: var(--bp-text-secondary);
  font-size: 11px;
  font-weight: 700;
  min-width: 60px;
}

.cad-slider-bound--right {
  text-align: right;
}

.cad-target-input {
  width: 160px;
}

.cad-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
}

.cad-feedback--ok {
  color: #22663a;
  background: rgba(51, 171, 92, .12);
}

.cad-feedback--danger {
  color: #8e2b2b;
  background: rgba(198, 40, 40, .10);
}

.cad-list-header {
  margin-bottom: 10px;
}

.cad-list-title {
  color: var(--bp-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.cad-list-subtitle {
  color: var(--bp-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
}

.cad-item {
  padding-top: 10px;
  padding-bottom: 10px;
}

.cad-item-swatch {
  width: 12px;
  height: 36px;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .06);
}

.cad-item-name {
  color: var(--bp-text-primary);
  font-size: 13px;
  font-weight: 700;
}

.cad-item-caption {
  color: var(--bp-text-secondary);
  font-size: 11px;
}

.cad-item-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cad-item-preview-line {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(120, 96, 78, .08);
  color: var(--bp-text-primary);
  font-size: 11px;
}

.cad-item-preview-line--active {
  background: rgba(193, 113, 14, .12);
}

.cad-item-preview-line--locked {
  background: rgba(120, 96, 78, .06);
  color: var(--bp-text-secondary);
}

.cad-item-preview-label {
  text-transform: uppercase;
  letter-spacing: .04em;
  font-size: 10px;
  font-weight: 700;
}

.cad-item-preview-arrow {
  color: var(--bp-text-secondary);
  font-weight: 700;
}

.cad-item-delta {
  font-size: 11px;
  font-weight: 700;
}

.cad-item-delta-icon {
  flex-shrink: 0;
}

.cad-item-delta-icon--positive {
  color: #2e7d32;
}

.cad-item-delta-icon--negative {
  color: #9b1c1c;
}

.cad-item-delta--positive {
  color: #2e7d32;
}

.cad-item-delta--negative {
  color: #9b1c1c;
}

.cad-item-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 74px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
}

.cad-item-chip--active {
  color: var(--q-primary);
  background: rgba(193, 113, 14, .12);
}

.cad-item-chip--locked {
  color: var(--bp-text-secondary);
  background: rgba(120, 96, 78, .08);
}

.cad-footer-copy {
  color: var(--bp-text-secondary);
  font-size: 11px;
  line-height: 1.6;
}

.cad-footer-copy strong {
  color: var(--bp-text-primary);
}

.cad-breakdown {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--q-primary) 10%, var(--bp-card-border));
  background: linear-gradient(180deg, color-mix(in srgb, var(--bp-card-bg) 98%, transparent), color-mix(in srgb, var(--bp-card-bg) 94%, transparent));
}

.cad-breakdown-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cad-breakdown-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.cad-breakdown-title {
  color: var(--bp-text-primary);
  font-size: 12px;
  font-weight: 700;
}

.cad-breakdown-caption {
  color: var(--bp-text-secondary);
  font-size: 11px;
}

.cad-breakdown-bar {
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  display: flex;
  background: rgba(120, 96, 78, .08);
}

.cad-breakdown-segment {
  min-width: 2px;
}

.cad-breakdown-tooltip {
  font-size: 12px;
}
</style>
