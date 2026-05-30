<template>
  <brew-pilot-dialog
    v-model="open"
    :title="dialogTitle"
    icon="mdi-thermometer"
    icon-color="red-4"
    width="680px"
    scrollable
    :loading="saving"
    persistent
  >
    <template #header-actions>
      <q-btn flat round dense icon="mdi-information-outline" color="grey-5"
        :disable="saving" @click="guideDialog = true">
        <q-tooltip>Guia de Mostura</q-tooltip>
      </q-btn>
      <q-btn flat round dense
        :icon="form.isDefault ? 'mdi-star' : 'mdi-star-outline'"
        :color="form.isDefault ? 'amber' : 'grey-5'"
        :disable="saving"
        @click="form.isDefault = !form.isDefault">
        <q-tooltip>{{ form.isDefault ? 'Perfil padrão' : 'Definir como padrão' }}</q-tooltip>
      </q-btn>

      <!-- Presets menu -->
      <q-btn flat round dense icon="mdi-playlist-play" color="grey-5" :disable="saving">
        <q-tooltip>Carregar preset</q-tooltip>
        <q-menu ref="presetsMenuRef" anchor="bottom right" self="top right" :offset="[0, 4]" class="mash-preset-menu">
          <div style="min-width: 260px">
            <div class="q-px-md q-pt-sm q-pb-xs mash-preset-header">Presets de Mostura</div>
            <q-list dense>
              <q-item
                v-for="preset in mashPresets"
                :key="preset.label"
                clickable v-ripple dense
                style="min-height: 44px"
                @click="applyPreset(preset)">
                <q-item-section avatar style="min-width: 32px">
                  <q-icon :name="preset.icon" size="16px" color="primary" />
                </q-item-section>
                <q-item-section>
                  <div style="font-size: 13px; font-weight: 500; color: var(--bp-text-primary)">{{ preset.label }}</div>
                  <div style="font-size: 11px; color: var(--bp-text-muted)">{{ preset.desc }}</div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-menu>
      </q-btn>
    </template>

    <div
      class="q-pa-md"
      :inert="saving ? true : undefined"
      :style="saving ? 'opacity: 0.55; pointer-events: none; transition: opacity 0.2s' : 'transition: opacity 0.2s'"
    >

      <!-- ── Identificação ─────────────────────────────────────────── -->
      <brew-pilot-form-section title="Identificação">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <brew-pilot-input v-model="form.name" label="Nome do Perfil" />
          </div>
          <div class="col-12">
            <brew-pilot-input
              v-model="form.notes"
              type="textarea"
              autogrow
              label="Observações (opcional)"
              input-style="min-height: 48px; font-size: 13px"
            />
          </div>
        </div>
      </brew-pilot-form-section>
      <!-- ── Parâmetros do Sistema ────────────────────────────────── -->
      <brew-pilot-form-section title="Parâmetros do Sistema" collapsible>
        <div class="row q-col-gutter-sm">
          <div class="col-6 col-sm-4">
            <brew-pilot-input
              v-model.number="form.grainTemperature"
              type="number"
              step="0.5"
              label="Temp. do Grão"
              suffix="°C"
              dense
            >
              <template #hint>Temperatura inicial do grão</template>
            </brew-pilot-input>
          </div>
          <div class="col-6 col-sm-4">
            <brew-pilot-input
              v-model.number="form.tunTemperature"
              type="number"
              step="0.5"
              label="Temp. da Tina"
              suffix="°C"
              dense
            >
              <template #hint>Temperatura inicial da tina</template>
            </brew-pilot-input>
          </div>
          <div class="col-6 col-sm-4">
            <brew-pilot-input
              v-model.number="form.spargeTemperature"
              type="number"
              step="0.5"
              label="Temp. de Lavagem"
              suffix="°C"
              dense
            >
              <template #hint>Temp. água de sparging</template>
            </brew-pilot-input>
          </div>
        </div>
      </brew-pilot-form-section>
      <!-- ── Gráfico de temperatura ────────────────────────────────── -->
      <div v-if="form.steps.length" class="mash-chart-wrap q-mb-sm">
        <mash-temp-chart :steps="form.steps" />
      </div>

      <!-- ── Etapas ────────────────────────────────────────────────── -->
      <brew-pilot-form-section title="Etapas de Mostura" collapsible>
        <template #actions>
          <q-btn
            v-if="form.steps.length"
            flat round dense size="xs"
            :icon="allStepsCollapsed ? 'mdi-arrow-expand-all' : 'mdi-arrow-collapse-all'"
            color="grey-5"
            @click.stop="allStepsCollapsed ? expandAllSteps() : collapseAllSteps()">
            <q-tooltip>{{ allStepsCollapsed ? 'Expandir todas' : 'Recolher todas' }}</q-tooltip>
          </q-btn>
        </template>
        <div v-if="!form.steps.length" class="mash-empty-steps">
          <q-icon name="mdi-thermometer-off" size="28px" color="grey-7" class="q-mb-xs" />
          <div style="font-size: 13px; color: var(--bp-text-muted)">Nenhuma etapa. Adicione ou carregue um preset.</div>
        </div>

        <div v-for="(step, i) in form.steps" :key="step.id" class="mash-step-card q-mb-sm">
          <!-- ── Cabeçalho da etapa ── -->
          <div class="mash-step-header" @click.self="toggleStepCollapse(step.id)" style="cursor: pointer">
            <div class="row items-center no-wrap" style="gap: 6px">
              <q-chip
                dense square
              :color="stepTypeColor(step.stepType)"
              text-color="white"
              :icon="stepTypeIcons[step.stepType]"
              :label="stepTypeLabel(step.stepType)"
                style="font-size: 10px; height: 20px; padding: 0 7px"
              />
              <span class="mash-step-title">Etapa {{ i + 1 }}</span>
              <span v-if="isStepCollapsed(step.id) && step.temperature" style="font-size: 11px; color: var(--bp-text-muted)">
                — {{ step.temperature }}°C · {{ step.time }}min
              </span>
            </div>
            <div class="row items-center no-wrap" style="gap: 2px">
              <q-btn flat round dense
                :icon="isStepCollapsed(step.id) ? 'mdi-chevron-down' : 'mdi-chevron-up'"
                color="grey-5" size="sm"
                @click.stop="toggleStepCollapse(step.id)">
                <q-tooltip>{{ isStepCollapsed(step.id) ? 'Expandir' : 'Recolher' }}</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="mdi-arrow-up-bold" color="grey-5" size="sm"
                :disable="i === 0" @click.stop="moveStep(i, -1)">
                <q-tooltip>Mover para cima</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="mdi-arrow-down-bold" color="grey-5" size="sm"
                :disable="i === form.steps.length - 1" @click.stop="moveStep(i, 1)">
                <q-tooltip>Mover para baixo</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="mdi-close" color="negative" size="sm"
                @click.stop="removeStep(i)">
                <q-tooltip>Remover etapa</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- ── Corpo da etapa (colapsável) ── -->
          <div v-show="!isStepCollapsed(step.id)">
          <!-- ── Nome + Tipo ── -->
          <div class="row q-col-gutter-xs q-px-sm q-pt-sm">
            <div class="col-12 col-sm-8">
              <brew-pilot-input v-model="step.name" label="Nome" dense />
            </div>
            <div class="col-12 col-sm-4">
              <brew-pilot-select
                v-model="step.stepType"
                :options="stepTypeOptions"
                emit-value
                map-options
                label="Tipo"
                dense
              />
            </div>
          </div>

          <!-- ── Descrição ── -->
          <div class="q-px-sm q-pt-xs q-pb-xs">
            <brew-pilot-input
              v-model="step.description"
              type="textarea"
              autogrow
              label="Descrição (opcional)"
              input-style="min-height: 28px; font-size: 12px"
              dense
            />
          </div>

          <!-- ── Dados em 2 colunas ── -->
          <div class="row q-px-sm q-pb-sm" style="gap: 8px; flex-wrap: nowrap">
            <!-- Coluna Etapa -->
            <div class="col">
              <div class="mash-step-section-label">Etapa</div>
              <div class="column" style="gap: 6px">
                <brew-pilot-input
                  v-model.number="step.temperature"
                  type="number"
                  step="0.5"
                  label="Temperatura"
                  suffix="°C"
                  dense
                />
                <brew-pilot-input
                  v-model.number="step.time"
                  type="number"
                  step="1"
                  label="Tempo"
                  suffix="min"
                  dense
                />
                <brew-pilot-input
                  v-model.number="step.rampDuration"
                  type="number"
                  step="1"
                  label="Tempo de Rampa"
                  suffix="min"
                  dense
                />
              </div>
            </div>
            <!-- Coluna Infusão (oculta para Decoction) -->
            <div v-if="step.stepType !== 'Decoction'" class="col mash-step-section--infusion">
              <div class="mash-step-section-label">Infusão</div>
              <div class="column" style="gap: 6px">
                <brew-pilot-input
                  v-if="step.stepType === 'Infusion'"
                  v-model.number="step.infuseAmount"
                  type="number"
                  step="0.1"
                  label="Água a adicionar"
                  suffix="L"
                  dense
                />
                <brew-pilot-input
                  v-model.number="step.waterRatio"
                  type="number"
                  step="0.1"
                  label="Água/Grão"
                  suffix="L/kg"
                  dense
                />
                <brew-pilot-input
                  v-if="step.stepType === 'Infusion'"
                  v-model.number="step.infusionTemperature"
                  type="number"
                  step="0.5"
                  label="Temp. Infusão"
                  suffix="°C"
                  dense
                />
              </div>
            </div>
          </div>
          </div><!-- end collapsible body -->
        </div>

        <!-- Botão adicionar etapa -->
        <brew-pilot-button
          variant="outline"
          no-caps
          class="full-width mash-add-btn"
          icon="mdi-plus"
          label="Adicionar Etapa"
          @click="addStep"
        />
      </brew-pilot-form-section>
      <!-- ── Sparging & BIAB ───────────────────────────────────── -->
      <brew-pilot-form-section title="Sparging &amp; BIAB" collapsible :initial-collapsed="true">
        <div class="column" style="gap: 12px">
          <div class="row items-center" style="gap: 12px; flex-wrap: wrap">
            <q-toggle v-model="form.batchSparge" dense label="Batch Sparge" />
          </div>
          <div v-if="form.batchSparge" class="row items-center q-col-gutter-sm q-pl-sm">
            <div class="col-auto">
              <brew-pilot-input
                v-model.number="form.batchSpargePercent"
                type="number" step="1"
                label="Encher" suffix="%"
                dense style="width: 110px"
              />
            </div>
            <div class="col-auto column" style="gap: 4px; padding-top: 4px">
              <q-toggle v-model="form.equalBatchSizes" dense label="Lotes de volume igual" />
              <q-toggle v-model="form.drainBeforeSparge" dense label="Drenar tina antes do sparging" />
            </div>
          </div>
          <q-separator />
          <div class="row items-center" style="gap: 12px">
            <q-toggle v-model="form.biab" dense label="BIAB — Brew in a Bag (Fervura Total)" />
          </div>
          <div v-if="form.biab" class="row items-center q-col-gutter-sm q-pl-sm">
            <div class="col-auto">
              <brew-pilot-input
                v-model.number="form.biabBoilVolume"
                type="number" step="0.1"
                label="Volume base de fervura" suffix="L"
                dense style="width: 200px"
              />
            </div>
          </div>
        </div>
      </brew-pilot-form-section>
      <!-- ── Resumo ─────────────────────────────────────────────────── -->
      <div v-if="form.steps.length" class="mash-summary">
        <div class="mash-summary-item">
          <span class="mash-summary-label">Etapas</span>
          <span class="mash-summary-value">{{ form.steps.length }}</span>
        </div>
        <div class="mash-summary-item">
          <span class="mash-summary-label">Tempo total</span>
          <span class="mash-summary-value">{{ totalTime }} min</span>
        </div>
        <div class="mash-summary-item">
          <span class="mash-summary-label">Rampa total</span>
          <span class="mash-summary-value">{{ totalRamp }} min</span>
        </div>
        <div class="mash-summary-item">
          <span class="mash-summary-label">Faixa de temp.</span>
          <span class="mash-summary-value">{{ tempRange }}</span>
        </div>
      </div>

    </div>

    <template #footer>
      <div class="row items-center q-px-md q-py-sm" style="gap: 8px">
        <brew-pilot-button
          v-if="isEditing"
          variant="outline"
          no-caps
          label="Copiar"
          icon="mdi-content-copy"
          size="sm"
          :disable="saving"
          @click="copyProfile"
        />
        <q-space />
        <brew-pilot-button variant="outline" no-caps label="Cancelar" :disable="saving" @click="open = false" />
        <brew-pilot-button
          variant="filled"
          color="primary"
          no-caps
          :label="isEditing ? 'Salvar' : 'Criar Perfil'"
          icon="mdi-content-save"
          :loading="saving"
          :disable="saving"
          @click="save"
        />
      </div>
    </template>
  </brew-pilot-dialog>

  <mash-guide-dialog v-model="guideDialog" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useMashProfileStore } from '@/stores/mashProfileStore'
