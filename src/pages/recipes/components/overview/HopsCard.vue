<template>
  <recipe-section
    title="Lúpulos"
    icon="mdi-hops"
    icon-color="green-6"
    :badge="totalHopWeight"
  >
    <template #actions>
      <brew-pilot-button variant="outline" round dense icon="mdi-format-list-bulleted"
        :tooltip="listMode ? 'Modo compacto' : 'Modo lista'" @click.stop="listMode = !listMode" />
      <brew-pilot-button variant="outline" round dense label="IBU"
        class="q-ml-xs" tooltip="Calculadora de IBU" />
      <brew-pilot-button variant="outline" round dense icon="mdi-plus" primary
        class="q-ml-xs" tooltip="Adicionar Lúpulo" @click.stop="pickerOpen = true" />
    </template>

    <!-- ── Lista ──────────────────────────────────────────────────────────── -->
    <q-list dense class="q-mt-xs">
      <q-item
        v-for="h in sortedHops"
        :key="h.id"
        clickable v-ripple
        class="hop-row q-px-xs q-py-xs"
        @click="openEdit(h)"
      >
        <!-- g/L -->
        <q-item-section style="min-width: 44px; max-width: 44px">
          <div class="text-caption text-grey-3 text-weight-medium text-right">{{ fmtGrams(h.amount) }}</div>
          <div class="text-caption text-grey-6 text-right" style="font-size: 10px">
            {{ gramsPerLiter(h.amount) }} g/L
          </div>
        </q-item-section>

        <!-- name + AA + dados técnicos -->
        <q-item-section class="q-ml-sm">
          <q-item-label style="font-size: 12.5px; color: var(--bp-text-primary)">
            {{ h.name }}
            <q-badge v-if="h.hopForm" :label="h.hopForm" color="grey-8" text-color="grey-4"
              class="q-ml-xs" style="font-size:9px" />
          </q-item-label>
          <q-item-label caption class="text-grey-6" style="font-size: 10.5px">
            {{ ibuOf(h).toFixed(1) }} IBU
            &nbsp;·&nbsp; α {{ h.alphaAcid }}%
            <template v-if="h.betaAcid"> · β {{ h.betaAcid }}%</template>
            <template v-if="h.cohumulone"> · Co {{ h.cohumulone }}%</template>
            <template v-if="h.totalOil"> · Oil {{ h.totalOil }} mL/100g</template>
            <template v-if="h.origin">
              &nbsp;·&nbsp; <span class="text-grey-5">{{ h.origin }}</span>
            </template>
          </q-item-label>
        </q-item-section>

        <!-- time + use -->
        <q-item-section side style="padding-left:8px;text-align:right">
          <div class="text-caption text-grey-4">{{ fmtTime(h) }}</div>
          <div class="text-caption text-grey-6" style="font-size: 10px">{{ useLabel(h.use) }}</div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- ── Stats ──────────────────────────────────────────────────────────── -->
    <div class="bp-stats-muted text-right q-mt-xs" style="font-size: 11px">
      <template v-if="hopstandInfo">
        Hopstand: <strong class="bp-stats-value">{{ hopstandInfo }}</strong>
        &nbsp;·&nbsp;
      </template>
      Total de IBU (Tinseth): <strong class="bp-stats-value">{{ totalIbu }}</strong>
      &nbsp;·&nbsp;
      BU/GU: <strong class="bp-stats-value">{{ buGu }}</strong>
      &nbsp;·&nbsp;
      RBR: <strong class="bp-stats-value">{{ rbr }}</strong>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════
         DIALOG: Editar Lúpulo
    ══════════════════════════════════════════════════════════════════════════ -->
    <brew-pilot-dialog v-model="editDialog" title="Editar Lúpulo" icon="mdi-hops"
      icon-color="green" width="440px">
      <q-card-section v-if="editItem" class="q-gutter-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-input v-model="editItem.name" outlined dense label="Nome" />
          </div>
          <div class="col-6 col-sm-4">
            <q-input v-model.number="editItem.amount" type="number" step="1"
              outlined dense label="Quantidade" suffix="g" />
          </div>
          <div class="col-6 col-sm-4">
            <q-input v-model.number="editItem.alphaAcid" type="number" step="0.1"
              outlined dense label="Alfa (%)" suffix="%" />
          </div>
          <div class="col-6 col-sm-4">
            <q-input v-model.number="editItem.betaAcid" type="number" step="0.1"
              outlined dense label="Beta (%)" suffix="%" />
          </div>
          <div class="col-6 col-sm-4">
            <q-input v-model.number="editItem.cohumulone" type="number" step="0.1"
              outlined dense label="Co-Humulona (%)" suffix="%" />
          </div>
          <div class="col-6 col-sm-4">
            <q-input v-model.number="editItem.totalOil" type="number" step="0.01"
              outlined dense label="Óleo Total" suffix="mL/100g" />
          </div>
          <div class="col-6 col-sm-4">
            <q-input v-model="editItem.origin" outlined dense label="Origem" />
          </div>
          <div class="col-6 col-sm-4">
            <q-select v-model="editItem.hopForm"
              :options="['Pellet','Leaf','Extract']"
              outlined dense label="Forma" clearable />
          </div>
          <div class="col-6 col-sm-4">
            <q-select v-model="editItem.use" :options="useOptions" emit-value map-options
              outlined dense label="Uso"
              @update:model-value="onUseChange" />
          </div>
          <div class="col-6 col-sm-4">
            <q-input v-model.number="editItem.time" type="number" step="1"
              outlined dense label="Tempo"
              :suffix="editItem.use === 'DryHop' ? 'dias' : 'min'" />
          </div>
          <div v-if="editItem.use === 'Whirlpool' || editItem.use === 'Hopstand'"
            class="col-6 col-sm-6">
            <q-input v-model.number="editItem.temperature" type="number" step="1"
              outlined dense label="Temperatura" suffix="°C" />
          </div>
        </div>
      </q-card-section>

      <template #footer>
        <q-card-actions class="q-px-md q-pb-md">
          <brew-pilot-button variant="flat" no-caps label="Remover" color="negative"
            @click="removeEditItem" />
          <q-space />
          <brew-pilot-button variant="flat" no-caps label="Cancelar"
            @click="editDialog = false" />
          <brew-pilot-button variant="filled" no-caps label="Salvar" color="positive"
            @click="saveEditItem" />
        </q-card-actions>
      </template>
    </brew-pilot-dialog>

    <hop-picker-dialog v-model="pickerOpen" @add="onAdd" />
  </recipe-section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '../../../../stores/recipeStore'
