<template>
  <div style="display:contents">
    <recipe-section title="Fermentáveis" icon="mdi-barley" icon-color="amber-8" :badge="totalWeightDisplay">
      <template #actions>
        <q-btn round outline dense size="md" icon="mdi-palette" color="grey-5" class="palette-btn"
          :style="{ '--palette-color': ebcToHex(stats?.ebc ?? 20) }" @click.stop="colorDialog = true">
          <q-tooltip>Ajustar Cor da Receita</q-tooltip>
        </q-btn>
        <q-btn round outline dense color="grey-5" size="11px" padding="6px 6px" icon="mdi-percent"
          @click.stop="openPct">
          <q-tooltip>Definir Porcentagens</q-tooltip>
        </q-btn>
        <q-btn round outline dense color="grey-5" size="md" class="circle-btn" @click.stop="openOg">
          <q-tooltip>Redimensionar por OG</q-tooltip>
          <span class="text-weight-bold" style="font-size:11px">OG</span>
        </q-btn>
        <q-btn outline rounded dense label="ADICIONAR" color="amber" icon="mdi-plus" size="md" class="q-pr-sm"
          @click.stop="pickerOpen = true" />
      </template>

      <!-- ── Lista ──────────────────────────────────────────────────────────── -->
      <q-list dense class="q-mt-xs">
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
            <q-item-label style="font-size: 12.5px; color: #e0e0e0; line-height: 1.3">
              {{ f.name }}
              <span v-if="f.supplier" class="text-grey-6" style="font-weight: 400"> {{ f.supplier }}</span>
            </q-item-label>
            <q-item-label caption class="text-grey-7 row items-center no-wrap" style="gap:3px;font-size:10.5px">
              <q-icon :name="typeIcon(f.type)" size="10px" color="amber-8" />
              {{ typeLabel(f.type) }} · {{ f.colorEbc }} EBC
            </q-item-label>
          </q-item-section>
          <!-- pct -->
          <q-item-section side style="padding-left:8px">
            <div class="text-caption text-grey-6">{{ pct(f.amount) }}%</div>
          </q-item-section>
        </q-item>
      </q-list>
      <!-- color bar -->
      <div v-if="recipe.fermentables.length" class="fov-bar q-mt-xs">
        <div v-for="f in sortedFermentables" :key="f.id"
          :style="{ width: pct(f.amount) + '%', background: ebcToHex(f.colorEbc) }" />
      </div>
      <!-- stats -->
      <div v-if="stats" class="text-right q-mt-xs" style="font-size: 11px; color: rgba(255,255,255,0.45)">
        <span style="cursor: help;">
          <span class="q-mr-sx">OG:</span> <strong style="color:#ccc">{{ stats.og.toFixed(3) }}</strong>
          <q-tooltip anchor="center right" self="center left" :offset="[6, 0]" class="sbr-tooltip">
            <div class="text-weight-bold">Original Gravity</div>
            <div class="text-grey-4" style="font-size:11px">Densidade Original</div>
          </q-tooltip>
        </span>
        <span style="cursor: help;">
          <span class="q-mr-sx q-ml-sm">FG:</span> <strong style="color:#ccc">{{ stats.preBoilOg.toFixed(3) }}</strong>
          <q-tooltip anchor="center right" self="center left" :offset="[6, 0]" class="sbr-tooltip">
            <div class="text-weight-bold">Final Gravity</div>
            <div class="text-grey-4" style="font-size:11px">Densidade Final</div>
          </q-tooltip>
        </span>
        <span style="cursor: help;">
          <span class="q-mr-sx q-ml-sm">Cor:</span> <strong style="color:#ccc">{{ stats.ebc.toFixed(1) }} EBC</strong>
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

    <!-- Editar Fermentável -->
    <q-dialog v-model="editDialog">
      <q-card dark class="bg-dark" style="width:440px;max-width:95vw">
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-subtitle1 text-weight-bold text-white">Editar Fermentável</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator dark />
        <q-card-section v-if="editItem" class="q-gutter-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input v-model="editItem.name" outlined dense dark label="Nome" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="editItem.supplier" outlined dense dark label="Fornecedor (opcional)" />
            </div>
            <div class="col-12 col-sm-6">
              <q-select v-model="editItem.type" :options="typeOptions" emit-value map-options outlined dense dark
                options-dark label="Tipo" />
            </div>
            <div class="col-6 col-sm-4">
              <q-input v-model.number="editItem.amount" type="number" step="0.01" outlined dense dark label="Quantidade"
                suffix="kg" />
            </div>
            <div class="col-6 col-sm-4">
              <q-input v-model.number="editItem.colorEbc" type="number" outlined dense dark label="Cor" suffix="EBC" />
            </div>
            <div class="col-6 col-sm-4">
              <q-input v-model.number="editItem.potential" type="number" step="0.1" outlined dense dark label="PPG" />
            </div>
            <div class="col-6 col-sm-6">
              <q-input v-model.number="editItem.yieldPercentage" type="number" step="0.1" outlined dense dark
                label="Rendimento" suffix="%" />
            </div>
            <div class="col-6 col-sm-6">
              <q-select v-model="editItem.use" :options="useOptions" emit-value map-options outlined dense dark
                options-dark label="Uso" />
            </div>
          </div>
        </q-card-section>
        <q-separator dark />
        <q-card-actions class="q-px-md q-pb-md">
          <q-btn flat no-caps label="Remover" color="negative" @click="removeEditItem" />
          <q-space />
          <q-btn flat no-caps label="Cancelar" color="grey-5" v-close-popup />
          <q-btn unelevated no-caps label="Salvar" color="positive" @click="saveEditItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Ajustar Cor da Receita -->
    <q-dialog v-model="colorDialog" persistent>
      <q-card dark class="bg-dark" style="width:480px;max-width:95vw;pointer-events:all">
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-subtitle1 text-weight-bold text-white">Ajustar Cor da Receita</div>
          <q-space />
          <q-btn flat round dense icon="settings" color="grey-5" />
          <q-btn flat round dense icon="close" @click="colorDialog = false" />
        </q-card-section>

        <!-- preview -->
        <q-card-section class="row items-center justify-center q-gutter-xl q-pt-xs">
          <div class="column items-center">
            <div class="text-caption text-grey-5 q-mb-xs">Atual</div>
            <q-icon name="mdi-beer" size="52px" :style="{ color: ebcToHex(stats?.ebc ?? 20) }" />
            <div class="text-caption text-white q-mt-xs">{{ stats?.ebc.toFixed(1) }} EBC</div>
          </div>
          <q-icon name="arrow_forward" color="grey-6" size="20px" />
          <div class="column items-center">
            <div class="text-caption text-grey-5 q-mb-xs">Ajustado</div>
            <q-icon name="mdi-beer" size="52px" :style="{ color: ebcToHex(colorAchieved) }" />
            <div class="text-caption text-white q-mt-xs">{{ colorAchieved.toFixed(1) }} EBC</div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-xs">
          <div class="row items-center q-gutter-sm q-mb-sm">
            <span class="text-caption text-grey-6" style="min-width:44px">2 EBC</span>
            <q-slider v-model="colorTarget" :min="2" :max="99" :step="0.1" color="amber" dark class="col" />
            <span class="text-caption text-grey-6" style="min-width:44px;text-align:right">99 EBC</span>
          </div>
          <q-input v-model.number="colorTarget" type="number" step="0.1" outlined dense dark label="Cor Alvo (EBC)" />
        </q-card-section>

        <q-card-section class="q-pt-xs">
          <div class="text-caption text-grey-5 q-mb-sm">Selecionar Fermentáveis para ajustar</div>
          <q-list dense>
            <q-item v-for="(f, i) in recipe.fermentables" :key="f.id" class="q-px-none q-py-xs">
              <q-item-section side style="padding-right:8px">
                <q-checkbox v-model="colorSelected[i]" dark dense color="positive" />
              </q-item-section>
              <q-item-section side style="min-width:52px;padding-right:8px">
                <div class="text-caption text-grey-4">{{ fmtAmt(f.amount) }}</div>
              </q-item-section>
              <q-item-section side style="min-width:36px;padding-right:8px">
                <div class="text-caption text-grey-6">{{ pct(f.amount) }}%</div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-grey-3" style="font-size:12px">{{ f.name }}</q-item-label>
                <q-item-label caption class="row items-center no-wrap text-grey-7" style="gap:3px;font-size:10.5px">
                  <q-icon name="mdi-barley" size="10px" color="amber-8" />
                  {{ f.colorEbc }} EBC
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator dark />
        <q-card-section class="q-py-sm">
          <div class="row justify-between text-caption text-grey-5">
            <span>Cor Alcançada</span>
            <strong class="text-white">{{ colorAchieved.toFixed(1) }} EBC</strong>
          </div>
          <div class="row justify-between text-caption text-grey-5 q-mt-xs">
            <span>Mudança total da carga de grãos</span>
            <strong class="text-white">{{ colorWeightDelta >= 0 ? '+' : '' }}{{ colorWeightDelta.toFixed(3) }}
              kg</strong>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat no-caps label="CANCELAR" color="grey-5" @click="colorDialog = false" />
          <q-btn unelevated no-caps label="APLICAR ALTERAÇÕES" color="positive" @click="applyColor" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Definir Porcentagens -->
    <q-dialog v-model="pctDialog">
      <q-card dark class="bg-dark"
        style="width:420px;max-width:95vw;max-height:80vh;display:flex;flex-direction:column">
        <q-card-section class="row items-center q-pb-sm" style="flex-shrink:0">
          <div class="text-subtitle1 text-weight-bold text-white">
            Definir Porcentagens
            <span :class="Math.abs(pctTotal - 100) < 0.5 ? 'text-positive' : 'text-negative'">
              {{ pctTotal.toFixed(1) }}%
            </span>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <div style="overflow-y:auto;flex:1 1 0;min-height:0">
          <q-card-section class="q-gutter-sm q-pt-xs">
            <div v-for="(f, i) in recipe.fermentables" :key="f.id">
              <div class="pct-hdr q-pa-sm q-mb-xs rounded-borders">
                <div class="text-caption text-grey-3 text-weight-medium">{{ fmtAmt(f.amount) }}</div>
                <div class="text-caption text-white">{{ f.name }}</div>
                <div v-if="f.supplier" class="text-caption text-grey-5">{{ f.supplier }}</div>
              </div>
              <q-input v-model.number="pctValues[i]" type="number" step="0.1" outlined dense dark prefix="%"
                bg-color="grey-9" />
            </div>
          </q-card-section>
        </div>
        <q-separator dark />
        <q-card-section class="row items-center q-py-sm" style="flex-shrink:0">
          <span class="text-caption text-grey-5">
            TOTAL: <strong class="text-white">{{ totalWeightDisplay.toUpperCase() }}</strong>
          </span>
          <q-space />
          <q-btn unelevated no-caps label="DEFINIR" color="positive" :disable="Math.abs(pctTotal - 100) > 1"
            @click="applyPct" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Redimensionar por OG -->
    <q-dialog v-model="ogDialog">
      <q-card dark class="bg-dark" style="width:320px;max-width:95vw">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-white q-mb-md">
            Digite a Densidade Original
          </div>
          <q-input v-model.number="ogTarget" type="number" step="0.001" min="1.010" max="1.180" outlined dense dark
            :hint="`Atual: ${stats?.og.toFixed(4) ?? '—'}`" />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat no-caps label="CANCELAR" color="grey-5" v-close-popup />
          <q-btn unelevated no-caps label="REDIMENSIONAR" color="positive" @click="applyOg" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <ingredient-picker-dialog v-model="pickerOpen" type="Fermentable" @add="(i) => onAdd(i as RecipeFermentable)" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRecipeStore } from '../../../../stores/recipeStore'
