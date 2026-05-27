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
      <q-btn flat round dense size="md" icon="mdi-swap-horizontal" color="grey-5"
        @click.stop="changeMashDialog = true">
        <q-tooltip>Alterar perfil de mostura</q-tooltip>
      </q-btn>
      <q-btn flat round dense size="md" icon="mdi-pencil" color="grey-5"
        @click.stop="editMashDialog = true">
        <q-tooltip>Editar etapas de mostura</q-tooltip>
      </q-btn>
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
        <q-btn outline rounded dense no-caps label="DENSIDADE FINAL" icon="mdi-pencil"
          color="grey-5" size="sm" @click="fgDialog = true" />
      </div>

      <!-- Stats mostura -->
      <div v-if="stats" class="bp-stats-muted text-right q-mt-xs" style="font-size:10.5px">
        Densidade Final Esperada: <strong class="bp-stats-value">{{ stats.fg.toFixed(3) }}</strong>
        &nbsp;·&nbsp; Atenuação Aparente: <strong class="bp-stats-value">{{ attenuation }}%</strong>
        &nbsp;·&nbsp; Álcool por Volume: <strong class="bp-stats-value">{{ stats.abv.toFixed(1) }}%</strong>
      </div>
      <div v-if="stats" class="bp-stats-muted text-right" style="font-size:10.5px">
        {{ stats.calories }} kcal / {{ Math.round(stats.calories * 4.184) }} kJ por 100 ml
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
      <q-btn flat round dense size="md" icon="mdi-swap-horizontal" color="grey-5"
        @click.stop="changeFermDialog = true">
        <q-tooltip>Alterar perfil de fermentação</q-tooltip>
      </q-btn>
      <q-btn flat round dense size="md" icon="mdi-pencil" color="grey-5"
        @click.stop="editFermDialog = true">
        <q-tooltip>Editar etapas de fermentação</q-tooltip>
      </q-btn>
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
    <q-dialog v-model="fgDialog">
      <q-card dark class="bg-dark" style="width:320px;max-width:95vw">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-white q-mb-md">
            Densidade Final Medida
          </div>
          <q-input v-model.number="measuredFg" type="number" step="0.001" min="1.000" max="1.060"
            outlined dense dark
            :hint="stats ? `Estimada: ${stats.fg.toFixed(3)}` : ''" />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat no-caps label="CANCELAR" color="grey-5" v-close-popup />
          <q-btn unelevated no-caps label="SALVAR" color="positive" @click="saveFg" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Editar Mostura -->
    <q-dialog v-model="editMashDialog">
      <q-card dark class="bg-dark" style="width:520px;max-width:95vw;max-height:80vh;display:flex;flex-direction:column">
        <q-card-section class="row items-center q-pb-sm" style="flex-shrink:0">
          <div class="text-subtitle1 text-weight-bold text-white">Editar Etapas de Mostura</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator dark />
        <div style="overflow-y:auto;flex:1 1 0;min-height:0">
          <q-card-section class="q-gutter-sm">
            <div v-for="(step, i) in recipe.mashSteps" :key="step.id"
              class="mash-step-row q-pa-sm rounded-borders q-mb-xs">
              <div class="row q-col-gutter-sm items-center">
                <div class="col-12 col-sm-3">
                  <q-input v-model="step.name" outlined dense dark label="Nome" />
                </div>
                <div class="col-6 col-sm-2">
                  <q-input v-model.number="step.temperature" type="number" step="0.5"
                    outlined dense dark label="°C" />
                </div>
                <div class="col-6 col-sm-2">
                  <q-input v-model.number="step.time" type="number" step="1"
                    outlined dense dark label="min" />
                </div>
                <div class="col-8 col-sm-3">
                  <q-select v-model="step.type"
                    :options="[{label:'Infusão',value:'Infusion'},{label:'Temperatura',value:'Temperature'},{label:'Decocção',value:'Decoction'}]"
                    emit-value map-options outlined dense dark options-dark label="Tipo" />
                </div>
                <div class="col-4 col-sm-2 row justify-end">
                  <q-btn flat round dense icon="delete" color="negative"
                    @click="recipe.mashSteps.splice(i, 1)" />
                </div>
              </div>
            </div>
          </q-card-section>
        </div>
        <q-separator dark />
        <q-card-actions class="q-px-md q-pb-md" style="flex-shrink:0">
          <q-btn outline no-caps icon="add" label="Adicionar Etapa" color="grey-5" size="sm"
            @click="addMashStep" />
          <q-space />
          <q-btn unelevated no-caps label="Fechar" color="positive" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Editar Fermentação -->
    <q-dialog v-model="editFermDialog">
      <q-card dark class="bg-dark" style="width:520px;max-width:95vw;max-height:80vh;display:flex;flex-direction:column">
        <q-card-section class="row items-center q-pb-sm" style="flex-shrink:0">
          <div class="text-subtitle1 text-weight-bold text-white">Editar Perfil de Fermentação</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator dark />
        <div style="overflow-y:auto;flex:1 1 0;min-height:0">
          <q-card-section class="q-gutter-sm">
            <div v-for="(step, i) in fermSteps" :key="step.id"
              class="mash-step-row q-pa-sm rounded-borders q-mb-xs">
              <div class="row q-col-gutter-sm items-center">
                <div class="col-12 col-sm-4">
                  <q-input v-model="step.name" outlined dense dark label="Nome" />
                </div>
                <div class="col-6 col-sm-3">
                  <q-input v-model.number="step.temperature" type="number" step="0.5"
                    outlined dense dark label="°C" />
                </div>
                <div class="col-6 col-sm-3">
                  <q-input v-model.number="step.days" type="number" step="1"
                    outlined dense dark label="Dias" />
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
                  outlined dense dark label="Carbonatação Mín." suffix="vol CO₂" />
              </div>
              <div class="col-6">
                <q-input v-model.number="recipe.carbonationMax" type="number" step="0.1"
                  outlined dense dark label="Carbonatação Máx." suffix="vol CO₂" />
              </div>
            </div>
          </q-card-section>
        </div>
        <q-separator dark />
        <q-card-actions class="q-px-md q-pb-md" style="flex-shrink:0">
          <q-btn outline no-caps icon="add" label="Adicionar Etapa" color="grey-5" size="sm"
            @click="addFermStep" />
          <q-space />
          <q-btn unelevated no-caps label="Fechar" color="positive" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Alterar perfil de mostura (placeholder) -->
    <q-dialog v-model="changeMashDialog">
      <q-card dark class="bg-dark" style="width:360px;max-width:95vw">
        <q-card-section class="row items-center">
          <div class="text-subtitle2 text-white">Alterar Perfil de Mostura</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="q-gutter-sm">
            <q-btn
              v-for="p in mashPresets" :key="p.label"
              outline no-caps color="grey-5" class="full-width"
              @click="applyMashPreset(p)">
              {{ p.label }}
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Alterar perfil de fermentação (placeholder) -->
    <q-dialog v-model="changeFermDialog">
      <q-card dark class="bg-dark" style="width:360px;max-width:95vw">
        <q-card-section class="row items-center">
          <div class="text-subtitle2 text-white">Alterar Perfil de Fermentação</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="q-gutter-sm">
            <q-btn
              v-for="p in fermPresets" :key="p.label"
              outline no-caps color="grey-5" class="full-width"
              @click="applyFermPreset(p)">
              {{ p.label }}
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '../../../../stores/recipeStore'
import RecipeSection from '../RecipeSection.vue'
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