import RecipeSection from '../RecipeSection.vue'
import BrewPilotButton from '../../../../components/shared/BrewPilotButton.vue'
import BrewPilotDialog from '../../../../components/BrewPilotDialog.vue'
import type { RecipeHop, HopUse } from '../../../../types/recipe'
import HopPickerDialog from '../pickers/HopPickerDialog.vue'
import {
  calculateIbuTinseth,
  calculateIbuWhirlpool
} from '../../../../composables/useBrewCalculator'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats   = computed(() => store.stats)

const pickerOpen = ref(false)
const listMode   = ref(false)

const editDialog = ref(false)
const editItem   = ref<RecipeHop | null>(null)
let   editOrigId = ''

// ── computed ──
const sortedHops = computed(() =>
  [...recipe.value.hops].sort((a, b) => {
    // Boil first, then whirlpool, then dry hop
    const ord: Record<string, number> = { FirstWort: 0, Boil: 1, Whirlpool: 2, Hopstand: 3, DryHop: 4 }
    const diff = (ord[a.use] ?? 5) - (ord[b.use] ?? 5)
    return diff !== 0 ? diff : b.time - a.time
  })
)

const totalHopWeight = computed(() => {
  const g = recipe.value.hops.reduce((s, h) => s + h.amount, 0)
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g.toFixed(0)} g`
})

const totalIbu = computed(() => Math.round(
  recipe.value.hops.reduce((s, h) => s + ibuOf(h), 0)
))

const buGu = computed(() => {
  const og = stats.value?.og ?? 1.050
  const gu = (og - 1) * 1000
  return gu ? (totalIbu.value / gu).toFixed(2) : '0.00'
})

// RBR = BU:GU using a slightly adjusted utilization (Rager-style approximation)
const rbr = computed(() => {
  const og = stats.value?.og ?? 1.050
  const gu = (og - 1) * 1000
  if (!gu) return '0.00'
  const ragerIbu = recipe.value.hops.reduce((s, h) => s + ibuRager(h), 0)
  return (ragerIbu / gu).toFixed(2)
})

const hopstandInfo = computed(() => {
  const hs = recipe.value.hops.filter(h => h.use === 'Hopstand' || h.use === 'Whirlpool')
  if (!hs.length) return null
  const time = hs[0]!.time
  const temp = hs[0]!.temperature ?? 96
  return `${time} min @ ${temp} °C`
})

// ── methods ──
function ibuOf(h: RecipeHop): number {
  const og = stats.value?.og ?? 1.050
  if (h.use === 'Boil' || h.use === 'FirstWort') {
    return calculateIbuTinseth(h.amount, h.alphaAcid, h.time, og, recipe.value.batchVolume)
  }
  if (h.use === 'Whirlpool' || h.use === 'Hopstand') {
    return calculateIbuWhirlpool(h.amount, h.alphaAcid, h.time, h.temperature ?? 85, recipe.value.batchVolume)
  }
  return 0
}

function ibuRager(h: RecipeHop): number {
  // Rager formula: slightly different utilization factor
  if (h.use !== 'Boil' && h.use !== 'FirstWort') return 0
  const og = stats.value?.og ?? 1.050
  const adjustedOg = og > 1.050 ? og : 1.050
  const gaAdj = (adjustedOg - 1.050) / 0.2
  const utilization = 18.11 + 13.86 * Math.tanh((h.time - 31.32) / 18.27)
  const ibu = (h.amount * (utilization / 100) * (h.alphaAcid / 100) * 1000) /
    (recipe.value.batchVolume * (1 + gaAdj))
  return parseFloat(ibu.toFixed(1))
}

function gramsPerLiter(g: number): string {
  return (g / recipe.value.batchVolume).toFixed(2)
}

function fmtGrams(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`
  return `${g.toFixed(0)} g`
}

