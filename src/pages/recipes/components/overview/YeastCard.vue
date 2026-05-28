<template>
  <recipe-section
    title="Levedura"
    icon="mdi-test-tube"
    icon-color="deep-purple-4"
  >
    <template #actions>
      <brew-pilot-button variant="outline" round dense icon="mdi-calculator"
        tooltip="Calculadora de Levedura" @click.stop="calcDialog = true" />
      <brew-pilot-button variant="outline" round dense icon="mdi-plus" primary
        class="q-ml-xs" tooltip="Adicionar Levedura" @click.stop="pickerOpen = true" />
    </template>

    <!-- ── Lista ──────────────────────────────────────────────────────────── -->
    <q-list dense class="q-mt-xs">
      <q-item
        v-for="y in recipe.yeasts"
        :key="y.id"
        clickable v-ripple
        class="yeast-row q-px-xs q-py-xs"
        @click="openEdit(y)"
      >
        <q-item-section>
          <q-item-label style="font-size:12.5px;color:#e0e0e0">
            {{ y.name }}
            <span v-if="y.laboratory" class="text-grey-5"> {{ y.laboratory }}</span>
            <q-badge :label="formLabel(y.form)" color="grey-8" text-color="grey-4"
              class="q-ml-xs" style="font-size:9px" />
          </q-item-label>
          <q-item-label caption class="text-grey-6" style="font-size:10.5px">
            {{ y.attenuation }}% atenuação
            · {{ y.packages }} {{ y.form === 'Dry' ? 'pct' : 'unid.' }}
            <template v-if="pitchRateForYeast(y) !== null">
              · <span class="text-amber-9">{{ pitchRateForYeast(y) }} g/L</span>
            </template>
          </q-item-label>
          <q-item-label v-if="cellsForYeast(y)" caption style="font-size:10px;color:rgba(255,255,255,0.3)">
            {{ cellsForYeast(y)!.billions.toFixed(1) }} bil. células
            · {{ cellsForYeast(y)!.millionsPerMl.toFixed(0) }} M/mL
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="stats">
          <div class="text-caption text-grey-5 text-right">
            <div>FG ~{{ stats.fg.toFixed(3) }}</div>
            <div>ABV ~{{ stats.abv.toFixed(1) }}%</div>
          </div>
        </q-item-section>
      </q-item>
      <q-item v-if="!recipe.yeasts.length" class="q-px-xs">
        <q-item-section>
          <div class="text-caption text-grey-7">Nenhuma levedura adicionada</div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- ══════════════════════════════════════════════════════════════════════
         DIALOG: Editar Levedura
    ══════════════════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="editDialog">
      <q-card dark class="bg-dark" style="width:420px;max-width:95vw">
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-subtitle1 text-weight-bold text-white">Editar Levedura</div>
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
              <q-input v-model="editItem.laboratory" outlined dense dark label="Laboratório" />
            </div>
            <div class="col-12 col-sm-6">
              <q-select v-model="editItem.form" :options="formOptions" emit-value map-options
                outlined dense dark options-dark label="Forma" />
            </div>
            <div class="col-6 col-sm-4">
              <q-input v-model.number="editItem.packages" type="number" step="1"
                outlined dense dark label="Qtd" :suffix="editItem.form === 'Dry' ? 'pct' : 'unid.'" />
            </div>
            <div class="col-6 col-sm-4">
              <q-input v-model.number="editItem.attenuation" type="number" step="0.5"
                outlined dense dark label="Atenuação" suffix="%" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="editItem.fermentationTemperature" type="number" step="0.5"
                outlined dense dark label="Temperatura" suffix="°C" />
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

    <!-- ══════════════════════════════════════════════════════════════════════
         DIALOG: Calculadora de Levedura
    ══════════════════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="calcDialog">
      <q-card dark class="bg-dark" style="width:680px;max-width:95vw;max-height:90vh;display:flex;flex-direction:column">
        <q-card-section class="row items-center q-pb-sm" style="flex-shrink:0">
          <q-icon name="mdi-test-tube" color="deep-purple-4" size="20px" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold text-white">
            Taxa de Inoculação / Propagação de Levedura
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator dark />

        <div style="overflow-y:auto;flex:1 1 0;min-height:0">
          <div class="row q-pa-md q-col-gutter-md">

            <!-- ── Painel Esquerdo: Taxa de Inoculação ────────────────── -->
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-5 q-mb-sm" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase">
                Taxa de Inoculação
              </div>

              <!-- Seletor de pitch rate -->
              <q-select v-model="pitchRatePreset"
                :options="pitchRateOptions"
                emit-value map-options
                outlined dense dark options-dark
                label="Taxa de Inoculação"
                class="q-mb-sm"
                @update:model-value="v => { pitchRate = v }" />

              <q-slider v-model="pitchRate" :min="0.25" :max="3.0" :step="0.05"
                label :label-value="`${pitchRate}`"
                color="deep-purple-4" dark class="q-mb-md q-px-sm" />

              <div class="row q-col-gutter-sm q-mb-sm">
                <div class="col-6">
                  <q-input v-model.number="gramsPerPacket" type="number" step="0.5"
                    outlined dense dark label="Gramas por pct" suffix="g" />
                </div>
                <div class="col-6">
                  <q-input v-model.number="cellsPerGram" type="number" step="0.5"
                    outlined dense dark label="Bi. células/grama" />
                </div>
              </div>

              <q-checkbox v-model="withRehydration" dark dense color="positive"
                label="Reidratação" class="q-mb-sm" />

              <!-- Resultado -->
              <div class="calc-result-box q-pa-sm q-mb-sm rounded-borders">
                <div class="text-caption text-grey-4 q-mb-xs">
                  Taxa de inoculação: <strong class="text-white">{{ targetCells.toFixed(0) }} bilhões de células</strong>
                </div>
                <div class="text-caption text-grey-4 q-mb-xs">
                  Leveduras para usar:
                  <strong class="text-white">
                    {{ packagesNeeded }} pct ({{ packagesNeeded }}) ou {{ gramsNeeded }} g
                  </strong>
                </div>
                <q-btn unelevated no-caps label="SALVAR QUANTIDADE"
                  color="positive" size="sm" class="full-width q-mt-xs"
                  @click="saveYeastQuantity" />
              </div>

              <div class="text-caption text-grey-7" style="font-size:10.5px">
                {{ Math.round(actualCellsPerMl) }} milhões células / ml<br>
                {{ actualTotalCells.toFixed(0) }} bilhões de células totais<br>
                Diferença do alvo:
                <span :class="cellDiff >= 0 ? 'text-positive' : 'text-negative'">
                  {{ cellDiff >= 0 ? '+' : '' }}{{ cellDiff.toFixed(0) }} bilhões
                </span>
              </div>
            </div>

            <!-- ── Painel Direito: Propagação ─────────────────────────── -->
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-5 q-mb-sm" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase">
                Propagação de Levedura
              </div>

              <div class="row items-center q-col-gutter-sm q-mb-sm">
                <div class="col-6">
                  <q-input v-model.number="starterInitial" type="number" step="0.1"
                    outlined dense dark label="Início" />
                </div>
                <div class="col-6">
                  <q-select v-model="starterUnit"
                    :options="[{ label: 'Pacotes', value: 'packets' }, { label: 'Bilhões', value: 'billion' }]"
                    emit-value map-options
                    outlined dense dark options-dark label="Unidade" />
                </div>
              </div>

              <q-input v-model.number="starterExcess" type="number" step="1"
                outlined dense dark label="Excedente (bi. de células)" class="q-mb-sm" />

              <q-select v-model="starterModel"
                :options="starterModelOptions"
                emit-value map-options
                outlined dense dark options-dark
                label="Modelo da Fórmula de Propagação"
                class="q-mb-sm" />

              <q-checkbox v-model="calcStarterSize" dark dense color="positive"
                label="Calcular tamanho do starter" class="q-mb-sm" />

              <div class="row q-col-gutter-sm q-mb-sm">
                <div class="col-6">
                  <q-input v-model.number="starterGravity" type="number" step="0.001"
                    outlined dense dark label="Densidade" prefix="SG"
                    :disable="calcStarterSize" />
                </div>
                <div class="col-6">
                  <q-input :model-value="calcStarterSize ? starterVolume.toFixed(1) : starterVolManual"
                    @update:model-value="v => { if (!calcStarterSize) starterVolManual = +(v ?? 1) }"
                    type="number" step="0.1"
                    outlined dense dark label="Tamanho" suffix="L"
                    :disable="calcStarterSize" />
                </div>
              </div>

              <!-- Resultado propagação -->
              <div class="calc-prop-box q-pa-sm q-mb-sm rounded-borders">
                <div class="text-caption text-weight-bold text-white q-mb-xs">
                  {{ calcStarterSize ? starterVolume.toFixed(1) : starterVolManual }} L starter
                  com {{ starterDme.toFixed(0) }} g DME
                </div>
                <div class="text-caption text-grey-3">
                  Nova contagem: <strong class="text-white">{{ finalCells.toFixed(0) }} bilhões de células</strong>
                </div>
                <div class="text-caption text-grey-6" style="font-size:10.5px">
                  {{ cellDiffStarter >= 0 ? '+' : '' }}{{ cellDiffStarter.toFixed(0) }} bilhões versus alvo da taxa de inoculação
                </div>
                <div class="row q-gutter-xs q-mt-sm">
                  <q-btn unelevated no-caps label="SALVAR PROPAGAÇÃO"
                    color="positive" size="sm" class="col"
                    @click="savePropagation" />
                  <q-btn unelevated no-caps label="REMOVER PROPAGAÇÃO"
                    color="amber-9" size="sm" class="col"
                    @click="removePropagation" />
                </div>
              </div>

              <div class="text-caption text-grey-7" style="font-size:10.5px">
                Taxa de Inoculação: {{ inoculationRateActual.toFixed(0) }} M células / ml<br>
                Taxa Pós-Propagação: {{ propagationRate.toFixed(0) }} M células / ml<br>
                Fator de Crescimento: {{ growthFactor.toFixed(2) }}<br>
                <br>
                Extrato de Malte Seco (DME) 44 ppg<br>
                Extrato de Malte Líquido (LME) {{ (starterDme * 1.23).toFixed(0) }} g 36 ppg
              </div>

              <div class="row q-gutter-sm q-mt-sm">
                <q-btn outline no-caps label="ADICIONAR ETAPA" color="grey-5" size="sm" class="col" />
                <q-btn outline no-caps label="REMOVER ETAPA" color="negative" size="sm" class="col" />
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>

    <yeast-picker-dialog v-model="pickerOpen" @add="onAdd" />
  </recipe-section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import RecipeSection from '../RecipeSection.vue'
