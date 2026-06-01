<template>
  <brew-pilot-dialog
    v-model="open"
    title="Definir Porcentagens"
    icon="mdi-percent"
    icon-color="primary"
    width="720px"
    scrollable
  >
    <template #header-actions>
      <brew-pilot-button
        variant="flat"
        round
        dense
        icon="mdi-help-circle-outline"
        tooltip="Como definir proporções"
      >
        <q-menu anchor="bottom right" self="top right" :offset="[0, 6]">
          <div class="spd-help-panel">
            <div class="spd-help-title">Como o Brew Pilot interpreta as porcentagens</div>
            <div class="spd-help-copy">
              As porcentagens sempre somam sobre a carga total atual de fermentáveis. Quando você aplica, o peso total da receita é preservado.
            </div>
            <div class="spd-help-copy q-mt-xs">
              O alvo ideal é 100,0%. A prévia abaixo mostra quanto cada fermentável vai pesar depois da redistribuição.
            </div>
          </div>
        </q-menu>
      </brew-pilot-button>
    </template>

    <q-card-section class="q-pt-sm q-pb-xs">
      <div class="spd-summary row q-col-gutter-sm">
        <div class="col-12 col-md-4">
          <div class="spd-stat-card">
            <brew-pilot-label>Carga total</brew-pilot-label>
            <div class="spd-stat-value">{{ totalWeightDisplay }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="spd-stat-card" :class="isTotalValid ? 'spd-stat-card--ok' : 'spd-stat-card--danger'">
            <brew-pilot-label>Soma informada</brew-pilot-label>
            <div class="spd-stat-value">{{ pctTotal.toFixed(1) }}%</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="spd-stat-card" :class="isTotalValid ? 'spd-stat-card--ok' : 'spd-stat-card--danger'">
            <brew-pilot-label>Status</brew-pilot-label>
            <div class="spd-stat-status">
              <q-icon :name="isTotalValid ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'" size="18px" />
              <span>{{ isTotalValid ? 'Pronto para aplicar' : `${remainingPct > 0 ? 'Faltam' : 'Excedeu'} ${Math.abs(remainingPct).toFixed(1)}%` }}</span>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-xs q-pb-sm">
      <div class="spd-feedback" :class="isTotalValid ? 'spd-feedback--ok' : 'spd-feedback--danger'">
        <q-icon :name="isTotalValid ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'" size="16px" />
        <span>
          {{ isTotalValid
            ? 'As porcentagens fecham em 100%. A aplicação vai preservar a carga total atual da receita.'
            : 'Ajuste os percentuais até fechar em 100,0% para redistribuir os fermentáveis com segurança.' }}
        </span>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-xs">
      <div class="spd-list-title">Redistribuição dos fermentáveis</div>
      <div class="spd-list-subtitle">Defina a participação de cada fermentável e acompanhe a prévia do novo peso antes de aplicar.</div>

      <div class="spd-auto-mode q-mt-md">
        <div class="spd-auto-toggle">
          <q-checkbox
            :model-value="autoRecalculateSelected"
            color="primary"
            dense
            class="spd-auto-toggle-control"
            checked-icon="mdi-calculator-variant"
            unchecked-icon="mdi-calculator-variant-outline"
            @update:model-value="onAutoModeChange"
          >
            <q-tooltip class="spd-tooltip" anchor="center left" self="center right" :offset="[8, 0]">
              {{ autoRecalculateSelected
                ? 'Desative para voltar ao ajuste manual dos percentuais.'
                : 'Ative para permitir que os fermentáveis marcados sejam recalculados automaticamente.' }}
            </q-tooltip>
          </q-checkbox>
        </div>
        <div class="spd-auto-copy">
          <div class="spd-auto-title">
            <q-icon name="mdi-calculator-variant" size="16px" />
            <span>Recalcular automaticamente</span>
          </div>
          <div class="spd-auto-subtitle">
            Os fermentáveis marcados absorvem automaticamente a diferença. Ative este modo para destravar a seleção automática. Depois, marque os fermentáveis que devem ser recalculados e altere qualquer outro percentual livre para redistribuir o restante mantendo 100,0%.
          </div>
        </div>
      </div>

      <div class="column q-gutter-sm q-mt-sm">
        <div v-for="item in fermentableRows" :key="item.id" class="spd-item-card">
          <div class="row items-start q-col-gutter-md">
            <div class="col-12 col-md-7">
              <div class="spd-item-head">
                <div class="spd-item-name-wrap">
                  <q-icon :name="typeIcon(item.type)" size="14px" color="primary" class="spd-item-name-icon" />
                  <div class="spd-item-name-block">
                    <div class="spd-item-name-row">
                      <div class="spd-item-name">{{ item.name }}</div>
                    </div>
                    <div class="spd-item-data-line">
                      <span class="spd-item-detail-chip">
                        <q-icon :name="typeIcon(item.type)" size="11px" />
                        {{ typeLabel(item.type) }}
                      </span>
                      <span class="spd-item-inline-data">Atual: {{ formatAmount(item.amount) }}</span>
                      <span class="spd-item-inline-data">{{ item.currentPct.toFixed(1) }}%</span>
                    </div>
                    <div class="spd-item-data-line spd-item-data-line--secondary">
                      <span class="spd-item-detail-chip">
                        <q-icon name="mdi-palette-outline" size="11px" />
                        {{ item.colorEbc.toFixed(1) }} EBC
                      </span>
                      <span v-if="item.supplier" class="spd-item-inline-data">{{ item.supplier }}</span>
                      <span class="spd-item-inline-data">Prévia: <strong>{{ formatAmount(item.previewAmount) }}</strong></span>
                    </div>
                  </div>
                </div>
                <div v-if="item.isManagedAutomatically" class="spd-item-badge">Automático</div>
              </div>
            </div>
            <div class="col-12 col-md-5">
              <div class="spd-item-control-row">
                <q-checkbox
                  :model-value="item.isAutoSelected"
                  color="primary"
                  dense
                  class="spd-item-checkbox"
                  :class="{ 'spd-item-checkbox--active': autoRecalculateSelected }"
                  :disable="item.isAutoSelectionDisabled"
                  checked-icon="mdi-calculator-variant"
                  unchecked-icon="mdi-calculator-variant-outline"
                  @update:model-value="value => onAutoSelectedChange(item.index, value)"
                >
                  <q-tooltip class="spd-tooltip" anchor="center left" self="center right" :offset="[8, 0]">
                    {{ item.autoSelectionTooltip }}
                  </q-tooltip>
                </q-checkbox>
                <brew-pilot-input
                  :model-value="pctValues[item.index]"
                  type="number"
                  :step="0.1"
                  :min="0"
                  :max="100"
                  label="Percentual alvo"
                  prefix="%"
                  class="spd-item-input"
                  :disable="item.isManagedAutomatically"
                  @update:model-value="value => onPctInput(item.index, value)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="previewBarItems.length" class="spd-preview-breakdown q-mt-md">
        <div class="spd-preview-breakdown-title">Prévia no total da receita</div>
        <div class="spd-preview-breakdown-caption">Visualize como os percentuais ficam distribuídos no total da carga fermentável.</div>
        <div class="spd-preview-breakdown-bar q-mt-xs">
          <div
            v-for="item in previewBarItems"
            :key="item.id"
            class="spd-preview-breakdown-segment"
            :style="{ width: `${item.previewPct}%`, background: ebcToHex(item.colorEbc) }"
          >
            <q-tooltip class="spd-tooltip">
              <div class="text-weight-bold">{{ item.name }}</div>
              <div>{{ item.previewPct.toFixed(1) }}% do total da receita</div>
              <div>Prévia: {{ formatAmount(item.previewAmount) }}</div>
            </q-tooltip>
          </div>
        </div>
      </div>
    </q-card-section>

    <template #footer>
      <q-card-actions class="q-px-md q-py-sm row items-center">
        <div class="spd-footer-copy">Total preservado: <strong>{{ totalWeightDisplay }}</strong></div>
        <q-space />
        <brew-pilot-button variant="outline" no-caps label="Cancelar" @click="open = false" />
        <brew-pilot-button
          variant="filled"
          color="primary"
          no-caps
          icon="mdi-check"
          label="Definir"
          class="q-ml-sm"
          :disable="!isTotalValid"
          @click="apply"
        />
      </q-card-actions>
    </template>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ebcToHex } from '@/core/utils/brewColors'
