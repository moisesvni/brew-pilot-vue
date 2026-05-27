<template>
  <!-- ── Perfil de Mostura ─────────────────────────────────────────────────── -->
  <recipe-section
    v-if="section === 'mash'"
    title="Perfil de Mostura"
    :badge="mashProfileName"
    icon="mdi-thermometer"
    icon-color="orange-6"
  >
    <template #actions>
      <brew-pilot-button variant="outline" round dense icon="mdi-swap-horizontal"
        tooltip="Alterar perfil de mostura" @click.stop="changeMashDialog = true" />
      <brew-pilot-button variant="outline" round dense icon="mdi-pencil"
        tooltip="Editar etapas de mostura" @click.stop="editMashDialog = true" />
    </template>

      <!-- Etapas -->
      <q-list dense>
        <q-item v-for="step in sortedMashSteps" :key="step.id"
          class="q-px-xs q-py-none mash-row">
          <q-item-section class="col">
            <div class="text-caption text-grey-4">{{ step.name }}</div>
          </q-item-section>
          <q-item-section side style="min-width:56px;text-align:right">
            <div class="text-caption text-grey-3">{{ step.temperature }} °C</div>
          </q-item-section>
          <q-item-section side style="min-width:48px;text-align:right;padding-left:8px">
            <div class="text-caption text-grey-5">{{ step.time }} min</div>
          </q-item-section>
        </q-item>
        <q-item v-if="!recipe.mashSteps.length" class="q-px-xs">
          <q-item-section>
            <div class="text-caption text-grey-7">Nenhuma etapa definida</div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- FG / Density Final button -->
      <div class="q-mt-sm row justify-end">
        <brew-pilot-button variant="outline" rounded dense no-caps label="DENSIDADE FINAL" class="q-px-sm"
          icon="mdi-pencil" size="sm" @click="fgDialog = true" />
      </div>

      <!-- Stats mostura -->
      <div v-if="stats" class="text-right q-mt-xs q-gutter-x-xs">
        <brew-pilot-label variant="stats" size="10.5px">Densidade Final Esperada:</brew-pilot-label>
        <brew-pilot-label variant="stats-value" size="10.5px"><strong>{{ stats.fg.toFixed(3) }}</strong></brew-pilot-label>
        <brew-pilot-label variant="stats" size="10.5px">&nbsp;·&nbsp; Atenuação Aparente:</brew-pilot-label>
        <brew-pilot-label variant="stats-value" size="10.5px"><strong>{{ attenuation }}%</strong></brew-pilot-label>
        <brew-pilot-label variant="stats" size="10.5px">&nbsp;·&nbsp; Álcool por Volume:</brew-pilot-label>
        <brew-pilot-label variant="stats-value" size="10.5px"><strong>{{ stats.abv.toFixed(1) }}%</strong></brew-pilot-label>
      </div>
      <div v-if="stats" class="text-right q-mt-none">
        <brew-pilot-label variant="stats" size="10.5px">{{ stats.calories }} kcal / {{ Math.round(stats.calories * 4.184) }} kJ por 100 ml</brew-pilot-label>
      </div>
  </recipe-section>

  <!-- ── Perfil de Fermentação ──────────────────────────────────────── -->
  <recipe-section
    v-if="section === 'fermentation'"
    title="Perfil de Fermentação"
    :badge="fermProfileName"
    icon="mdi-chart-timeline-variant"
    icon-color="blue-5"
  >
    <template #actions>
      <brew-pilot-button variant="outline" round dense icon="mdi-swap-horizontal"
        tooltip="Alterar perfil de fermentação" @click.stop="changeFermDialog = true" />
      <brew-pilot-button variant="outline" round dense icon="mdi-pencil"
        tooltip="Editar etapas de fermentação" @click.stop="editFermDialog = true" />
    </template>

      <!-- Etapas de fermentação -->
      <q-list dense>
        <q-item v-for="step in sortedFermSteps" :key="step.id"
          class="q-px-xs q-py-none mash-row">
          <q-item-section class="col">
            <div class="text-caption text-grey-4">{{ step.name }}</div>
          </q-item-section>
          <q-item-section side style="min-width:56px;text-align:right">
            <div class="text-caption text-grey-3">{{ step.temperature }} °C</div>
          </q-item-section>
          <q-item-section side style="min-width:52px;text-align:right;padding-left:8px">
            <div class="text-caption text-grey-5">{{ step.days }} dias</div>
          </q-item-section>
        </q-item>
        <q-item v-if="!fermSteps.length" class="q-px-xs">
          <q-item-section>
            <div class="text-caption text-grey-7">Nenhuma etapa definida</div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Carbonatação -->
      <div v-if="recipe.carbonationMin || recipe.carbonationMax"
        class="text-right q-mt-xs" style="font-size:10.5px;color:rgba(255,255,255,0.4)">
        Carbonatação
        <strong style="color:#e57373">
          {{ recipe.carbonationMin ?? '—' }} - {{ recipe.carbonationMax ?? '—' }}
        </strong>
        volumes de CO₂
      </div>
  </recipe-section>

  <!-- Diálogos (fora das seções condicionais) -->

    <!-- Density Final -->
    <brew-pilot-dialog v-model="fgDialog" title="Densidade Final Medida"
      icon="mdi-pencil" icon-color="orange-6" width="320px">
      <q-card-section>
        <q-input v-model.number="measuredFg" type="number" step="0.001" min="1.000" max="1.060"
          outlined dense
          :hint="stats ? `Estimada: ${stats.fg.toFixed(3)}` : ''" />
      </q-card-section>
      <template #footer>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="fgDialog = false" />
          <brew-pilot-button variant="filled" no-caps label="Salvar" color="positive" @click="saveFg" />
        </q-card-actions>
      </template>
    </brew-pilot-dialog>

    <!-- Editar Mostura -->
    <brew-pilot-dialog v-model="editMashDialog" title="Editar Etapas de Mostura"
      icon="mdi-thermometer" icon-color="orange-6" width="520px" scrollable>
      <q-card-section class="q-gutter-sm">
        <div v-for="(step, i) in recipe.mashSteps" :key="step.id"
          class="mash-step-row q-pa-sm rounded-borders q-mb-xs">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-12 col-sm-3">
              <q-input v-model="step.name" outlined dense label="Nome" />
            </div>
            <div class="col-6 col-sm-2">
              <q-input v-model.number="step.temperature" type="number" step="0.5"
                outlined dense label="°C" />
            </div>
            <div class="col-6 col-sm-2">
              <q-input v-model.number="step.time" type="number" step="1"
                outlined dense label="min" />
            </div>
            <div class="col-8 col-sm-3">
              <brew-pilot-select v-model="step.type"
                :options="[{label:'Infusão',value:'Infusion'},{label:'Temperatura',value:'Temperature'},{label:'Decocção',value:'Decoction'}]"
                emit-value map-options label="Tipo" />
            </div>
            <div class="col-4 col-sm-2 row justify-end">
              <q-btn flat round dense icon="delete" color="negative"
                @click="recipe.mashSteps.splice(i, 1)" />
            </div>
          </div>
        </div>
      </q-card-section>
      <template #footer>
        <q-card-actions class="q-px-md q-pb-md">
          <brew-pilot-button variant="outline" no-caps icon="mdi-plus" label="Adicionar Etapa"
            size="sm" @click="addMashStep" />
          <q-space />
          <brew-pilot-button variant="filled" no-caps label="Fechar" color="positive"
            @click="editMashDialog = false" />
        </q-card-actions>
      </template>
    </brew-pilot-dialog>

    <!-- Editar Fermentação -->
    <brew-pilot-dialog v-model="editFermDialog" title="Editar Perfil de Fermentação"
      icon="mdi-chart-timeline-variant" icon-color="blue-5" width="520px" scrollable>
      <q-card-section class="q-gutter-sm">
        <div v-for="(step, i) in fermSteps" :key="step.id"
          class="mash-step-row q-pa-sm rounded-borders q-mb-xs">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-12 col-sm-4">
              <q-input v-model="step.name" outlined dense label="Nome" />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model.number="step.temperature" type="number" step="0.5"
                outlined dense label="°C" />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model.number="step.days" type="number" step="1"
                outlined dense label="Dias" />
            </div>
            <div class="col-12 col-sm-2 row justify-end">
              <q-btn flat round dense icon="delete" color="negative"
                @click="fermSteps.splice(i, 1)" />
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-pt-xs">
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input v-model.number="recipe.carbonationMin" type="number" step="0.1"
              outlined dense label="Carbonatação Mín." suffix="vol CO₂" />
          </div>
          <div class="col-6">
            <q-input v-model.number="recipe.carbonationMax" type="number" step="0.1"
              outlined dense label="Carbonatação Máx." suffix="vol CO₂" />
          </div>
        </div>
      </q-card-section>
      <template #footer>
        <q-card-actions class="q-px-md q-pb-md">
          <brew-pilot-button variant="outline" no-caps icon="mdi-plus" label="Adicionar Etapa"
            size="sm" @click="addFermStep" />
          <q-space />
          <brew-pilot-button variant="filled" no-caps label="Fechar" color="positive"
            @click="editFermDialog = false" />
        </q-card-actions>
      </template>
    </brew-pilot-dialog>

    <!-- Alterar perfil de mostura -->
    <brew-pilot-dialog v-model="changeMashDialog" title="Alterar Perfil de Mostura"
      icon="mdi-swap-horizontal" icon-color="orange-6" width="360px">
      <q-card-section>
        <div class="q-gutter-sm">
          <brew-pilot-button
            v-for="p in mashPresets" :key="p.label"
            variant="outline" no-caps class="full-width"
            :label="p.label"
            @click="applyMashPreset(p)" />
        </div>
      </q-card-section>
    </brew-pilot-dialog>

    <!-- Alterar perfil de fermentação -->
    <brew-pilot-dialog v-model="changeFermDialog" title="Alterar Perfil de Fermentação"
      icon="mdi-swap-horizontal" icon-color="blue-5" width="360px">
      <q-card-section>
        <div class="q-gutter-sm">
          <brew-pilot-button
            v-for="p in fermPresets" :key="p.label"
            variant="outline" no-caps class="full-width"
            :label="p.label"
            @click="applyFermPreset(p)" />
        </div>
      </q-card-section>
    </brew-pilot-dialog>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '../../../../stores/recipeStore'
