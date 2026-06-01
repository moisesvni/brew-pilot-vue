<template>
  <div style="display:contents">
    <recipe-section title="Fermentáveis" icon="mdi-barley" icon-color="primary" :badge="totalWeightDisplay">
      <template #actions>
        <brew-pilot-button v-if="recipe.fermentables.length >= 1" variant="outline" round dense icon="mdi-palette"
          class="palette-btn" :style="{ '--palette-color': ebcToHex(stats?.ebc ?? 20) }"
          tooltip="Ajustar Cor da Receita" @click.stop="colorDialog = true" />
        <brew-pilot-button v-if="recipe.fermentables.length >= 2" variant="outline" round dense icon="mdi-percent"
          tooltip="Definir Porcentagens" @click.stop="pctDialog = true" />
        <brew-pilot-button v-if="recipe.fermentables.length >= 1" variant="outline" round dense label="OG"
          class="circle-btn" tooltip="Redimensionar por OG" @click.stop="ogDialog = true" />
        <div class="fov-add-action">
          <brew-pilot-button variant="outline" round dense icon="mdi-plus" primary
            :disable="!hasSelectedStyle"
            :tooltip="hasSelectedStyle ? 'Adicionar Fermentável' : undefined"
            @click.stop="pickerOpen = true" />
          <q-tooltip v-if="!hasSelectedStyle" anchor="bottom middle" self="top middle" class="sbr-tooltip">
            Selecione um estilo para liberar a adição de fermentáveis.
          </q-tooltip>
        </div>
      </template>

      <!-- ── Lista ──────────────────────────────────────────────────────────── -->
      <q-list v-if="recipe.fermentables.length" dense class="q-mt-xs">
        <q-item v-for="f in sortedFermentables" :key="f.id" clickable v-ripple class="fov-row q-px-xs q-py-xs"
          @click="openEdit(f)">
          <!-- swatch -->
          <q-item-section style="min-width: 5px; max-width: 5px; padding: 0; margin-right: 6px">
            <div class="fov-swatch" :style="{ background: ebcToHex(f.colorEbc) }" />
          </q-item-section>
          <!-- amount -->
          <q-item-section style="min-width: 52px; max-width: 52px">
            <div class="text-caption text-grey-3 text-weight-medium text-right">{{ fmtAmt(f.amount) }}</div>
          </q-item-section>
          <!-- name -->
          <q-item-section class="q-ml-xs">
            <q-item-label style="font-size: 12.5px; color: var(--bp-text-primary); line-height: 1.3">
              {{ f.name }}
              <span v-if="f.supplier" class="text-grey-6" style="font-weight: 400"> {{ f.supplier }}</span>
            </q-item-label>
            <q-item-label caption class="text-grey-7 row items-center no-wrap" style="gap:3px;font-size:10.5px">
              <q-icon :name="typeIcon(f.type)" size="10px" color="primary" />
              {{ typeLabel(f.type) }} · {{ f.colorEbc }} EBC
            </q-item-label>
          </q-item-section>
          <!-- pct -->
          <q-item-section side style="padding-left:8px">
            <div class="text-caption text-grey-6">{{ pct(f.amount) }}%</div>
          </q-item-section>
        </q-item>
      </q-list>
      <overview-empty-state-banner
        v-else
        class="q-mt-xs"
        icon="mdi-barley"
        tone="amber"
        title="Nenhum fermentável adicionado"
        description="Adicione os maltes e adjuntos que vao construir corpo, cor e densidade da receita."
      />
      <!-- color bar -->
      <div v-if="recipe.fermentables.length" class="fov-bar q-mt-xs">
        <div v-for="f in sortedFermentables" :key="f.id"
          :style="{ width: pct(f.amount) + '%', background: ebcToHex(f.colorEbc) }" />
      </div>
      <!-- stats -->
      <div v-if="recipe.fermentables.length && stats" class="bp-stats-muted text-right q-mt-xs" style="font-size: 11px">
        <span style="cursor: help;">
          <span class="q-mr-sx">OG:</span> <strong class="bp-stats-value">{{ stats.og.toFixed(3) }}</strong>
          <q-tooltip anchor="center right" self="center left" :offset="[6, 0]" class="sbr-tooltip">
            <div class="text-weight-bold">Original Gravity</div>
            <div class="text-grey-4" style="font-size:11px">Densidade Original</div>
          </q-tooltip>
        </span>
        <span style="cursor: help;">
          <span class="q-mr-sx q-ml-sm">FG:</span> <strong class="bp-stats-value">{{ stats.preBoilOg.toFixed(3) }}</strong>
          <q-tooltip anchor="center right" self="center left" :offset="[6, 0]" class="sbr-tooltip">
            <div class="text-weight-bold">Final Gravity</div>
            <div class="text-grey-4" style="font-size:11px">Densidade Final</div>
          </q-tooltip>
        </span>
        <span style="cursor: help;">
          <span class="q-mr-sx q-ml-sm">Cor:</span> <strong class="bp-stats-value">{{ stats.ebc.toFixed(1) }} EBC</strong>
          <q-tooltip anchor="center right" self="center left" :offset="[6, 0]" class="sbr-tooltip">
            <div class="text-weight-bold">Color</div>
            <div class="text-grey-4" style="font-size:11px">Cor da Cerveja</div>
          </q-tooltip>
        </span>
        <template v-if="diastaticPower > 0">
          <span style="cursor: help;">
            <span class="q-mr-sx q-ml-sm">DP:</span> <strong style="color: #ffc107">{{ diastaticPower }} °L</strong>
            <q-tooltip anchor="center right" self="center left" :offset="[6, 0]" class="sbr-tooltip">
              <div class="text-weight-bold">Diastatic Power</div>
              <div class="text-grey-4" style="font-size:11px">Poder Diastático</div>
            </q-tooltip>
          </span>
        </template>
      </div>

    </recipe-section>

    <!-- ═══════════════════════ DIALOGS ═══════════════════════════════════ -->
    <fermentable-form-dialog v-model="editDialog"
      :item="selectedForEdit"
      @save="handleSaveEdit"
      @remove="handleRemoveEdit"
    />
    <color-adjust-dialog v-model="colorDialog" />
    <set-percentages-dialog v-model="pctDialog" />
    <resize-by-og-dialog v-model="ogDialog" />
    <fermentable-picker-dialog v-model="pickerOpen" @add="onAdd" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import type { RecipeFermentable, FermentableType } from '@/types/recipe'
