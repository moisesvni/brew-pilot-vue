<template>
  <recipe-section
    title="Água"
    icon="water_drop"
    icon-color="light-blue-5"
    :badge="phOk ? `pH ${estimatedPh.toFixed(2)}` : `pH ${estimatedPh.toFixed(2)} ⚠`"
  >
    <template #actions>
      <brew-pilot-button variant="outline" round dense icon="help_outline"
        tooltip="Os volumes mostrados são para a calculadora de água. Para ajustar a quantidade, edite o perfil de equipamento."
        @click.stop />
      <brew-pilot-button variant="outline" round dense icon="mdi-calculator"
        tooltip="Abre a calculadora de água" @click.stop="waterDialog = true" />
    </template>

    <!-- ── Corpo estilo Brewfather: volumes (esq) + perfil iônico (dir) ──── -->
    <div class="row q-col-gutter-md">

      <!-- Coluna volumes -->
      <div class="col-12 col-sm-6" style="font-size:12px; line-height:1.8">
        <div>
          <span style="color: var(--bp-text-secondary)">Água de mostura</span>
          <strong class="q-ml-xs" style="color: var(--bp-water-value)">{{ mashWaterVol.toFixed(2) }} L</strong>
        </div>
        <div>
          <span style="color: var(--bp-text-secondary)">Água de lavagem</span>
          <strong class="q-ml-xs" style="color: var(--bp-water-value)">{{ spargeWaterVol.toFixed(2) }} L</strong>
        </div>
        <div>
          <span style="color: var(--bp-text-secondary)">Água total</span>
          <strong class="q-ml-xs" style="color: var(--bp-water-value)">{{ totalVolume.toFixed(2) }} L</strong>
        </div>
        <div>
          <span style="color: var(--bp-text-secondary)">Volume da mostura</span>
          <strong class="q-ml-xs" style="color: var(--bp-water-value)">{{ mashVolume.toFixed(2) }} L</strong>
          <span style="color: var(--bp-text-muted); font-size:10px"> (água + grãos)</span>
        </div>
      </div>

      <!-- Coluna perfil iônico -->
      <div class="col-12 col-sm-6">
        <div class="text-caption text-weight-medium text-grey-3 q-mb-xs">
          {{ targetWater ? targetWater.name : sourceWater.name }}
        </div>
        <div class="row q-col-gutter-xs" style="font-size:11px; color: var(--bp-text-secondary)">
          <div class="col-4">Ca²⁺ <strong style="color: var(--bp-water-value)">{{ totalIons.calcium.toFixed(0) }}</strong></div>
          <div class="col-4">Mg²⁺ <strong style="color: var(--bp-water-value)">{{ totalIons.magnesium.toFixed(0) }}</strong></div>
          <div class="col-4">Na⁺ <strong style="color: var(--bp-water-value)">{{ totalIons.sodium.toFixed(0) }}</strong></div>
          <div class="col-4">Cl⁻ <strong style="color: var(--bp-water-value)">{{ totalIons.chloride.toFixed(0) }}</strong></div>
          <div class="col-4">SO₄²⁻ <strong style="color: var(--bp-water-value)">{{ totalIons.sulfate.toFixed(0) }}</strong></div>
          <div class="col-4">HCO₃⁻ <strong style="color: var(--bp-water-value)">{{ totalIons.bicarbonate.toFixed(0) }}</strong></div>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════════════════════════════════
         DIALOG: Calculadora de Água
    ══════════════════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="waterDialog">
      <q-card dark class="bg-dark water-dialog">
        <div class="row items-center no-wrap q-py-sm q-px-md" style="flex-shrink:0">
          <span class="text-subtitle1 text-weight-bold" :class="phOk ? 'text-white' : 'text-red-4'">
            Água pH {{ estimatedPh.toFixed(2) }}
          </span>
          <q-space />
          <q-btn flat round dense icon="help_outline" color="grey-5">
            <q-tooltip>Os volumes de mostura/lavagem são baseados no perfil de equipamento.</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="settings" color="grey-5" />
          <q-btn flat round dense icon="close" v-close-popup />
        </div>
        <q-separator dark />

        <div style="overflow-y:auto;flex:1 1 0;min-height:0;padding:12px 16px">

          <!-- Nota sobre volumes -->
          <div class="text-caption text-grey-6 q-mb-md" style="font-size:11px">
            As quantidades água de mostura e lavagem abaixo são <strong class="text-grey-4">somente</strong>
            utilizadas para a calculadora de água. Para ajustar a quantidade de água calculada, edite
            seu perfil de equipamento.
          </div>

          <!-- Volumes -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input v-model.number="mashWaterVol" type="number" step="0.1"
                outlined dense dark label="Água de Mostura" suffix="L" />
            </div>
            <div class="col-6">
              <q-input v-model.number="spargeWaterVol" type="number" step="0.1"
                outlined dense dark label="Água de Lavagem" suffix="L" />
            </div>
          </div>

          <!-- Origem -->
          <div class="water-section q-mb-md">
            <div class="row items-center no-wrap q-mb-xs">
              <q-icon name="water_drop" color="light-blue-5" size="14px" class="q-mr-xs" />
              <span class="text-caption text-grey-5 col">Origem</span>
              <q-btn flat round dense size="xs" icon="mdi-swap-horizontal" color="grey-6"
                @click="showSourcePicker = !showSourcePicker" />
            </div>
            <div class="profile-chip q-pa-sm rounded-borders cursor-pointer"
              @click="showSourcePicker = !showSourcePicker">
              <div class="text-caption text-weight-medium text-grey-3 q-mb-xs">{{ sourceWater.name }}</div>
              <div class="mineral-row text-caption text-grey-5">
                <span>Ca²⁺ <strong class="text-grey-3">{{ sourceWater.calcium }}</strong></span>
                <span>Mg²⁺ <strong class="text-grey-3">{{ sourceWater.magnesium }}</strong></span>
                <span>Na⁺ <strong class="text-grey-3">{{ sourceWater.sodium }}</strong></span>
                <span>Cl⁻ <strong class="text-grey-3">{{ sourceWater.chloride }}</strong></span>
                <span>SO₄²⁻ <strong class="text-grey-3">{{ sourceWater.sulfate }}</strong></span>
                <span>HCO₃⁻ <strong class="text-grey-3">{{ sourceWater.bicarbonate }}</strong></span>
              </div>
            </div>
          </div>

          <!-- Perfil Alvo -->
          <div class="water-section q-mb-md">
            <div class="row items-center no-wrap q-mb-xs">
              <q-icon name="mdi-target" color="primary" size="14px" class="q-mr-xs" />
              <span class="text-caption text-grey-5 col">Perfil Alvo (opcional)</span>
              <q-btn flat dense no-caps size="xs" label="REMOVER" color="grey-6"
                @click="targetWater = null" />
              <q-btn flat round dense size="xs" icon="mdi-swap-horizontal" color="grey-6"
                @click="showTargetPicker = !showTargetPicker" />
            </div>
            <div v-if="targetWater" class="profile-chip q-pa-sm rounded-borders">
              <div class="text-caption text-weight-medium text-grey-3 q-mb-xs">{{ targetWater.name }}</div>
              <div class="mineral-row text-caption text-grey-5">
                <span>Ca²⁺ <strong class="text-amber">{{ targetWater.calcium }}</strong></span>
                <span>Mg²⁺ <strong class="text-amber">{{ targetWater.magnesium }}</strong></span>
                <span>Na⁺ <strong class="text-amber">{{ targetWater.sodium }}</strong></span>
                <span>Cl⁻ <strong class="text-amber">{{ targetWater.chloride }}</strong></span>
                <span>SO₄²⁻ <strong class="text-amber">{{ targetWater.sulfate }}</strong></span>
                <span>HCO₃⁻ <strong class="text-amber">{{ targetWater.bicarbonate }}</strong></span>
              </div>
              <div class="text-caption text-grey-7 q-mt-xs" style="font-size:10px">
                O perfil alvo é usado quando se trabalha com o botão de auto-ajuste.
              </div>
            </div>
            <div v-else class="text-caption text-grey-7">Nenhum perfil alvo selecionado</div>
          </div>

          <!-- Picker de perfis pré-definidos -->
          <div v-if="showSourcePicker || showTargetPicker" class="water-section q-mb-md">
            <div class="text-caption text-grey-5 q-mb-sm">Selecionar perfil</div>
            <q-list dense>
              <q-item v-for="p in waterProfiles" :key="p.name" clickable v-ripple
                class="rounded-borders q-mb-xs"
                style="background:rgba(255,255,255,0.04)"
                @click="selectProfile(p)">
                <q-item-section>
                  <q-item-label class="text-grey-3" style="font-size:12px">{{ p.name }}</q-item-label>
                  <q-item-label caption class="text-grey-6" style="font-size:10.5px">
                    Ca²⁺{{ p.calcium }} Mg²⁺{{ p.magnesium }} Na⁺{{ p.sodium }}
                    Cl⁻{{ p.chloride }} SO₄²⁻{{ p.sulfate }} HCO₃⁻{{ p.bicarbonate }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- pH da Mostura -->
          <div class="water-section q-mb-md">
            <div class="row items-center no-wrap q-mb-sm">
              <q-icon name="mdi-ph" color="red-4" size="14px" class="q-mr-xs" />
              <span class="text-caption" :class="phOk ? 'text-grey-4' : 'text-red-4'">
                pH da Mostura {{ estimatedPh.toFixed(2) }}
              </span>
              <q-space />
              <q-btn flat round dense size="xs" icon="settings" color="grey-6" />
              <q-btn flat dense no-caps size="xs" label="REDEFINIR" color="grey-6"
                @click="resetMinerals" />
              <q-btn flat dense no-caps size="xs" label="AUTO" color="grey-5"
                @click="autoAdjust" />
            </div>

            <!-- Adição de minerais -->
            <div class="row q-col-gutter-sm">
              <div v-for="m in mineralFields" :key="m.key" class="col-6 col-sm-4">
                <div class="mineral-input-box q-pa-xs rounded-borders">
                  <div class="text-caption text-grey-5 q-mb-xs" style="font-size:10px">{{ m.label }}</div>
                  <div class="text-caption text-grey-6" style="font-size:9.5px">{{ m.compound }}</div>
                  <q-input
                    :model-value="minerals[m.key]"
                    @update:model-value="v => { minerals[m.key] = +(v ?? 0) }"
                    type="number" step="0.01" min="0"
                    borderless dense dark
                    input-class="text-right text-white" style="font-size:13px"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Resultado iónico total -->
          <div class="water-section q-mb-sm">
            <div class="text-caption text-grey-5 q-mb-xs">Perfil Resultante (ppm)</div>
            <div class="mineral-row text-caption text-grey-4">
              <span>Ca²⁺ <strong class="text-white">{{ totalIons.calcium.toFixed(0) }}</strong></span>
              <span>Mg²⁺ <strong class="text-white">{{ totalIons.magnesium.toFixed(0) }}</strong></span>
              <span>Na⁺ <strong class="text-white">{{ totalIons.sodium.toFixed(0) }}</strong></span>
              <span>Cl⁻ <strong class="text-white">{{ totalIons.chloride.toFixed(0) }}</strong></span>
              <span>SO₄²⁻ <strong class="text-white">{{ totalIons.sulfate.toFixed(0) }}</strong></span>
              <span>HCO₃⁻ <strong class="text-white">{{ totalIons.bicarbonate.toFixed(0) }}</strong></span>
            </div>
            <div class="row q-mt-xs" style="font-size:11px;color:rgba(255,255,255,0.4)">
              <span>Cl⁻/SO₄²⁻:
                <strong style="color:#ccc">{{ (totalIons.chloride / (totalIons.sulfate || 1)).toFixed(2) }}</strong>
                ({{ clSoRatio }})
              </span>
            </div>
          </div>
        </div>

        <q-separator dark />
        <div class="row items-center q-px-md q-py-sm" style="flex-shrink:0">
          <q-btn flat no-caps label="Salvar" color="positive" @click="saveWater" />
          <q-space />
          <q-btn flat no-caps label="Fechar" color="grey-5" v-close-popup />
        </div>
      </q-card>
    </q-dialog>
  </recipe-section>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import RecipeSection from '../RecipeSection.vue'
import BrewPilotButton from '@/components/shared/BrewPilotButton.vue'
import type { WaterProfile, WaterMinerals } from '@/types/recipe'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats   = computed(() => store.stats)

// ── Water profiles (must be before reactive refs) ──
const waterProfiles: WaterProfile[] = [
  { name: 'Destilada / RO',  calcium: 0,   magnesium: 0,  sodium: 0,  chloride: 0,   sulfate: 0,   bicarbonate: 0 },
  { name: 'Padrão',          calcium: 10,  magnesium: 4,  sodium: 7,  chloride: 12,  sulfate: 10,  bicarbonate: 27 },
  { name: 'Equilibrada',     calcium: 80,  magnesium: 5,  sodium: 25, chloride: 75,  sulfate: 80,  bicarbonate: 100 },
  { name: 'Burton (Bitter)', calcium: 295, magnesium: 45, sodium: 55, chloride: 25,  sulfate: 725, bicarbonate: 270 },
  { name: 'Dublin (Stout)',  calcium: 118, magnesium: 4,  sodium: 12, chloride: 19,  sulfate: 54,  bicarbonate: 319 },
  { name: 'Munich (Lager)',  calcium: 77,  magnesium: 17, sodium: 4,  chloride: 8,   sulfate: 18,  bicarbonate: 295 },
  { name: 'Pilsen',          calcium: 10,  magnesium: 3,  sodium: 3,  chloride: 4,   sulfate: 4,   bicarbonate: 25  },
  { name: 'Dortmund',        calcium: 225, magnesium: 40, sodium: 60, chloride: 60,  sulfate: 120, bicarbonate: 180 }
]

const waterDialog      = ref(false)
const showSourcePicker = ref(false)
const showTargetPicker = ref(false)

// ── Water volumes (derived from equipment) ──
const mashWaterVol  = ref(recipe.value.batchVolume * 2.8)
const spargeWaterVol = ref(recipe.value.batchVolume * 1.2)

// ── Profiles ──
const sourceWater = ref<WaterProfile>(
  recipe.value.sourceWater ?? waterProfiles[0]!
)
const targetWater = ref<WaterProfile | null>(
  recipe.value.targetWater ?? null
)

// ── Minerals (grams) ──
const minerals = reactive<Record<string, number>>({
  gypsum:           recipe.value.waterMinerals?.gypsum           ?? 0,
  calciumChloride:  recipe.value.waterMinerals?.calciumChloride  ?? 0,
  magnesiumSulfate: recipe.value.waterMinerals?.magnesiumSulfate ?? 0,
  calciumHydroxide: recipe.value.waterMinerals?.calciumHydroxide ?? 0,
  sodiumBicarbonate:recipe.value.waterMinerals?.sodiumBicarbonate?? 0
})

// ── Computed ──
const hasMinerals = computed(() =>
  Object.values(minerals).some(v => v > 0)
)

const mineralDisplay = computed(() => {
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(minerals)) {
    if (v > 0) out[k] = v
  }
  return out
})

