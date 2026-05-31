<template>
  <q-card flat bordered class="style-guide-card full-height">
    <q-card-section class="q-pa-sm">

      <!-- ── Cabeçalho (mesmo padrão do EquipmentCard) ── -->
      <div class="row items-center no-wrap q-mb-xs">
        <q-icon
          :name="recipe.styleGuide ? 'mdi-book-open-variant' : 'mdi-book-open-variant-outline'"
          size="22px" class="q-mr-xs flex-shrink-0"
          :style="{ color: 'var(--bp-text-secondary)' }"
        />
        <brew-pilot-label size="13px" class="col">
          {{ recipe.styleGuide
            ? `${recipe.styleGuide.code} ${recipe.styleGuide.name}`
            : 'Nenhum estilo selecionado' }}
        </brew-pilot-label>
        <div class="row flex-shrink-0">
          <brew-pilot-button
            variant="flat"
            round
            dense
            icon="mdi-help-circle-outline"
            tooltip="Guia rapido dos indicadores do estilo"
            class="q-mr-xs sgc-help-btn"
          >
            <q-menu anchor="bottom right" self="top right" :offset="[0, 6]" class="sgc-help-menu">
              <div class="sgc-help-panel">
                <div class="sgc-help-title">Guia de estilo e ajustes</div>
                <div class="sgc-help-copy">
                  Use OG, IBU e EBC para empurrar a receita em direcao ao estilo. ABV, FG e BU/GU respondem aos ingredientes e a fermentacao ja definidos.
                </div>

                <div class="sgc-help-grid q-mt-sm">
                  <div v-for="guide in metricGuide" :key="guide.key" class="sgc-help-item">
                    <div class="sgc-help-item-head">
                      <span class="sgc-help-badge">{{ guide.label }}</span>
                      <q-icon :name="guide.icon" size="13px" :color="guide.adjustable ? 'primary' : 'grey-5'" />
                    </div>
                    <div class="sgc-help-item-copy">{{ guide.description }}</div>
                  </div>
                </div>
              </div>
            </q-menu>
          </brew-pilot-button>
          <brew-pilot-button round outline dense primary
            :icon="recipe.styleGuide ? 'mdi-swap-horizontal' : 'mdi-plus'" size="md"
            @click="styleDialog = true">
            <q-tooltip>{{ recipe.styleGuide ? 'Alterar estilo' : 'Selecionar estilo' }}</q-tooltip>
          </brew-pilot-button>
        </div>
      </div>
      <q-separator class="q-mb-xs" />

      <!-- ── Barras de range ── -->
      <template v-if="stats && recipe.styleGuide">
        <recipe-style-range-bar
          v-for="metric in metrics"
          :key="metric.key"
          :label="metric.label"
          :current="metric.current"
          :min="metric.min"
          :max="metric.max"
          :decimals="metric.decimals"
          :unit="metric.unit"
          :adjustable="metric.adjustable"
          :action-label="metric.actionLabel"
          :action-hint="metric.actionHint"
          :action-icon="metric.actionIcon"
          @adjust="openAdjustDialog(metric)"
        />
      </template>

      <!-- ── Sem estilo ── -->
      <div v-else class="column items-center q-py-sm q-gutter-xs text-center">
        <q-icon name="mdi-book-open-variant-outline" size="32px" color="grey-5" />
        <brew-pilot-label variant="primary" size="12px" class="text-weight-medium">
          Nenhum estilo selecionado
        </brew-pilot-label>
        <brew-pilot-label variant="muted" size="11px">
          Selecione um estilo para comparar ABV, OG, FG, EBC e IBU da receita.
        </brew-pilot-label>
      </div>

    </q-card-section>

    <!-- dialog de seleção de estilo (auto-contido) -->
    <recipe-style-dialog v-model="styleDialog" />
    <recipe-style-adjust-dialog
      v-if="selectedMetric"
      :model-value="adjustDialog"
      :metric="selectedMetric.adjustMetric"
      :label="selectedMetric.label"
      :current="selectedMetric.current"
      :min="selectedMetric.min"
      :max="selectedMetric.max"
      :decimals="selectedMetric.decimals"
      :unit="selectedMetric.unit"
      @update:model-value="updateAdjustDialog"
    />
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import type { StyleAdjustmentMetric } from '@/pages/recipes/utils/styleAdjustments'
import { getStyleMetricStatus, type StyleMetricStatus } from '@/pages/recipes/utils/styleMetricStatus'
import RecipeStyleAdjustDialog from './dialogs/RecipeStyleAdjustDialog.vue'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats  = computed(() => store.stats)