import RecipeSection from '../RecipeSection.vue'
import BrewPilotButton from '../../../../components/shared/BrewPilotButton.vue'
import BrewPilotDialog from '../../../../components/BrewPilotDialog.vue'
import BrewPilotSelect from '../../../../components/shared/BrewPilotSelect.vue'
import BrewPilotLabel from '../../../../components/shared/BrewPilotLabel.vue'
import type { RecipeMashStep, FermentationStep } from '../../../../types/recipe'

const props = defineProps<{ section: 'mash' | 'fermentation' }>()
const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats   = computed(() => store.stats)

const fgDialog         = ref(false)
const editMashDialog   = ref(false)
const editFermDialog   = ref(false)
const changeMashDialog = ref(false)
const changeFermDialog = ref(false)
const measuredFg       = ref(1.010)

// ── computed ──
const sortedMashSteps = computed(() =>
  [...recipe.value.mashSteps].sort((a, b) => a.sortOrder - b.sortOrder)
)

const fermSteps = computed<FermentationStep[]>({
  get: () => recipe.value.fermentationSteps ?? [],
  set: v => { recipe.value.fermentationSteps = v }
})

const sortedFermSteps = computed(() =>
  [...fermSteps.value].sort((a, b) => a.sortOrder - b.sortOrder)
)