const totalVolume = computed(() => mashWaterVol.value + spargeWaterVol.value)

// Volume da mostura = água + deslocamento dos grãos (aprox 0.65 L/kg)
const mashVolume = computed(() => {
  const grainKg = stats.value?.totalGrainWeight ?? 0
  return mashWaterVol.value + grainKg * 0.65
})

// Mineral contributions to ppm (per liter)
const ionContribs = computed(() => {
  const V = totalVolume.value
  if (!V) return { calcium: 0, magnesium: 0, sodium: 0, chloride: 0, sulfate: 0, bicarbonate: 0 }

  // Conversion factors (g/L → ppm for each mineral per ion)
  // CaSO4 (gypsum 172.17 g/mol): Ca 40.08, SO4 96.06
  const gypsum = minerals['gypsum']! / V
  // CaCl2 (110.98): Ca 40.08, Cl 35.45 × 2 = 70.90
  const cacl2  = minerals['calciumChloride']! / V
  // MgSO4 (120.37): Mg 24.31, SO4 96.06
  const mgso4  = minerals['magnesiumSulfate']! / V
  // Ca(OH)2 (74.09): Ca 40.08, OH 2×17 = 34 → raises pH
  const caoh2  = minerals['calciumHydroxide']! / V
  // NaHCO3 (84.01): Na 22.99, HCO3 61.02
  const nahco3 = minerals['sodiumBicarbonate']! / V

  const caFromGypsum  = gypsum  * (40.08 / 172.17) * 1000
  const so4FromGypsum = gypsum  * (96.06 / 172.17) * 1000
  const caFromCacl2   = cacl2   * (40.08 / 110.98) * 1000
  const clFromCacl2   = cacl2   * (70.90 / 110.98) * 1000
  const mgFromMgso4   = mgso4   * (24.31 / 120.37) * 1000
  const so4FromMgso4  = mgso4   * (96.06 / 120.37) * 1000
  const caFromCaoh2   = caoh2   * (40.08 / 74.09)  * 1000
  const naFromNahco3  = nahco3  * (22.99 / 84.01)  * 1000
  const hco3FromNahco3 = nahco3 * (61.02 / 84.01)  * 1000

  return {
    calcium:     sourceWater.value.calcium     + caFromGypsum + caFromCacl2 + caFromCaoh2,
    magnesium:   sourceWater.value.magnesium   + mgFromMgso4,
    sodium:      sourceWater.value.sodium      + naFromNahco3,
    chloride:    sourceWater.value.chloride    + clFromCacl2,
    sulfate:     sourceWater.value.sulfate     + so4FromGypsum + so4FromMgso4,
    bicarbonate: sourceWater.value.bicarbonate + hco3FromNahco3
  }
})