const styleDialog = ref(false)
const adjustDialog = ref(false)
const selectedMetricKey = ref<StyleAdjustmentMetric | null>(null)

interface StyleMetricItem {
  key: string
  label: string
  current: number
  min: number
  max: number
  decimals: number
  unit?: string
  adjustable: boolean
  adjustMetric: StyleAdjustmentMetric
  actionLabel: string
  actionHint: string
  actionIcon: string
  status: StyleMetricStatus
}

const metricGuide = [
  {
    key: 'abv',
    label: 'ABV',
    icon: 'mdi-chart-bell-curve-cumulative',
    adjustable: false,
    description: 'Teor alcoolico final. Sobe ou desce quando OG, FG e atenuacao da levedura mudam.',
  },
  {
    key: 'og',
    label: 'OG',
    icon: 'mdi-tune-variant',
    adjustable: true,
    description: 'Densidade original. Ajuste pela carga total de fermentaveis ja adicionados.',
  },
  {
    key: 'fg',
    label: 'FG',
    icon: 'mdi-waveform',
    adjustable: false,
    description: 'Densidade final. Depende da OG e da atenuacao da levedura selecionada.',
  },
  {
    key: 'ebc',
    label: 'EBC',
    icon: 'mdi-palette-outline',
    adjustable: true,
    description: 'Cor da cerveja. Ajuste pela carga e cor dos fermentaveis presentes.',
  },
  {
    key: 'ibu',
    label: 'IBU',
    icon: 'mdi-hops',
    adjustable: true,
    description: 'Amargor total. Ajuste pelos lupulos que realmente contribuem com IBU.',
  },
  {
    key: 'bugu',
    label: 'BU/GU',
    icon: 'mdi-scale-balance',
    adjustable: false,
    description: 'Equilibrio entre amargor e gravidade. Reage automaticamente aos ajustes de OG e IBU.',
  },
] as const

const buguMin = computed(() => {
  const s = recipe.value.styleGuide
  if (!s) return 0
  return Number((s.ibuMin / ((s.ogMin - 1) * 1000)).toFixed(2))
})
const buguMax = computed(() => {
  const s = recipe.value.styleGuide
  if (!s) return 0
  return Number((s.ibuMax / ((s.ogMax - 1) * 1000)).toFixed(2))
})

const hopDriversCount = computed(() =>
  recipe.value.hops.filter(hop => ['Boil', 'FirstWort', 'Whirlpool', 'Hopstand'].includes(hop.use) && hop.amount > 0).length,
)