import BrewPilotButton from '@/components/shared/BrewPilotButton.vue'
import type { RecipeYeast, YeastForm } from '@/types/recipe'
import YeastPickerDialog from '../pickers/YeastPickerDialog.vue'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats   = computed(() => store.stats)

const pickerOpen  = ref(false)
const editDialog  = ref(false)
const editItem    = ref<RecipeYeast | null>(null)
let   editOrigId  = ''

// calculator
const calcDialog     = ref(false)
const pitchRate      = ref(0.75)
const pitchRatePreset = ref(0.75)
const gramsPerPacket = ref(11.5)
const cellsPerGram   = ref(6)
const withRehydration = ref(false)

// starter
const starterInitial    = ref(3.3)
const starterUnit       = ref<'packets' | 'billion'>('packets')
const starterExcess     = ref(0)
const starterModel      = ref('stirplate')
const calcStarterSize   = ref(true)
const starterGravity    = ref(1.036)
const starterVolManual  = ref(3.6)

// ── computed ──

// Plato from OG
const plato = computed(() => {
  const og = stats.value?.og ?? 1.050
  return (og - 1) * 1000 / 4
})

// Target cells in billions: pitch_rate × volume_L × Plato
const targetCells = computed(() =>
  pitchRate.value * recipe.value.batchVolume * plato.value
)