const totalIons = ionContribs

// Mash pH estimation (simplified Kai Troester / Bru'n Water model)
const estimatedPh = computed(() => {
  const { calcium, magnesium, bicarbonate } = totalIons.value
  // Residual alkalinity in mEq/L
  const ra = (bicarbonate / 61) - (calcium / 50 / 1.4) - (magnesium / 50 / 1.7)
  // Base pH for average pale grain bill ≈ 5.72 + RA contribution
  const basePh = 5.72
  const phAdjust = ra * 0.03
  return Math.min(7.5, Math.max(4.5, basePh + phAdjust))
})

const phOk = computed(() => {
  const ph = estimatedPh.value
  return ph >= 5.2 && ph <= 5.5
})

const clSoRatio = computed(() => {
  const cl = totalIons.value.chloride
  const so = totalIons.value.sulfate
  if (!so) return '—'
  const r = cl / so
  if (r < 0.5) return 'Amargo'
  if (r > 1.5) return 'Suave/Maltado'
  return 'Equilibrado'
})

// ── Methods ──
function selectProfile(p: WaterProfile) {
  if (showSourcePicker.value) {
    sourceWater.value = { ...p }
    showSourcePicker.value = false
  } else if (showTargetPicker.value) {
    targetWater.value = { ...p }
    showTargetPicker.value = false
  }
}