import RecipeSection from '../RecipeSection.vue'
import type { RecipeFermentable, FermentableType } from '../../../../types/recipe'
import IngredientPickerDialog from '../IngredientPickerDialog.vue'
import { calculateEbc } from '../../../../composables/useBrewCalculator'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats = computed(() => store.stats)

const pickerOpen = ref(false)

// ── edit ──
const editDialog = ref(false)
const editItem = ref<RecipeFermentable | null>(null)
let editOrigId = ''

// ── color ──
const colorDialog = ref(false)
const colorTarget = ref(20)
const colorSelected = ref<boolean[]>([])

// ── pct ──
const pctDialog = ref(false)
const pctValues = ref<number[]>([])

// ── og ──
const ogDialog = ref(false)
const ogTarget = ref(1.050)

// ── computed ──
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

const colorScaleFactor = computed(() => {
  if (!colorSelected.value.some(Boolean)) return 1
  let lo = 0, hi = 10, mid = 1
  for (let i = 0; i < 40; i++) {
    mid = (lo + hi) / 2
    const test = recipe.value.fermentables.map((f, idx) => ({
      amount: colorSelected.value[idx] ? f.amount * mid : f.amount,
      colorEbc: f.colorEbc
    }))
    const ebc = calculateEbc(test, recipe.value.batchVolume)
    if (ebc < colorTarget.value) lo = mid; else hi = mid
  }
  return mid
})