// Actual cells from selected yeast in recipe
const firstYeast = computed(() => recipe.value.yeasts[0])

const packagesNeeded = computed(() => {
  const cellsNeeded = targetCells.value
  const cellsPerPkt = gramsPerPacket.value * cellsPerGram.value
  return Math.ceil(cellsNeeded / cellsPerPkt)
})

const gramsNeeded = computed(() => {
  const cellsNeeded = targetCells.value
  return Math.ceil(cellsNeeded / cellsPerGram.value)
})

const actualTotalCells = computed(() => {
  if (!firstYeast.value) return 0
  const pkts = firstYeast.value.packages
  if (firstYeast.value.form === 'Dry') {
    return pkts * gramsPerPacket.value * cellsPerGram.value * (withRehydration.value ? 1.1 : 1)
  }
  // liquid: ~100B per packet
  return pkts * 100
})

const actualCellsPerMl = computed(() => {
  const vol = recipe.value.batchVolume * 1000  // L → mL
  return (actualTotalCells.value * 1000) / vol
})

const cellDiff = computed(() => actualTotalCells.value - targetCells.value)

// Starter initial cells
const starterInitialCells = computed(() => {
  if (starterUnit.value === 'packets') {
    if (firstYeast.value?.form === 'Dry') {
      return starterInitial.value * gramsPerPacket.value * cellsPerGram.value
    }
    return starterInitial.value * 100  // liquid
  }
  return starterInitial.value
})