function resetMinerals() {
  for (const k of Object.keys(minerals)) minerals[k] = 0
}

function autoAdjust() {
  if (!targetWater.value) return
  const target = targetWater.value
  const source = sourceWater.value
  const V = totalVolume.value

  // Simple approach: target Ca2+ difference → add gypsum or CaCl2
  const caDiff = (target.calcium - source.calcium) * V / 1000  // g
  const so4Diff = (target.sulfate - source.sulfate) * V / 1000
  const clDiff  = (target.chloride - source.chloride) * V / 1000
  const hco3Diff = (target.bicarbonate - source.bicarbonate) * V / 1000

  // Gypsum first for SO4 / Ca
  const gypsumG = Math.max(0, so4Diff / (96.06 / 172.17) / 1000)
  minerals['gypsum'] = parseFloat(gypsumG.toFixed(2))

  // CaCl2 for Cl
  const cacl2G = Math.max(0, clDiff / (70.90 / 110.98) / 1000)
  minerals['calciumChloride'] = parseFloat(cacl2G.toFixed(2))

  // NaHCO3 for bicarbonate
  const nahco3G = Math.max(0, hco3Diff / (61.02 / 84.01) / 1000)
  minerals['sodiumBicarbonate'] = parseFloat(nahco3G.toFixed(2))
}