const colorAchieved = computed(() => {
  const adj = recipe.value.fermentables.map((f, i) => ({
    amount: colorSelected.value[i] ? f.amount * colorScaleFactor.value : f.amount,
    colorEbc: f.colorEbc
  }))
  return parseFloat(calculateEbc(adj, recipe.value.batchVolume).toFixed(1))
})

const colorWeightDelta = computed(() => {
  const scale = colorScaleFactor.value
  return recipe.value.fermentables.reduce((s, f, i) =>
    colorSelected.value[i] ? s + f.amount * (scale - 1) : s, 0)
})

const pctTotal = computed(() =>
  pctValues.value.reduce((s, v) => s + (v ?? 0), 0)
)

// ── watchers ──
watch(colorDialog, open => {
  if (!open) return
  colorTarget.value = parseFloat((stats.value?.ebc ?? 20).toFixed(1))
  colorSelected.value = recipe.value.fermentables.map(() => true)
})

watch(pctDialog, open => {
  if (!open) return
  pctValues.value = recipe.value.fermentables.map(f => parseFloat(pct(f.amount)))
})

watch(ogDialog, open => {
  if (!open) return
  ogTarget.value = parseFloat((stats.value?.og ?? 1.050).toFixed(4))
})

// ── methods ──
function pct(amount: number): string {
  if (!totalWeight.value) return '0.0'
  return ((amount / totalWeight.value) * 100).toFixed(1)
}