const metrics = computed<StyleMetricItem[]>(() => {
  const currentStats = stats.value
  const style = recipe.value.styleGuide

  if (!currentStats || !style) return []

  const hasFermentables = recipe.value.fermentables.length > 0
  const hasHopDrivers = hopDriversCount.value > 0

  return [
    {
      key: 'abv',
      label: 'ABV',
      current: currentStats.abv,
      min: style.abvMin,
      max: style.abvMax,
      decimals: 1,
      unit: ' %',
      adjustable: false,
      adjustMetric: 'og',
      actionLabel: 'Derivado',
      actionHint: 'ABV muda quando OG e FG mudam. Ajuste OG ou a fermentacao da receita.',
      actionIcon: 'mdi-chart-bell-curve-cumulative',
      status: getStyleMetricStatus(currentStats.abv, style.abvMin, style.abvMax),
    },
    {
      key: 'og',
      label: 'OG',
      current: currentStats.og,
      min: style.ogMin,
      max: style.ogMax,
      decimals: 3,
      unit: ' SG',
      adjustable: hasFermentables,
      adjustMetric: 'og',
      actionLabel: hasFermentables ? 'Ajustar' : 'Sem malte',
      actionHint: hasFermentables
        ? 'Escala os fermentaveis ja adicionados para aproximar a OG escolhida.'
        : 'Adicione fermentaveis para liberar o ajuste de OG.',
      actionIcon: 'mdi-tune-variant',
      status: getStyleMetricStatus(currentStats.og, style.ogMin, style.ogMax),
    },
    {
      key: 'fg',
      label: 'FG',
      current: currentStats.fg,
      min: style.fgMin,
      max: style.fgMax,
      decimals: 3,
      unit: ' SG',
      adjustable: false,
      adjustMetric: 'og',
      actionLabel: 'Derivado',
      actionHint: 'FG depende da OG e da atenuacao da levedura selecionada.',
      actionIcon: 'mdi-waveform',
      status: getStyleMetricStatus(currentStats.fg, style.fgMin, style.fgMax),
    },
    {
      key: 'ebc',
      label: 'EBC',
      current: currentStats.ebc,
      min: style.ebcMin,
      max: style.ebcMax,
      decimals: 1,
      unit: ' EBC',
      adjustable: hasFermentables,
      adjustMetric: 'ebc',
      actionLabel: hasFermentables ? 'Ajustar' : 'Sem malte',
      actionHint: hasFermentables
        ? 'Escala os fermentaveis para aproximar a cor ao alvo escolhido.'
        : 'Adicione fermentaveis para liberar o ajuste de cor.',
      actionIcon: 'mdi-palette-outline',
      status: getStyleMetricStatus(currentStats.ebc, style.ebcMin, style.ebcMax),
    },
    {
      key: 'ibu',
      label: 'IBU',
      current: currentStats.ibu,
      min: style.ibuMin,
      max: style.ibuMax,
      decimals: 0,
      unit: ' IBU',
      adjustable: hasHopDrivers,
      adjustMetric: 'ibu',
      actionLabel: hasHopDrivers ? 'Ajustar' : 'Sem lupulo',
      actionHint: hasHopDrivers
        ? 'Escala os lupulos com contribuicao de amargor para atingir o IBU escolhido.'
        : 'Adicione lupulos de fervura, whirlpool ou hopstand para liberar o ajuste de IBU.',
      actionIcon: 'mdi-hops',
      status: getStyleMetricStatus(currentStats.ibu, style.ibuMin, style.ibuMax),
    },
    {
      key: 'bugu',
      label: 'BU/GU',
      current: currentStats.buGuRatio,
      min: buguMin.value,
      max: buguMax.value,
      decimals: 2,
      adjustable: false,
      adjustMetric: 'ibu',
      actionLabel: 'Guiado',
      actionHint: 'BU/GU reage automaticamente quando voce ajusta OG ou IBU.',
      actionIcon: 'mdi-scale-balance',
      status: getStyleMetricStatus(currentStats.buGuRatio, buguMin.value, buguMax.value),
    },
  ]
})

const selectedMetric = computed(() =>
  metrics.value.find(metric => metric.adjustable && metric.adjustMetric === selectedMetricKey.value) ?? null,
)

function openAdjustDialog(metric: StyleMetricItem) {
  if (!metric.adjustable) return
  selectedMetricKey.value = metric.adjustMetric
  adjustDialog.value = true
}

function updateAdjustDialog(value: boolean) {
  adjustDialog.value = value
  if (!value) selectedMetricKey.value = null
}
</script>

<style scoped>
.style-guide-card {
  background: var(--bp-card-bg) !important;
  border-color: var(--bp-card-border) !important;
}

.sgc-help-btn {
  color: var(--q-primary) !important;
}

.sgc-help-panel {
  width: min(360px, 88vw);
  padding: 14px;
  background: var(--bp-card-bg);
}

.sgc-help-title {
  color: var(--bp-text-primary);
  font-size: 13px;
  font-weight: 700;
}

.sgc-help-copy {
  color: var(--bp-text-secondary);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 6px;
}

.sgc-help-grid {
  display: grid;
  gap: 8px;
}

.sgc-help-item {
  padding: 10px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--q-primary) 12%, var(--bp-card-border));
  background: color-mix(in srgb, var(--bp-card-bg) 94%, transparent);
}

.sgc-help-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.sgc-help-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--q-primary) 14%, transparent);
  color: var(--bp-text-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .04em;
}

.sgc-help-item-copy {
  color: var(--bp-text-secondary);
  font-size: 11px;
  line-height: 1.45;
}
</style>