import type { MashProfile, MashProfileStep } from '@/types/mash'
import type { MashStepType } from '@/types/recipe'
import MashTempChart from './MashTempChart.vue'
import MashGuideDialog from './MashGuideDialog.vue'

const props = defineProps<{
  modelValue: boolean
  baseProfile?: MashProfile | null
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'saved': [profile: MashProfile]
}>()

const $q = useQuasar()
const store = useMashProfileStore()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const editingId = ref<string | null>(null)
const isEditing = computed(() => !!editingId.value)
const dialogTitle = computed(() => isEditing.value ? 'Editar Perfil de Mostura' : 'Criar Perfil de Mostura')
const saving = ref(false)
const guideDialog = ref(false)
const presetsMenuRef = ref<{ hide: () => void } | null>(null)

// ── Form ──────────────────────────────────────────────────────────────────
function defaultForm() {
  return {
    name: '',
    notes: '',
    isDefault: false,
    grainTemperature:  undefined as number | undefined,
    tunTemperature:    undefined as number | undefined,
    spargeTemperature: undefined as number | undefined,
    // Sparging
    batchSparge:        false,
    batchSpargePercent: 100,
    equalBatchSizes:    false,
    drainBeforeSparge:  false,
    // BIAB
    biab:               false,
    biabBoilVolume:     undefined as number | undefined,
    steps: [] as MashProfileStep[],
  }
}