function fmtAmt(kg: number): string {
  if (kg >= 1) return `${parseFloat(kg.toFixed(3))} kg`
  return `${(kg * 1000).toFixed(0)} g`
}

function ebcToHex(ebc: number): string {
  const s = ebc / 1.97
  if (s <= 2) return '#F5F04B'
  if (s <= 4) return '#E3D73A'
  if (s <= 6) return '#CDB832'
  if (s <= 8) return '#B79928'
  if (s <= 10) return '#9F7A20'
  if (s <= 14) return '#8A5C18'
  if (s <= 18) return '#7A4A14'
  if (s <= 22) return '#6A3810'
  if (s <= 28) return '#572C0C'
  if (s <= 35) return '#3E1C07'
  return '#180C04'
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

// edit
function openEdit(f: RecipeFermentable) {
  editOrigId = f.id
  editItem.value = { ...f }
  editDialog.value = true
}
function saveEditItem() {
  if (!editItem.value) return
  const idx = recipe.value.fermentables.findIndex(f => f.id === editOrigId)
  if (idx >= 0) recipe.value.fermentables[idx] = { ...editItem.value }
  editDialog.value = false
}
function removeEditItem() {
  const idx = recipe.value.fermentables.findIndex(f => f.id === editOrigId)
  if (idx >= 0) recipe.value.fermentables.splice(idx, 1)
  editDialog.value = false
}

// picker
function onAdd(item: RecipeFermentable) {
  item.sortOrder = recipe.value.fermentables.length
  recipe.value.fermentables.push(item)
}

// color
function applyColor() {
  const s = colorScaleFactor.value
  recipe.value.fermentables.forEach((f, i) => {
    if (colorSelected.value[i]) f.amount = parseFloat((f.amount * s).toFixed(3))
  })
  colorDialog.value = false
}

// pct
function openPct() {
  pctValues.value = recipe.value.fermentables.map(f => parseFloat(pct(f.amount)))
  pctDialog.value = true
}
function applyPct() {
  const total = totalWeight.value
  recipe.value.fermentables.forEach((f, i) => {
    f.amount = parseFloat(((pctValues.value[i]! / 100) * total).toFixed(3))
  })
  pctDialog.value = false
}

// og
function openOg() {
  ogTarget.value = parseFloat((stats.value?.og ?? 1.050).toFixed(4))
  ogDialog.value = true
}
function applyOg() {
  const cur = stats.value?.og ?? 1.050
  if (cur <= 1) return
  const factor = (ogTarget.value - 1) / (cur - 1)
  recipe.value.fermentables.forEach(f => {
    f.amount = parseFloat((f.amount * factor).toFixed(3))
  })
  ogDialog.value = false
}

const typeOptions = [
  { label: 'Grão', value: 'Grain' },
  { label: 'Açúcar', value: 'Sugar' },
  { label: 'Extrato Seco', value: 'DryExtract' },
  { label: 'Extrato Líquido', value: 'LiquidExtract' },
  { label: 'Mel', value: 'Honey' },
  { label: 'Suco', value: 'Juice' },
  { label: 'Adjunto', value: 'Adjunct' }
]
const useOptions = [
  { label: 'Mostura', value: 'Mash' },
  { label: 'Maceração', value: 'Steep' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Adição Tardia', value: 'LateAddition' }
]
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

.pct-hdr {
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid rgba(255, 180, 50, 0.4);
}

.palette-btn :deep(.q-icon) {
  color: var(--palette-color) !important;
}
</style>