const mashProfileName = computed(() => {
  const steps = recipe.value.mashSteps
  if (!steps.length) return 'Perfil de Mostura'
  const infusion = steps.find(s => s.type === 'Infusion')
  return infusion
    ? `Single Infusion ${infusion.temperature}°C`
    : `${steps.length} etapa(s) de mostura`
})

const fermProfileName = computed(() => {
  const steps = fermSteps.value
  if (!steps.length) return 'Perfil de Fermentação'
  return steps.map(s => s.name).join(', ')
})

const attenuation = computed(() => {
  if (!stats.value) return 0
  const { og, fg } = stats.value
  return (((og - fg) / (og - 1)) * 100).toFixed(1)
})

// ── methods ──
function saveFg() {
  recipe.value.measuredFg = measuredFg.value
  fgDialog.value = false
}

function addMashStep() {
  recipe.value.mashSteps.push({
    id: crypto.randomUUID(),
    name: 'Nova Etapa',
    type: 'Infusion',
    temperature: 67,
    time: 60,
    waterRatio: 3.0,
    sortOrder: recipe.value.mashSteps.length
  } as RecipeMashStep)
}

function addFermStep() {
  if (!recipe.value.fermentationSteps) recipe.value.fermentationSteps = []
  recipe.value.fermentationSteps.push({
    id: crypto.randomUUID(),
    name: 'Nova Etapa',
    temperature: 20,
    days: 7,
    sortOrder: recipe.value.fermentationSteps.length
  } as FermentationStep)
}