const form = ref(defaultForm())

watch(() => props.modelValue, v => { if (v) initForm() }, { immediate: true })

function initForm() {
  const base = props.baseProfile
  if (base && !base.isDefault) {
    editingId.value = base.id
    form.value = {
      name: base.name,
      notes: base.notes ?? '',
      isDefault: base.isDefault ?? false,
      grainTemperature:  base.grainTemperature,
      tunTemperature:    base.tunTemperature,
      spargeTemperature: base.spargeTemperature,
      batchSparge:        base.batchSparge ?? false,
      batchSpargePercent: base.batchSpargePercent ?? 100,
      equalBatchSizes:    base.equalBatchSizes ?? false,
      drainBeforeSparge:  base.drainBeforeSparge ?? false,
      biab:               base.biab ?? false,
      biabBoilVolume:     base.biabBoilVolume,
      steps: base.steps.map(s => ({ ...s })),
    }
  } else if (base && base.isDefault) {
    editingId.value = null
    form.value = {
      name: base.name + ' (Meu)',
      notes: base.notes ?? '',
      isDefault: false,
      grainTemperature:  base.grainTemperature,
      tunTemperature:    base.tunTemperature,
      spargeTemperature: base.spargeTemperature,
      batchSparge:        base.batchSparge ?? false,
      batchSpargePercent: base.batchSpargePercent ?? 100,
      equalBatchSizes:    base.equalBatchSizes ?? false,
      drainBeforeSparge:  base.drainBeforeSparge ?? false,
      biab:               base.biab ?? false,
      biabBoilVolume:     base.biabBoilVolume,
      steps: base.steps.map(s => ({ ...s, id: crypto.randomUUID() })),
    }
  } else {
    editingId.value = null
    form.value = defaultForm()
  }
}