// Growth factor (Braukaiser stirplate model)
const growthFactor = computed(() => {
  const initB = starterInitialCells.value + starterExcess.value
  const vol = calcStarterSize.value ? starterVolume.value : starterVolManual
  const volMl = (typeof vol === 'number' ? vol : (vol as { value: number }).value) * 1000
  if (!initB || !volMl) return 1
  const ir = initB / volMl  // B/mL → M/mL = * 1000
  const irM = ir * 1000     // million cells/mL
  const ln = Math.log(irM > 0 ? irM : 0.001)
  if (starterModel.value === 'stirplate') return Math.max(1, 0.74 * ln + 1.4)
  if (starterModel.value === 'shake')     return Math.max(1, 0.65 * ln + 1.25)
  return Math.max(1, 0.40 * ln + 1.0)
})

// Optimal starter volume for target cells (solve numerically)
const starterVolume = computed(() => {
  const target = targetCells.value
  const init   = starterInitialCells.value + starterExcess.value
  if (!init || !target) return 1.0
  // Simplified: V = (target / init - 1) / 1.03 (linear approx)
  const need = target / init
  if (need <= 1) return 0.5
  const vol = (need - 1) / 1.5  // rough
  return Math.max(0.25, Math.min(10, parseFloat(vol.toFixed(2))))
})

const finalCells = computed(() => {
  const init = starterInitialCells.value + starterExcess.value
  return init * growthFactor.value
})

const cellDiffStarter = computed(() => finalCells.value - targetCells.value)

// DME needed for starter (1 gram DME per 10mL at 1.040)
const starterDme = computed(() => {
  const vol = calcStarterSize.value ? starterVolume.value : starterVolManual
  const v = typeof vol === 'number' ? vol : (vol as { value: number }).value
  // DME: gravity points needed = (SG - 1) × 1000 × volume_L
  const gp = (starterGravity.value - 1) * 1000 * v
  return gp / 44 * 454 / 1000 * 1000  // simplified: ~88g DME per L at 1.040
})

const inoculationRateActual = computed(() => {
  const vol = recipe.value.batchVolume * 1000
  return (targetCells.value * 1000) / vol
})

const propagationRate = computed(() => {
  const vol = recipe.value.batchVolume * 1000
  return (finalCells.value * 1000) / vol
})