import { useRecipeStore } from '@/stores/recipeStore'
import type { FermentableType } from '@/types/recipe'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)

const pctValues = ref<number[]>([])
const autoSelected = ref<boolean[]>([])
const autoRecalculateSelected = ref(false)

const totalWeight = computed(() => recipe.value.fermentables.reduce((sum, fermentable) => sum + fermentable.amount, 0))
const totalWeightDisplay = computed(() => formatAmount(totalWeight.value))
const pctTotal = computed(() => roundPct(pctValues.value.reduce((sum, value) => sum + (value ?? 0), 0)))
const remainingPct = computed(() => Number((100 - pctTotal.value).toFixed(1)))
const isTotalValid = computed(() => Math.abs(remainingPct.value) <= 0.1)
const fermentableCount = computed(() => recipe.value.fermentables.length)
const selectedAutoCount = computed(() => autoSelected.value.filter(Boolean).length)
const hasAutoManagedItems = computed(() => autoRecalculateSelected.value && selectedAutoCount.value > 0)

const fermentableRows = computed(() => recipe.value.fermentables.map((fermentable, index) => ({
  ...fermentable,
  index,
  currentPct: totalWeight.value ? (fermentable.amount / totalWeight.value) * 100 : 0,
  previewAmount: Number((((pctValues.value[index] ?? 0) / 100) * totalWeight.value).toFixed(3)),
  previewPct: normalizePct(pctValues.value[index] ?? 0),
  isAutoSelected: autoSelected.value[index] ?? false,
  isManagedAutomatically: hasAutoManagedItems.value && Boolean(autoSelected.value[index]),
  isAutoSelectionDisabled: isAutoSelectionDisabled(index),
  autoSelectionTooltip: getAutoSelectionTooltip(index),
})))