// ── Step types ─────────────────────────────────────────────────────────────
const stepTypeOptions = [
  { label: 'Infusão',    value: 'Infusion'    },
  { label: 'Temperatura', value: 'Temperature' },
  { label: 'Decocção',   value: 'Decoction'   },
]

const stepTypeLabels: Record<MashStepType, string> = {
  Infusion:    'Infusão',
  Temperature: 'Temperatura',
  Decoction:   'Decocção',
}

const stepTypeColors: Record<MashStepType, string> = {
  Infusion:    'blue-7',
  Temperature: 'orange-7',
  Decoction:   'red-7',
}

const stepTypeIcons: Record<MashStepType, string> = {
  Infusion:    'mdi-water-plus',
  Temperature: 'mdi-thermometer',
  Decoction:   'mdi-pot-steam-outline',
}

function stepTypeLabel(type: MashStepType) { return stepTypeLabels[type] ?? type }
function stepTypeColor(type: MashStepType) { return stepTypeColors[type] ?? 'grey-6' }

// ── Steps CRUD ────────────────────────────────────────────────────────────
function addStep() {
  const prev = form.value.steps[form.value.steps.length - 1]
  form.value.steps.push({
    id: crypto.randomUUID(),
    name: '',
    description: '',
    stepType: 'Temperature',
    temperature: prev ? Math.max(prev.temperature, 67) : 67,
    time: 60,
    rampDuration: undefined,
    waterRatio: undefined,
    infuseAmount: undefined,
    infusionTemperature: undefined,
    stepNumber: form.value.steps.length,
  })
}