function fmtTime(h: RecipeHop): string {
  if (h.use === 'DryHop') return `${h.time} dias`
  return `${h.time} min`
}

function useLabel(use: HopUse): string {
  const m: Record<HopUse, string> = {
    FirstWort: 'Primeira Mostura', Boil: 'Fervura',
    Whirlpool: 'Whirlpool', Hopstand: 'Hopstand', DryHop: 'Dry Hop'
  }
  return m[use] ?? use
}

function onUseChange() {
  if (!editItem.value) return
  if (editItem.value.use === 'DryHop') editItem.value.time = 5
  else if (editItem.value.use === 'Whirlpool' || editItem.value.use === 'Hopstand') {
    editItem.value.time = 20
    editItem.value.temperature = 96
  }
}

function openEdit(h: RecipeHop) {
  editOrigId = h.id
  editItem.value = { ...h }
  editDialog.value = true
}
function saveEditItem() {
  if (!editItem.value) return
  const idx = recipe.value.hops.findIndex(h => h.id === editOrigId)
  if (idx >= 0) recipe.value.hops[idx] = { ...editItem.value }
  editDialog.value = false
}
function removeEditItem() {
  const idx = recipe.value.hops.findIndex(h => h.id === editOrigId)
  if (idx >= 0) recipe.value.hops.splice(idx, 1)
  editDialog.value = false
}

function onAdd(item: RecipeHop) {
  item.sortOrder = recipe.value.hops.length
  recipe.value.hops.push(item)
}

const useOptions = [
  { label: 'Primeira Mostura', value: 'FirstWort' },
  { label: 'Fervura',          value: 'Boil' },
  { label: 'Whirlpool',        value: 'Whirlpool' },
  { label: 'Hopstand',         value: 'Hopstand' },
  { label: 'Dry Hop',          value: 'DryHop' }
]
</script>

<style scoped>
.hop-row { border-radius: 4px; transition: background 0.12s; }
.hop-row:hover { background: rgba(255,255,255,0.05); }
</style>