const previewBarItems = computed(() => fermentableRows.value.filter(item => item.previewPct > 0))

function typeIcon(type: FermentableType): string {
  if (type === 'Grain') return 'mdi-barley'
  if (type === 'Sugar') return 'mdi-cube-outline'
  if (type === 'DryExtract' || type === 'LiquidExtract') return 'mdi-flask-outline'
  return 'mdi-grain'
}

function typeLabel(type: FermentableType): string {
  const labels: Record<FermentableType, string> = {
    Grain: 'Grão',
    Sugar: 'Açúcar',
    DryExtract: 'Extrato seco',
    LiquidExtract: 'Extrato líquido',
    Honey: 'Mel',
    Juice: 'Suco',
    Adjunct: 'Adjunto',
  }

  return labels[type] ?? type
}

function formatAmount(kg: number) {
  if (kg >= 1) return `${kg.toFixed(2)} kg`
  return `${Math.round(kg * 1000)} g`
}

function currentPct(amount: number) {
  if (!totalWeight.value) return 0
  return Number((((amount / totalWeight.value) * 100)).toFixed(1))
}

function normalizePct(value: string | number | null) {
  const parsed = Number(value ?? 0)
  if (!Number.isFinite(parsed)) return 0
  return roundPct(Math.min(Math.max(parsed, 0), 100))
}