function saveWater() {
  recipe.value.sourceWater = { ...sourceWater.value }
  if (targetWater.value) recipe.value.targetWater = { ...targetWater.value }
  recipe.value.waterMinerals = {
    gypsum:            minerals['gypsum']!,
    calciumChloride:   minerals['calciumChloride']!,
    magnesiumSulfate:  minerals['magnesiumSulfate']!,
    calciumHydroxide:  minerals['calciumHydroxide']!,
    sodiumBicarbonate: minerals['sodiumBicarbonate']!
  } as WaterMinerals
  waterDialog.value = false
}

// ── Static data ──
const mineralFields = [
  { key: 'gypsum',            label: 'Sulfato de Cálcio',   compound: 'CaSO₄' },
  { key: 'calciumChloride',   label: 'Cloreto de Cálcio',   compound: 'CaCl₂' },
  { key: 'magnesiumSulfate',  label: 'Sulfato de Magnésio', compound: 'MgSO₄' },
  { key: 'calciumHydroxide',  label: 'Hidróxido de Cálcio', compound: 'Ca(OH)₂' },
  { key: 'sodiumBicarbonate', label: 'Bicarbonato de Sódio', compound: 'NaHCO₃' }
]

const mineralLabels: Record<string, string> = {
  gypsum: 'CaSO₄', calciumChloride: 'CaCl₂',
  magnesiumSulfate: 'MgSO₄', calciumHydroxide: 'Ca(OH)₂',
  sodiumBicarbonate: 'NaHCO₃'
}


</script>

<style scoped>
.water-dialog {
  width: 540px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.water-section { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 8px 10px; }
.profile-chip  { background: rgba(255,255,255,0.06); }
.mineral-row   { display: flex; flex-wrap: wrap; gap: 4px 14px; }
.mineral-chip  { background: rgba(255,255,255,0.06); border-radius: 4px; padding: 2px 6px; }
.mineral-input-box {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
}
</style>