// ── methods ──
function formLabel(form: YeastForm): string {
  const m: Record<YeastForm, string> = { Dry: 'Seca', Liquid: 'Líquida', Slurry: 'Lama' }
  return m[form] ?? form
}

// Pitch rate em g/L (apenas para levedura seca com cellsPerGram conhecido)
function pitchRateForYeast(y: RecipeYeast): string | null {
  const vol = recipe.value.batchVolume
  if (!vol) return null
  const totalG = y.packages * (y.form === 'Dry' ? 11.5 : 0)  // 11.5g por sachê padrão
  if (!totalG) return null
  return (totalG / vol).toFixed(2)
}

// Bilhões de células totais e M/mL
function cellsForYeast(y: RecipeYeast): { billions: number; millionsPerMl: number } | null {
  const vol = recipe.value.batchVolume
  if (!vol) return null
  // Dry yeast: ~6-10 bilhões/g. Liquid: ~100 bi/embalagem (vials/pouches)
  let billions = 0
  if (y.form === 'Dry') {
    const cpg = y.cellsPerGram ?? 8  // bilhões/g
    billions = y.packages * 11.5 * cpg
  } else {
    billions = y.packages * 100
  }
  if (!billions) return null
  const millionsPerMl = (billions * 1000) / (vol * 1000)
  return { billions, millionsPerMl }
}

function openEdit(y: RecipeYeast) {
  editOrigId = y.id
  editItem.value = { ...y }
  editDialog.value = true
}
function saveEditItem() {
  if (!editItem.value) return
  const idx = recipe.value.yeasts.findIndex(y => y.id === editOrigId)
  if (idx >= 0) recipe.value.yeasts[idx] = { ...editItem.value }
  editDialog.value = false
}
function removeEditItem() {
  const idx = recipe.value.yeasts.findIndex(y => y.id === editOrigId)
  if (idx >= 0) recipe.value.yeasts.splice(idx, 1)
  editDialog.value = false
}
function onAdd(item: RecipeYeast) {
  recipe.value.yeasts.push(item)
}

function saveYeastQuantity() {
  if (firstYeast.value) {
    firstYeast.value.packages = packagesNeeded.value
  }
}

function savePropagation() {
  if (firstYeast.value) {
    firstYeast.value.starterVolume = calcStarterSize.value ? starterVolume.value : starterVolManual.value
    firstYeast.value.starterGravity = starterGravity.value
  }
  calcDialog.value = false
}

function removePropagation() {
  if (firstYeast.value) {
    firstYeast.value.starterVolume = undefined
    firstYeast.value.starterGravity = undefined
  }
}

const pitchRateOptions = [
  { label: '0.35 — Ale muito leve (< 1.040)', value: 0.35 },
  { label: '0.75 — Ale até 1.060',             value: 0.75 },
  { label: '1.00 — Ale alta gravidade',         value: 1.00 },
  { label: '1.50 — Lager até 1.060',            value: 1.50 },
  { label: '2.00 — Lager alta gravidade',       value: 2.00 }
]

const starterModelOptions = [
  { label: 'Sem Agitação',              value: 'nostir' },
  { label: 'Agitação Intermitente',     value: 'shake' },
  { label: 'Com Agitação (Braukaiser)', value: 'stirplate' }
]

const formOptions = [
  { label: 'Seca',    value: 'Dry' },
  { label: 'Líquida', value: 'Liquid' },
  { label: 'Lama',    value: 'Slurry' }
]
</script>

<style scoped>
.yeast-row { border-radius: 4px; transition: background 0.12s; }
.yeast-row:hover { background: rgba(255,255,255,0.05); }

.calc-result-box {
  background: rgba(76, 175, 80, 0.12);
  border: 1px solid rgba(76, 175, 80, 0.3);
}
.calc-prop-box {
  background: rgba(76, 175, 80, 0.12);
  border: 1px solid rgba(76, 175, 80, 0.3);
}
</style>