function roundPct(value: number) {
  return Number(value.toFixed(1))
}

function toPctTicks(value: number) {
  return Math.max(Math.round(normalizePct(value) * 10), 0)
}

function fromPctTicks(value: number) {
  return Number((value / 10).toFixed(1))
}

function distributePercentages(total: number, weights: number[]) {
  const totalTicks = Math.max(Math.round(total * 10), 0)
  if (!weights.length) return []

  const safeWeights = weights.map(weight => Math.max(weight, 0))
  const weightSum = safeWeights.reduce((sum, weight) => sum + weight, 0)

  if (weightSum <= 0) {
    const baseTicks = Math.floor(totalTicks / weights.length)
    let remainingTicks = totalTicks - (baseTicks * weights.length)

    return safeWeights.map(() => {
      const extraTick = remainingTicks > 0 ? 1 : 0
      remainingTicks -= extraTick
      return fromPctTicks(baseTicks + extraTick)
    })
  }

  const rawAllocations = safeWeights.map(weight => (totalTicks * weight) / weightSum)
  const baseAllocations = rawAllocations.map(allocation => Math.floor(allocation))
  let remainingTicks = totalTicks - baseAllocations.reduce((sum, value) => sum + value, 0)

  const fractions = rawAllocations
    .map((allocation, index) => ({ index, fraction: allocation - Math.floor(allocation) }))
    .sort((left, right) => right.fraction - left.fraction)

  for (let cursor = 0; cursor < fractions.length && remainingTicks > 0; cursor += 1) {
    baseAllocations[fractions[cursor].index] += 1
    remainingTicks -= 1
  }

  return baseAllocations.map(fromPctTicks)
}

function getSelectedIndices() {
  return autoSelected.value
    .map((selected, index) => (selected ? index : -1))
    .filter(index => index >= 0)
}

function rebalanceSelectedPercentages() {
  if (!hasAutoManagedItems.value) return

  const selectedIndices = getSelectedIndices()
  const selectedSet = new Set(selectedIndices)
  const unlockedTotal = pctValues.value.reduce((sum, value, index) => (
    selectedSet.has(index) ? sum : sum + (value ?? 0)
  ), 0)
  const availablePct = Math.max(100 - unlockedTotal, 0)
  const distributed = distributePercentages(
    availablePct,
    selectedIndices.map(index => pctValues.value[index] ?? 0),
  )

  selectedIndices.forEach((index, position) => {
    pctValues.value[index] = distributed[position] ?? 0
  })
}

function canEnableAutoSelection(index: number) {
  if (!autoRecalculateSelected.value) return false
  if (autoSelected.value[index]) return true
  return selectedAutoCount.value < Math.max(fermentableCount.value - 1, 0)
}

function isAutoSelectionDisabled(index: number) {
  return !canEnableAutoSelection(index)
}

function getAutoSelectionTooltip(index: number) {
  if (!autoRecalculateSelected.value) {
    return 'Ative “Recalcular automaticamente” para habilitar esta seleção.'
  }

  if (!autoSelected.value[index] && selectedAutoCount.value >= Math.max(fermentableCount.value - 1, 0)) {
    return 'Pelo menos um fermentável precisa permanecer livre para você alterar o percentual e disparar o recálculo.'
  }

  if (autoSelected.value[index]) {
    return 'Este item será recalculado automaticamente quando você alterar outro percentual livre.'
  }

  return 'Ao marcar este item, ele passa a ser recalculado automaticamente quando você alterar outro percentual livre.'
}

function onPctInput(index: number, value: string | number | null) {
  if (hasAutoManagedItems.value && autoSelected.value[index]) return

  const normalizedValue = normalizePct(value)
  if (!hasAutoManagedItems.value) {
    pctValues.value[index] = normalizedValue
    return
  }

  const selectedSet = new Set(getSelectedIndices())
  const otherUnlockedTotal = pctValues.value.reduce((sum, pctValue, pctIndex) => {
    if (pctIndex === index || selectedSet.has(pctIndex)) return sum
    return sum + (pctValue ?? 0)
  }, 0)

  const maxAllowed = Math.max(100 - otherUnlockedTotal, 0)
  pctValues.value[index] = roundPct(Math.min(normalizedValue, maxAllowed))
  rebalanceSelectedPercentages()
}