function removeStep(i: number) {
  form.value.steps.splice(i, 1)
  form.value.steps.forEach((s, idx) => { s.stepNumber = idx })
}

function moveStep(i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= form.value.steps.length) return
  const steps = [...form.value.steps]
  ;[steps[i], steps[j]] = [steps[j], steps[i]]
  steps.forEach((s, idx) => { s.stepNumber = idx })
  form.value.steps = steps
}

// ── Step collapse ─────────────────────────────────────────────────────────
const collapsedSteps = ref<Set<string>>(new Set())
const allStepsCollapsed = computed(() =>
  form.value.steps.length > 0 && form.value.steps.every(s => collapsedSteps.value.has(s.id))
)
function isStepCollapsed(id: string) { return collapsedSteps.value.has(id) }
function toggleStepCollapse(id: string) {
  const s = new Set(collapsedSteps.value)
  s.has(id) ? s.delete(id) : s.add(id)
  collapsedSteps.value = s
}
function collapseAllSteps() {
  collapsedSteps.value = new Set(form.value.steps.map(s => s.id))
}
function expandAllSteps() {
  collapsedSteps.value = new Set()
}

// ── Summary ───────────────────────────────────────────────────────────────
const totalTime = computed(() => form.value.steps.reduce((sum, s) => sum + (s.time ?? 0), 0))
const totalRamp = computed(() => form.value.steps.reduce((sum, s) => sum + (s.rampTime ?? 0), 0))
const tempRange = computed(() => {
  if (!form.value.steps.length) return '—'
  const temps = form.value.steps.map(s => s.temperature)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  return min === max ? `${min} °C` : `${min}–${max} °C`
})

// ── Presets ───────────────────────────────────────────────────────────────
const mashPresets = [
  {
    label: 'Single Infusion — Light Body',
    desc: '63°C · 60 min + Mash Out 77°C',
    icon: 'mdi-thermometer-low',
    steps: [
      { name: 'Mash In',  stepType: 'Infusion'    as MashStepType, temperature: 63, time: 60, rampDuration: 0  },
      { name: 'Mash Out', stepType: 'Temperature' as MashStepType, temperature: 77, time: 10, rampDuration: 10 },
    ],
  },
  {
    label: 'Single Infusion — Standard',
    desc: '67°C · 75 min + Mash Out 77°C',
    icon: 'mdi-thermometer',
    steps: [
      { name: 'Mash In',  stepType: 'Infusion'    as MashStepType, temperature: 67, time: 75, rampDuration: 0  },
      { name: 'Mash Out', stepType: 'Temperature' as MashStepType, temperature: 77, time: 10, rampDuration: 10 },
    ],
  },
  {
    label: 'Single Infusion — Full Body',
    desc: '70°C · 75 min + Mash Out 77°C',
    icon: 'mdi-thermometer-high',
    steps: [
      { name: 'Mash In',  stepType: 'Infusion'    as MashStepType, temperature: 70, time: 75, rampDuration: 0  },
      { name: 'Mash Out', stepType: 'Temperature' as MashStepType, temperature: 77, time: 10, rampDuration: 10 },
    ],
  },
  {
    label: 'Step Mash — Protein + Sacarificação',
    desc: '52°C·20min → 65°C·40min → 72°C·20min + Mash Out',
    icon: 'mdi-stairs-up',
    steps: [
      { name: 'Protein Rest',    stepType: 'Infusion'    as MashStepType, temperature: 52, time: 20, rampDuration: 0  },
      { name: 'Beta Sacch.',     stepType: 'Temperature' as MashStepType, temperature: 65, time: 40, rampDuration: 15 },
      { name: 'Alpha Sacch.',    stepType: 'Temperature' as MashStepType, temperature: 72, time: 20, rampDuration: 10 },
      { name: 'Mash Out',        stepType: 'Temperature' as MashStepType, temperature: 77, time: 10, rampDuration: 8  },
    ],
  },
  {
    label: 'Step Mash — Lager Tradicional',
    desc: '35°C·15min → 52°C·20min → 64°C·40min → 72°C·20min + Mash Out',
    icon: 'mdi-snowflake',
    steps: [
      { name: 'Acid Rest',       stepType: 'Infusion'    as MashStepType, temperature: 35, time: 15, rampDuration: 0  },
      { name: 'Protein Rest',    stepType: 'Temperature' as MashStepType, temperature: 52, time: 20, rampDuration: 15 },
      { name: 'Beta Sacch.',     stepType: 'Temperature' as MashStepType, temperature: 64, time: 40, rampDuration: 15 },
      { name: 'Alpha Sacch.',    stepType: 'Temperature' as MashStepType, temperature: 72, time: 20, rampDuration: 10 },
      { name: 'Mash Out',        stepType: 'Temperature' as MashStepType, temperature: 77, time: 10, rampDuration: 8  },
    ],
  },
  {
    label: 'Decocção Simples',
    desc: 'Infusão 67°C · 45min + Decocção para Mash Out',
    icon: 'mdi-fire',
    steps: [
      { name: 'Mash In',      stepType: 'Infusion'  as MashStepType, temperature: 67, time: 45, rampDuration: 0  },
      { name: 'Decocção',     stepType: 'Decoction' as MashStepType, temperature: 77, time: 20, rampDuration: 0  },
    ],
  },
]