function applyMashPreset(preset: typeof mashPresets[0]) {
  recipe.value.mashSteps.splice(0)
  preset.steps.forEach((s, i) => {
    recipe.value.mashSteps.push({
      id: crypto.randomUUID(),
      sortOrder: i,
      waterRatio: s.waterRatio ?? 3.0,
      ...s
    } as RecipeMashStep)
  })
  changeMashDialog.value = false
}

function applyFermPreset(preset: typeof fermPresets[0]) {
  if (!recipe.value.fermentationSteps) recipe.value.fermentationSteps = []
  recipe.value.fermentationSteps.splice(0)
  preset.steps.forEach((s, i) => {
    recipe.value.fermentationSteps!.push({ id: crypto.randomUUID(), sortOrder: i, ...s } as FermentationStep)
  })
  changeFermDialog.value = false
}

// ── presets ──
const mashPresets = [
  {
    label: 'Single Infusion — Light Body (63°C)',
    steps: [{ name: 'Mash In', type: 'Infusion' as const, temperature: 63, time: 60 },
            { name: 'Mash Out', type: 'Temperature' as const, temperature: 77, time: 10 }]
  },
  {
    label: 'Single Infusion — Standard (67°C)',
    steps: [{ name: 'Mash In', type: 'Infusion' as const, temperature: 67, time: 75 },
            { name: 'Mash Out', type: 'Temperature' as const, temperature: 77, time: 10 }]
  },
  {
    label: 'Single Infusion — Full Body (70°C)',
    steps: [{ name: 'Mash In', type: 'Infusion' as const, temperature: 70, time: 75 },
            { name: 'Mash Out', type: 'Temperature' as const, temperature: 77, time: 10 }]
  }
]

const fermPresets = [
  {
    label: 'Ale Padrão',
    steps: [
      { name: 'Primária',   temperature: 20,   days: 7 },
      { name: 'Secundária', temperature: 20,   days: 14 },
      { name: 'Envase',     temperature: 18.3, days: 30 }
    ]
  },
  {
    label: 'Lager',
    steps: [
      { name: 'Primária',        temperature: 10,  days: 14 },
      { name: 'Diacetyl Rest',   temperature: 18,  days: 2 },
      { name: 'Lagering',        temperature: 1,   days: 21 },
      { name: 'Envase',          temperature: 18.3, days: 30 }
    ]
  }
]
</script>

<style scoped>
.mash-row { border-radius: 3px; }
.mash-step-row { background: rgba(255,255,255,0.04); border-radius: 6px; }
</style>