function onAutoModeChange(value: boolean | null) {
  autoRecalculateSelected.value = Boolean(value)
  if (!autoRecalculateSelected.value) {
    autoSelected.value = autoSelected.value.map(() => false)
    return
  }

  if (hasAutoManagedItems.value) {
    rebalanceSelectedPercentages()
  }
}

function onAutoSelectedChange(index: number, value: boolean | null) {
  if (value && !canEnableAutoSelection(index)) return
  autoSelected.value[index] = Boolean(value)
  if (hasAutoManagedItems.value) {
    rebalanceSelectedPercentages()
  }
}

watch(open, value => {
  if (!value) return
  pctValues.value = recipe.value.fermentables.map(fermentable => currentPct(fermentable.amount))
  autoSelected.value = recipe.value.fermentables.map(() => false)
  autoRecalculateSelected.value = false
})

function apply() {
  if (!isTotalValid.value) return

  const total = totalWeight.value
  recipe.value.fermentables.forEach((fermentable, index) => {
    fermentable.amount = Number((((pctValues.value[index] ?? 0) / 100) * total).toFixed(3))
  })
  open.value = false
}
</script>

<style scoped>
.spd-help-panel {
  width: min(340px, 86vw);
  padding: 14px;
  background: var(--bp-card-bg);
}

.spd-help-title {
  color: var(--bp-text-primary);
  font-size: 13px;
  font-weight: 700;
}

.spd-help-copy {
  color: var(--bp-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin-top: 6px;
}

.spd-stat-card {
  height: 100%;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--q-primary) 10%, var(--bp-card-border));
  background: linear-gradient(180deg, color-mix(in srgb, var(--bp-card-bg) 98%, transparent), color-mix(in srgb, var(--bp-card-bg) 91%, transparent));
}

.spd-stat-card--ok {
  border-color: rgba(51, 171, 92, .24);
}

.spd-stat-card--danger {
  border-color: rgba(198, 40, 40, .22);
}

.spd-stat-value {
  color: var(--bp-text-primary);
  font-size: 24px;
  font-weight: 800;
  margin-top: 8px;
}

.spd-stat-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--bp-text-primary);
  font-size: 15px;
  font-weight: 700;
  margin-top: 10px;
}

.spd-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
}

.spd-feedback--ok {
  color: #22663a;
  background: rgba(51, 171, 92, .12);
}

.spd-feedback--danger {
  color: #8e2b2b;
  background: rgba(198, 40, 40, .10);
}

.spd-list-title {
  color: var(--bp-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.spd-list-subtitle {
  color: var(--bp-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
}

.spd-auto-mode {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--q-primary) 12%, var(--bp-card-border));
  background: linear-gradient(180deg, color-mix(in srgb, var(--bp-card-bg) 97%, transparent), color-mix(in srgb, var(--bp-card-bg) 93%, transparent));
}

.spd-auto-toggle {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.spd-auto-toggle-control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--q-primary) 14%, var(--bp-card-border));
  background: color-mix(in srgb, var(--bp-card-bg) 94%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .12);
}

.spd-auto-toggle-control :deep(.q-checkbox__label) {
  display: none;
}

.spd-auto-toggle-control :deep(.q-checkbox__inner) {
  color: var(--bp-text-muted);
  transition: color .18s ease, opacity .18s ease, transform .18s ease;
}

.spd-auto-toggle-control :deep(.q-checkbox__inner--falsy) {
  opacity: .82;
}