function applyPreset(preset: typeof mashPresets[0]) {
  form.value.steps = preset.steps.map((s, i) => ({
    ...s,
    id: crypto.randomUUID(),
    stepNumber: i,
    waterRatio: undefined,
  }))
  if (!form.value.name) form.value.name = preset.label
  presetsMenuRef.value?.hide()
}

// ── Salvar ────────────────────────────────────────────────────────────────
async function save() {
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      notes: form.value.notes || undefined,
      isDefault: form.value.isDefault,
      grainTemperature:  form.value.grainTemperature,
      tunTemperature:    form.value.tunTemperature,
      spargeTemperature: form.value.spargeTemperature,
      batchSparge:        form.value.batchSparge || undefined,
      batchSpargePercent: form.value.batchSparge ? form.value.batchSpargePercent : undefined,
      equalBatchSizes:    form.value.batchSparge ? form.value.equalBatchSizes : undefined,
      drainBeforeSparge:  form.value.batchSparge ? form.value.drainBeforeSparge : undefined,
      biab:               form.value.biab || undefined,
      biabBoilVolume:     form.value.biab ? form.value.biabBoilVolume : undefined,
      steps: form.value.steps.map((s, i) => ({ ...s, stepNumber: i })),
    }
    let saved: MashProfile
    if (editingId.value) {
      saved = await store.update(editingId.value, payload)
    } else {
      saved = await store.create(payload)
    }
    emit('saved', saved)
    open.value = false
    $q.notify({ type: 'positive', message: editingId.value ? 'Perfil atualizado!' : 'Perfil criado!', timeout: 2000 })
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Erro ao salvar perfil. Tente novamente.', timeout: 4000 })
    console.error('Erro ao salvar perfil de mostura:', e)
  } finally {
    saving.value = false
  }
}

function copyProfile() {
  form.value.name = form.value.name + ' (Cópia)'
  editingId.value = null
}
</script>

<style scoped lang="scss">
.mash-chart-wrap {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 12px 16px 8px;
}

.mash-step-card {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  overflow: hidden;
}

.mash-step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 4px;
  border-bottom: 1px solid var(--bp-border);
  background: rgba(255, 255, 255, 0.03);
}

.mash-step-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--bp-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mash-add-btn {
  border-style: dashed !important;
  font-size: 12px;
}

.mash-empty-steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.mash-summary {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 8px 14px;
  margin-top: 4px;
}

.mash-summary-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.mash-summary-label {
  font-size: 9px;
  font-weight: 500;
  color: var(--bp-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mash-summary-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--bp-text-primary);
}

.mash-preset-header {
  font-size: 10px;
  font-weight: 600;
  color: var(--bp-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mash-preset-menu {
  background: var(--bp-surface) !important;
  border: 1px solid var(--bp-border);
}

.mash-step-section-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--bp-text-muted);
  margin-bottom: 6px;
  padding-top: 8px;
}

.mash-step-section--infusion {
  border-left: 1px solid var(--bp-border);
  padding-left: 10px;
}
</style>