import { ebcToHex } from '@/core/utils/brewColors'
import OverviewEmptyStateBanner from './OverviewEmptyStateBanner.vue'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats = computed(() => store.stats)
const hasSelectedStyle = computed(() => Boolean(recipe.value.styleGuide))

const pickerOpen = ref(false)
const editDialog = ref(false)
const selectedForEdit = ref<RecipeFermentable | null>(null)
const colorDialog = ref(false)
const pctDialog = ref(false)
const ogDialog = ref(false)

const sortedFermentables = computed(() =>
  [...recipe.value.fermentables].sort((a, b) => b.amount - a.amount)
)

const totalWeight = computed(() =>
  recipe.value.fermentables.reduce((s, f) => s + f.amount, 0)
)

const totalWeightDisplay = computed(() => {
  const kg = totalWeight.value
  return kg >= 1 ? `${kg.toFixed(2)} kg` : `${(kg * 1000).toFixed(0)} g`
})

const diastaticPower = computed(() => {
  const mashed = recipe.value.fermentables.filter(f => f.use === 'Mash')
  if (!mashed.length) return 0
  const tot = mashed.reduce((s, f) => s + f.amount, 0)
  const w = mashed.reduce((s, f) => s + (f.diastaticPower ?? guessDp(f)) * f.amount, 0)
  return tot ? Math.round(w / tot) : 0
})

function openEdit(f: RecipeFermentable) {
  selectedForEdit.value = f
  editDialog.value = true
}

function handleSaveEdit(item: RecipeFermentable) {
  const idx = recipe.value.fermentables.findIndex(f => f.id === item.id)
  if (idx >= 0) recipe.value.fermentables[idx] = item
}

function handleRemoveEdit(id: string) {
  const idx = recipe.value.fermentables.findIndex(f => f.id === id)
  if (idx >= 0) recipe.value.fermentables.splice(idx, 1)
}

function onAdd(item: RecipeFermentable) {
  item.sortOrder = recipe.value.fermentables.length
  recipe.value.fermentables.push(item)
}

function pct(amount: number): string {
  if (!totalWeight.value) return '0.0'
  return ((amount / totalWeight.value) * 100).toFixed(1)
}

function fmtAmt(kg: number): string {
  if (kg >= 1) return `${parseFloat(kg.toFixed(3))} kg`
  return `${(kg * 1000).toFixed(0)} g`
}


function typeIcon(type: FermentableType): string {
  if (type === 'Grain') return 'mdi-barley'
  if (type === 'Sugar') return 'mdi-cube-outline'
  if (type === 'DryExtract' || type === 'LiquidExtract') return 'mdi-flask-outline'
  return 'mdi-grain'
}

function typeLabel(type: FermentableType): string {
  const m: Record<string, string> = {
    Grain: 'Grão', Sugar: 'Açúcar', DryExtract: 'Extrato Seco',
    LiquidExtract: 'Extrato Líq.', Honey: 'Mel', Juice: 'Suco', Adjunct: 'Adjunto'
  }
  return m[type] ?? type
}

function guessDp(f: RecipeFermentable): number {
  const srm = f.colorEbc / 1.97
  if (srm <= 4) return 180
  if (srm <= 8) return 120
  if (srm <= 12) return 50
  return 0
}
</script>

<style scoped>
.fov-row {
  border-radius: 4px;
  transition: background 0.12s;
}

.fov-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.fov-swatch {
  width: 4px;
  height: 30px;
  border-radius: 2px;
}

.fov-bar {
  height: 5px;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
}

.palette-btn :deep(.q-icon) {
  color: var(--palette-color) !important;
}

.fov-add-action {
  display: inline-flex;
}
</style>