.spd-auto-toggle-control :deep(.q-checkbox__inner--truthy) {
  color: var(--q-primary);
  transform: scale(1.04);
}

.spd-auto-copy {
  min-width: 0;
}

.spd-auto-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--bp-text-primary);
  font-size: 12px;
  font-weight: 700;
}

.spd-auto-subtitle {
  color: var(--bp-text-secondary);
  font-size: 11px;
  line-height: 1.5;
  margin-top: 4px;
}

.spd-tooltip {
  font-size: 12px;
  line-height: 1.5;
  max-width: 280px;
}

.spd-item-card {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--q-primary) 10%, var(--bp-card-border));
  background: linear-gradient(180deg, color-mix(in srgb, var(--bp-card-bg) 97%, transparent), color-mix(in srgb, var(--bp-card-bg) 92%, transparent));
}

.spd-item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.spd-item-name-wrap {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.spd-item-name-icon {
  margin-top: 1px;
  flex-shrink: 0;
}

.spd-item-name-block {
  min-width: 0;
}

.spd-item-name-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.spd-item-name {
  color: var(--bp-text-primary);
  font-size: 13px;
  font-weight: 700;
}

.spd-item-data-line {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.spd-item-data-line--secondary {
  margin-top: 6px;
}

.spd-item-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(120, 96, 78, .08);
  color: var(--bp-text-secondary);
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}

.spd-item-inline-data {
  color: var(--bp-text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.spd-item-inline-data strong {
  color: var(--bp-text-primary);
}

.spd-item-badge {
  padding: 2px 8px;
  border-radius: 999px;
  color: #22663a;
  background: rgba(51, 171, 92, .12);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .02em;
}

.spd-item-checkbox {
  display: inline-flex;
}

.spd-item-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spd-item-input {
  flex: 0 0 188px;
  max-width: 188px;
}

.spd-item-checkbox :deep(.q-checkbox__label) {
  display: none;
}

.spd-item-checkbox :deep(.q-checkbox__inner) {
  color: var(--bp-text-muted);
  transition: color .18s ease, opacity .18s ease;
}

.spd-item-checkbox :deep(.q-checkbox__icon) {
  font-size: 18px;
}

.spd-item-checkbox :deep(.q-checkbox__bg) {
  color: currentColor;
}

.spd-item-checkbox :deep(.q-checkbox__svg) {
  color: currentColor;
}

.spd-item-checkbox--active :deep(.q-checkbox__inner) {
  color: var(--q-primary);
}

.spd-item-checkbox--active :deep(.q-checkbox__inner--truthy) {
  color: var(--q-primary);
}

.spd-item-checkbox :deep(.q-checkbox__inner--falsy) {
  opacity: .78;
}

.spd-footer-copy {
  color: var(--bp-text-secondary);
  font-size: 12px;
}

.spd-preview-breakdown {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--q-primary) 10%, var(--bp-card-border));
  background: linear-gradient(180deg, color-mix(in srgb, var(--bp-card-bg) 98%, transparent), color-mix(in srgb, var(--bp-card-bg) 94%, transparent));
}

.spd-preview-breakdown-title {
  color: var(--bp-text-primary);
  font-size: 12px;
  font-weight: 700;
}

.spd-preview-breakdown-caption {
  color: var(--bp-text-secondary);
  font-size: 11px;
  line-height: 1.5;
  margin-top: 2px;
}

.spd-preview-breakdown-bar {
  height: 6px;
  display: flex;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(120, 96, 78, .08);
}

.spd-preview-breakdown-segment {
  min-width: 2px;
}

@media (max-width: 767px) {
  .spd-auto-mode {
    flex-direction: column;
    gap: 6px;
  }

  .spd-item-control-row {
    align-items: flex-start;
  }

  .spd-item-input {
    flex: 1;
    max-width: none;
  }
}

.spd-item-preview strong,
.spd-footer-copy strong {
  color: var(--bp-text-primary);
}
</style>
