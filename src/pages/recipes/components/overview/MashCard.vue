<template>
  <recipe-section
    v-if="section === 'mash'"
    title="Perfil de Mostura"
    :badge="mashProfileName"
    badge-class="mash-profile-badge"
    icon="mdi-thermometer"
    icon-color="orange-6"
  >
    <template #actions>
      <brew-pilot-button v-if="selectedMashProfile || hasManualMashSteps" variant="outline" round dense
        icon="mdi-test-tube"
        tooltip="Registrar a densidade final medida da receita" @click.stop="fgDialog = true" />
      <brew-pilot-button v-if="hasMultipleMashProfiles" variant="outline" round dense icon="mdi-swap-horizontal"
        tooltip="Alterar perfil de mostura" @click.stop="changeMashDialog = true" />
      <brew-pilot-button v-if="selectedMashProfile" variant="outline" round dense icon="mdi-pencil"
        tooltip="Editar perfil de mostura" @click.stop="openEditSelectedMashProfile" />
      <brew-pilot-button v-else-if="hasManualMashSteps" variant="outline" round dense icon="mdi-pencil"
        tooltip="Editar etapas de mostura" @click.stop="editMashDialog = true" />
      <brew-pilot-button v-else-if="hasMashProfiles" variant="outline" round dense icon="mdi-plus" primary
        tooltip="Selecionar perfil de mostura" @click.stop="changeMashDialog = true" />
    </template>

    <div v-if="mashStore.loading && !selectedMashProfile && !hasManualMashSteps"
      class="column items-center q-py-md q-gutter-xs">
      <q-spinner-dots color="primary" size="28px" />
      <brew-pilot-label variant="muted" size="11px">Carregando perfis de mostura...</brew-pilot-label>
    </div>

    <overview-empty-state-banner
      v-else-if="hasNoMashProfiles && !hasManualMashSteps"
      class="q-mt-xs"
      icon="mdi-thermometer-off"
      tone="orange"
      title="Nenhum perfil de mostura"
      description="Crie um perfil para padronizar descansos, temperaturas e a logica da mostura desta receita."
    >
      <template #action>
        <brew-pilot-button variant="outline" label="Criar Perfil" icon="mdi-plus"
          size="sm" no-caps class="q-mt-xs" @click="goToMashProfiles" />
      </template>
    </overview-empty-state-banner>

    <div v-else-if="!selectedMashProfile && !hasManualMashSteps" class="mash-pick-state column q-gutter-xs q-py-xs">
      <brew-pilot-label variant="secondary" size="11.5px" class="text-weight-medium q-mb-xs">
        Escolha um perfil de mostura para esta receita
      </brew-pilot-label>
      <div v-for="profile in quickMashProfiles" :key="profile.id"
        class="mash-pick-row row items-center no-wrap cursor-pointer rounded-borders"
        :class="{ 'mash-pick-row--default': profile.isDefault }"
        @click="selectMashProfile(profile)">
        <div :class="['mash-pick-icon', profile.isDefault && 'mash-pick-icon--default']">
          <q-icon v-if="profile.isDefault" name="mdi-star" color="amber-7" size="9px" />
          <q-icon name="mdi-thermometer" :color="profile.isDefault ? 'amber-8' : 'grey-5'" size="14px" />
        </div>
        <div class="col q-ml-xs">
          <div class="mash-pick-name ellipsis">{{ profile.name }}</div>
          <div class="mash-pick-caption">{{ mashProfileSummary(profile) }}</div>
        </div>
        <q-icon name="mdi-chevron-right" color="grey-5" size="16px" />
      </div>
      <div v-if="sortedMashProfiles.length > 3" class="text-center q-mt-xs">
        <brew-pilot-button variant="flat" no-caps size="xs" label="Ver todos"
          icon="mdi-dots-horizontal" @click="changeMashDialog = true" />
      </div>
    </div>

    <template v-else>
      <div v-if="selectedMashProfile" class="mash-profile-note q-mb-sm">
        <div v-if="selectedMashProfile.notes" class="mash-profile-note__text">{{ selectedMashProfile.notes }}</div>
        <div class="mash-meta-row q-mt-xs">
          <span class="mash-meta-chip"><q-icon name="mdi-stairs" size="10px" />{{ displayMashSteps.length }} etapas</span>
          <span class="mash-meta-chip"><q-icon name="mdi-clock-outline" size="10px" />{{ totalMashTime }}min</span>
          <span class="mash-meta-chip"><q-icon name="mdi-thermometer" size="10px" />{{ mashTempRange }}</span>
          <span v-if="totalMashRamp > 0" class="mash-meta-chip mash-meta-chip--ramp"><q-icon name="mdi-trending-up" size="10px" />{{ stepsWithRamp }} rampas · {{ totalMashRamp }}min</span>
        </div>
      </div>

      <mash-steps-table :steps="displayMashSteps" class="mash-steps-table-wrap" />

      <div class="mash-footer q-mt-sm">
        <div class="mash-footer__profile-row">
          <span v-if="selectedMashProfile?.spargeTemperature" class="mash-footer-chip">
            <q-icon name="mdi-thermometer-water" size="11px" />Lavagem {{ selectedMashProfile.spargeTemperature }}°C
          </span>
        </div>

        <div class="mash-footer__stats-row">
          <div class="mash-stat-card">
            <span class="mash-stat-card__tag">FG</span>
            <div class="mash-stat-card__body">
              <div class="mash-stat-card__label">Densidade final esperada</div>
              <div class="mash-stat-card__value">{{ fgDisplay }}</div>
            </div>
          </div>
          <div class="mash-stat-card">
            <span class="mash-stat-card__tag">AA</span>
            <div class="mash-stat-card__body">
              <div class="mash-stat-card__label">Atenuação aparente</div>
              <div class="mash-stat-card__value">{{ attenuationDisplay }}</div>
            </div>
          </div>
          <div class="mash-stat-card">
            <span class="mash-stat-card__tag">ABV</span>
            <div class="mash-stat-card__body">
              <div class="mash-stat-card__label">Álcool por volume</div>
              <div class="mash-stat-card__value">{{ abvDisplay }}</div>
            </div>
          </div>
          <div class="mash-stat-card mash-stat-card--muted">
            <span class="mash-stat-card__tag">100 ML</span>
            <div class="mash-stat-card__body">
              <div class="mash-stat-card__label">Energia por 100 ml</div>
              <div class="mash-stat-card__value">{{ energyValueDisplay }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </recipe-section>

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

    <q-list dense>
      <q-item v-for="step in sortedFermSteps" :key="step.id" class="q-px-xs q-py-none mash-row">
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

    <div v-if="recipe.carbonationMin || recipe.carbonationMax"
      class="text-right q-mt-xs" style="font-size:10.5px;color:rgba(255,255,255,0.4)">
      Carbonatação
      <strong style="color:#e57373">
        {{ recipe.carbonationMin ?? '—' }} - {{ recipe.carbonationMax ?? '—' }}
      </strong>
      volumes de CO₂
    </div>
  </recipe-section>

  <brew-pilot-dialog v-model="fgDialog" title="Densidade Final Medida"
    icon="mdi-test-tube" icon-color="orange-6" width="520px">
    <q-card-section class="fg-dialog q-pa-md">
      <div class="fg-dialog__hero">
        <div class="fg-dialog__hero-icon">
          <q-icon name="mdi-hydrometer" size="18px" />
        </div>
        <div class="fg-dialog__hero-copy">
          <div class="fg-dialog__hero-title">Leitura real da fermentação</div>
          <div class="fg-dialog__hero-text">
            Registre a FG medida para comparar o resultado real com a projeção da receita e acompanhar corpo,
            atenuação e álcool final com mais precisão.
          </div>
        </div>
      </div>

      <div class="fg-dialog__metrics">
        <div class="fg-dialog__metric-card">
          <span class="fg-dialog__metric-label">Estimativa atual</span>
          <strong class="fg-dialog__metric-value">{{ estimatedFgDisplay }}</strong>
          <span class="fg-dialog__metric-caption">Calculada a partir da receita</span>
        </div>
        <div class="fg-dialog__metric-card fg-dialog__metric-card--muted">
          <span class="fg-dialog__metric-label">Última leitura salva</span>
          <strong class="fg-dialog__metric-value">{{ currentMeasuredFgDisplay }}</strong>
          <span class="fg-dialog__metric-caption">Valor persistido nesta receita</span>
        </div>
      </div>

      <div class="fg-dialog__input-panel">
        <div class="fg-dialog__input-head">
          <div>
            <div class="fg-dialog__input-title">Nova leitura</div>
            <div class="fg-dialog__input-text">Use a densidade medida com densímetro ou leitura corrigida do refratômetro.</div>
          </div>
          <brew-pilot-button variant="outline" no-caps size="sm" icon="mdi-auto-fix"
            label="Usar estimada" @click="applyEstimatedFg" />
        </div>

        <brew-pilot-input
          v-model.number="measuredFg"
          type="number"
          step="0.001"
          min="1.000"
          max="1.060"
          label="FG medida"
          suffix="SG"
          :hint="fgInputHint" />
      </div>

      <div class="fg-dialog__insights">
        <div class="fg-dialog__insight-card" :class="fgDeltaToneClass">
          <span class="fg-dialog__insight-label">Leitura vs estimativa</span>
          <strong class="fg-dialog__insight-value">{{ fgDeltaDisplay }}</strong>
          <span class="fg-dialog__insight-text">{{ fgDeltaDescription }}</span>
        </div>
        <div class="fg-dialog__insight-card">
          <span class="fg-dialog__insight-label">ABV projetado</span>
          <strong class="fg-dialog__insight-value">{{ fgPreviewAbvDisplay }}</strong>
          <span class="fg-dialog__insight-text">Álcool estimado com base na leitura informada</span>
        </div>
        <div class="fg-dialog__insight-card">
          <span class="fg-dialog__insight-label">Atenuação aparente</span>
          <strong class="fg-dialog__insight-value">{{ fgPreviewAttenuationDisplay }}</strong>
          <span class="fg-dialog__insight-text">Percentual previsto de fermentação consumida</span>
        </div>
      </div>
    </q-card-section>
    <template #footer>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="fgDialog = false" />
        <brew-pilot-button variant="filled" no-caps label="Salvar leitura" color="positive"
          :disable="!isMeasuredFgValid" @click="saveFg" />
      </q-card-actions>
    </template>
  </brew-pilot-dialog>

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
            <q-btn flat round dense icon="delete" color="negative" @click="recipe.mashSteps.splice(i, 1)" />
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
            <q-btn flat round dense icon="delete" color="negative" @click="fermSteps.splice(i, 1)" />
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

  <change-mash-profile-dialog
    v-if="section === 'mash'"
    v-model="changeMashDialog"
    :selected-profile-id="recipe.mashProfileId"
    @selected="selectMashProfile" />

  <edit-mash-profile-dialog
    v-if="section === 'mash'"
    v-model="editMashProfileDialog"
    :base-profile="editMashProfileBase"
    @saved="applyMashProfile" />

  <brew-pilot-dialog v-model="changeFermDialog" title="Alterar Perfil de Fermentação"
    icon="mdi-swap-horizontal" icon-color="blue-5" width="360px">
    <q-card-section>
      <div class="q-gutter-sm">
        <brew-pilot-button
          v-for="preset in fermPresets" :key="preset.label"
          variant="outline" no-caps class="full-width"
          :label="preset.label"
          @click="applyFermPreset(preset)" />
      </div>
    </q-card-section>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipeStore'
import { useMashProfileStore } from '@/stores/mashProfileStore'
import type { FermentationStep, RecipeMashStep } from '@/types/recipe'
import type { MashProfile } from '@/types/mash'
import ChangeMashProfileDialog from '@/pages/recipes/components/overview/dialogs/ChangeMashProfileDialog.vue'
import EditMashProfileDialog from '@/pages/profiles/mash/EditMashProfileDialog.vue'
import MashStepsTable from '@/pages/profiles/mash/MashStepsTable.vue'
import OverviewEmptyStateBanner from './OverviewEmptyStateBanner.vue'

const props = defineProps<{ section: 'mash' | 'fermentation' }>()

const router = useRouter()
const store = useRecipeStore()
const mashStore = useMashProfileStore()
const recipe = computed(() => store.currentRecipe!)
const stats = computed(() => store.stats)

const fgDialog = ref(false)
const editMashDialog = ref(false)
const editFermDialog = ref(false)
const changeMashDialog = ref(false)
const changeFermDialog = ref(false)
const editMashProfileDialog = ref(false)
const editMashProfileBase = ref<MashProfile | null>(null)
const measuredFg = ref(1.010)

const selectedMashProfile = computed(() => {
  if (recipe.value.mashProfileId) {
    return mashStore.profiles.find(profile => profile.id === recipe.value.mashProfileId) ?? recipe.value.mashProfile ?? null
  }
  return recipe.value.mashProfile ?? null
})

const hasBootstrapMashSteps = computed(() => isBootstrapMashSteps(recipe.value.mashSteps))

const hasMashProfiles = computed(() => mashStore.profiles.length > 0)
const hasMultipleMashProfiles = computed(() => mashStore.profiles.length > 1)
const hasNoMashProfiles = computed(() => !mashStore.loading && mashStore.profiles.length === 0)
const hasManualMashSteps = computed(() => recipe.value.mashSteps.length > 0 && !selectedMashProfile.value && !hasBootstrapMashSteps.value)

const sortedMashProfiles = computed(() =>
  [...mashStore.profiles].sort((a, b) => {
    const defaultOrder = Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault))
    return defaultOrder || a.name.localeCompare(b.name, 'pt-BR')
  })
)

const quickMashProfiles = computed(() => sortedMashProfiles.value.slice(0, 3))

const sortedMashSteps = computed(() =>
  [...recipe.value.mashSteps].sort((a, b) => a.sortOrder - b.sortOrder)
)

const fermSteps = computed<FermentationStep[]>({
  get: () => recipe.value.fermentationSteps ?? [],
  set: value => { recipe.value.fermentationSteps = value }
})

const sortedFermSteps = computed(() =>
  [...fermSteps.value].sort((a, b) => a.sortOrder - b.sortOrder)
)

const mashProfileName = computed(() => {
  if (selectedMashProfile.value?.name) return selectedMashProfile.value.name
  if (hasManualMashSteps.value) return 'Perfil Manual'
  return 'Perfil de Mostura'
})

const fermProfileName = computed(() => {
  const steps = fermSteps.value
  if (!steps.length) return 'Perfil de Fermentação'
  return steps.map(step => step.name).join(', ')
})

const attenuation = computed(() => {
  if (!stats.value) return 0
  const { og, fg } = stats.value
  return (((og - fg) / (og - 1)) * 100).toFixed(1)
})

const totalMashTime = computed(() => selectedMashProfile.value?.steps.reduce((sum, step) => sum + (step.time ?? 0), 0) ?? 0)
const totalMashRamp = computed(() => displayMashSteps.value.reduce((sum, step) => sum + (step.rampDuration ?? 0), 0))
const stepsWithRamp = computed(() => displayMashSteps.value.filter(step => (step.rampDuration ?? 0) > 0).length)

const displayMashSteps = computed(() => {
  if (selectedMashProfile.value) return selectedMashProfile.value.steps
  return sortedMashSteps.value.map((step, index) => ({
    id: step.id,
    name: step.name,
    description: undefined,
    stepType: step.type,
    temperature: step.temperature,
    time: step.time,
    rampDuration: undefined,
    waterRatio: step.waterRatio,
    infuseAmount: undefined,
    infusionTemperature: undefined,
    endTemperature: undefined,
    stepNumber: index,
  }))
})

const mashMethodLabel = computed(() => {
  const profile = selectedMashProfile.value
  if (!profile) return 'Manual'
  if (profile.biab) return 'BIAB'
  if (profile.batchSparge) return 'Batch Sparge'
  return 'Infusão'
})

const mashTempRange = computed(() => {
  if (!displayMashSteps.value.length) return '—'
  const temperatures = displayMashSteps.value.map(step => step.temperature)
  const min = Math.min(...temperatures)
  const max = Math.max(...temperatures)
  return min === max ? `${min} °C` : `${min}–${max} °C`
})

const fgDisplay = computed(() => stats.value ? stats.value.fg.toFixed(3) : '—')
const estimatedFgValue = computed(() => stats.value?.fg ?? null)
const estimatedFgDisplay = computed(() => estimatedFgValue.value?.toFixed(3) ?? '—')
const currentMeasuredFgValue = computed(() => recipe.value.measuredFg ?? null)
const currentMeasuredFgDisplay = computed(() => currentMeasuredFgValue.value?.toFixed(3) ?? 'Ainda não registrada')
const attenuationDisplay = computed(() => {
  const value = Number(attenuation.value)
  return Number.isFinite(value) ? `${value.toFixed(1)}%` : '—'
})
const abvDisplay = computed(() => stats.value ? `${stats.value.abv.toFixed(1)}%` : '—')
const energyValueDisplay = computed(() => {
  if (!stats.value || stats.value.caloriesPer100Ml <= 0) return '—'
  return `${stats.value.caloriesPer100Ml} kcal · ${stats.value.energyKjPer100Ml} kJ · ${stats.value.carbsPer100Ml.toFixed(1)} g`
})
const fgDeltaValue = computed(() => {
  if (estimatedFgValue.value == null) return null
  return measuredFg.value - estimatedFgValue.value
})
const fgDeltaDisplay = computed(() => {
  const delta = fgDeltaValue.value
  if (delta == null) return '—'
  if (Math.abs(delta) < 0.0005) return 'Alinhada com a meta'
  const sign = delta > 0 ? '+' : '−'
  return `${sign}${Math.abs(delta).toFixed(3)} SG`
})
const fgDeltaDescription = computed(() => {
  const delta = fgDeltaValue.value
  if (delta == null || Math.abs(delta) < 0.0005) {
    return 'A leitura está praticamente no alvo previsto para esta receita.'
  }
  if (delta > 0) {
    return 'FG acima do esperado: tende a entregar mais corpo, dulçor residual e menor atenuação.'
  }
  return 'FG abaixo do esperado: tende a deixar a cerveja mais seca, leve e com maior atenuação.'
})
const fgDeltaToneClass = computed(() => {
  const delta = fgDeltaValue.value
  if (delta == null || Math.abs(delta) < 0.0005) return 'fg-dialog__insight-card--ok'
  return delta > 0 ? 'fg-dialog__insight-card--warm' : 'fg-dialog__insight-card--cool'
})
const fgPreviewAbvDisplay = computed(() => {
  if (!stats.value) return '—'
  const abv = Math.max(0, (stats.value.og - measuredFg.value) * 131.25)
  return `${abv.toFixed(1)}%`
})
const fgPreviewAttenuationDisplay = computed(() => {
  if (!stats.value) return '—'
  const gravitySpan = stats.value.og - 1
  if (gravitySpan <= 0) return '—'
  const attenuationValue = Math.max(0, ((stats.value.og - measuredFg.value) / gravitySpan) * 100)
  return `${attenuationValue.toFixed(1)}%`
})
const fgInputHint = computed(() => currentMeasuredFgValue.value != null
  ? `Última leitura salva: ${currentMeasuredFgValue.value.toFixed(3)}`
  : `Estimativa calculada: ${estimatedFgDisplay.value}`)
const isMeasuredFgValid = computed(() => Number.isFinite(measuredFg.value) && measuredFg.value >= 1 && measuredFg.value <= 1.06)

onMounted(async () => {
  if (props.section !== 'mash') return
  if (!mashStore.profiles.length) await mashStore.fetchAll()
  normalizeBootstrapMashSteps()
  syncSelectedMashProfile()
  tryAutoSelectMashProfile()
})

watch(() => mashStore.profiles, () => {
  if (props.section !== 'mash') return
  normalizeBootstrapMashSteps()
  syncSelectedMashProfile()
  tryAutoSelectMashProfile()
})

watch(fgDialog, isOpen => {
  if (!isOpen) return
  measuredFg.value = Number((currentMeasuredFgValue.value ?? estimatedFgValue.value ?? 1.01).toFixed(3))
})

function isBootstrapMashSteps(steps: RecipeMashStep[]) {
  if (steps.length !== 2) return false
  const [firstStep, secondStep] = [...steps].sort((a, b) => a.sortOrder - b.sortOrder)
  return firstStep?.name === 'Sacarificação'
    && firstStep?.type === 'Infusion'
    && firstStep?.temperature === 67
    && firstStep?.time === 75
    && secondStep?.name === 'MashOut'
    && secondStep?.type === 'Temperature'
    && secondStep?.temperature === 75
    && secondStep?.time === 10
}

function normalizeBootstrapMashSteps() {
  if (recipe.value.mashProfileId || recipe.value.mashProfile) return
  if (!hasBootstrapMashSteps.value) return
  recipe.value.mashSteps = []
}

function syncSelectedMashProfile() {
  if (!recipe.value.mashProfileId) return
  const matched = mashStore.profiles.find(profile => profile.id === recipe.value.mashProfileId)
  if (matched) {
    recipe.value.mashProfile = matched
  }
}

function tryAutoSelectMashProfile() {
  if (recipe.value.mashProfileId || recipe.value.mashProfile || hasManualMashSteps.value) return
  const defaultProfile = mashStore.profiles.find(profile => profile.isDefault)
  if (defaultProfile) {
    selectMashProfile(defaultProfile, false)
  }
}

function mapMashProfileSteps(profile: MashProfile): RecipeMashStep[] {
  return profile.steps.map((step, index) => ({
    id: crypto.randomUUID(),
    name: step.name,
    type: step.stepType,
    temperature: step.temperature,
    time: step.time,
    waterRatio: step.waterRatio,
    sortOrder: index,
  }))
}

function mashProfileSummary(profile: MashProfile) {
  const infusionStep = profile.steps.find(step => step.stepType === 'Infusion')
  const totalTime = profile.steps.reduce((sum, step) => sum + (step.time ?? 0), 0)
  const lead = infusionStep ? `${infusionStep.temperature}°C` : `${profile.steps.length} etapa(s)`
  return `${lead} · ${totalTime}min total`
}

function selectMashProfile(profile: MashProfile, closeDialog = true) {
  recipe.value.mashProfileId = profile.id
  recipe.value.mashProfile = profile
  recipe.value.mashSteps = mapMashProfileSteps(profile)
  if (closeDialog) changeMashDialog.value = false
}

function applyMashProfile(profile: MashProfile) {
  selectMashProfile(profile, false)
  editMashProfileDialog.value = false
  changeMashDialog.value = false
}

function openEditSelectedMashProfile() {
  if (!selectedMashProfile.value) return
  editMashProfileBase.value = selectedMashProfile.value
  editMashProfileDialog.value = true
}

function goToMashProfiles() {
  router.push('/profiles/mash')
}

function applyEstimatedFg() {
  if (estimatedFgValue.value == null) return
  measuredFg.value = Number(estimatedFgValue.value.toFixed(3))
}

function saveFg() {
  if (!isMeasuredFgValid.value) return
  recipe.value.measuredFg = Number(measuredFg.value.toFixed(3))
  fgDialog.value = false
}

function addMashStep() {
  recipe.value.mashProfileId = undefined
  recipe.value.mashProfile = undefined
  recipe.value.mashSteps.push({
    id: crypto.randomUUID(),
    name: 'Nova Etapa',
    type: 'Infusion',
    temperature: 67,
    time: 60,
    waterRatio: 3.0,
    sortOrder: recipe.value.mashSteps.length,
  } as RecipeMashStep)
}

function addFermStep() {
  if (!recipe.value.fermentationSteps) recipe.value.fermentationSteps = []
  recipe.value.fermentationSteps.push({
    id: crypto.randomUUID(),
    name: 'Nova Etapa',
    temperature: 20,
    days: 7,
    sortOrder: recipe.value.fermentationSteps.length,
  } as FermentationStep)
}

function applyFermPreset(preset: typeof fermPresets[0]) {
  if (!recipe.value.fermentationSteps) recipe.value.fermentationSteps = []
  recipe.value.fermentationSteps.splice(0)
  preset.steps.forEach((step, index) => {
    recipe.value.fermentationSteps!.push({ id: crypto.randomUUID(), sortOrder: index, ...step } as FermentationStep)
  })
  changeFermDialog.value = false
}

const fermPresets = [
  {
    label: 'Ale Padrão',
    steps: [
      { name: 'Primária', temperature: 20, days: 7 },
      { name: 'Secundária', temperature: 20, days: 14 },
      { name: 'Envase', temperature: 18.3, days: 30 },
    ],
  },
  {
    label: 'Lager',
    steps: [
      { name: 'Primária', temperature: 10, days: 14 },
      { name: 'Diacetyl Rest', temperature: 18, days: 2 },
      { name: 'Lagering', temperature: 1, days: 21 },
      { name: 'Envase', temperature: 18.3, days: 30 },
    ],
  },
]
</script>

<style scoped>
.mash-row {
  border-radius: 3px;
}

.mash-step-row {
  background: rgba(255,255,255,0.04);
  border-radius: 6px;
}

.fg-dialog {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.fg-dialog__hero {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  background:
    linear-gradient(135deg, color-mix(in srgb, #c1710e 16%, transparent), color-mix(in srgb, #7a4a1e 8%, transparent));
  border: 1px solid color-mix(in srgb, #c1710e 20%, transparent);
}

.fg-dialog__hero-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #8d5318;
  background: color-mix(in srgb, #c1710e 18%, white);
  border: 1px solid color-mix(in srgb, #c1710e 26%, transparent);
}

.fg-dialog__hero-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--bp-text-primary);
}

.fg-dialog__hero-text {
  margin-top: 3px;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--bp-text-secondary);
}

.fg-dialog__metrics,
.fg-dialog__insights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.fg-dialog__insights {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.fg-dialog__metric-card,
.fg-dialog__insight-card,
.fg-dialog__input-panel {
  padding: 12px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--q-primary) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--q-primary) 14%, transparent);
}

.fg-dialog__metric-card--muted {
  background: color-mix(in srgb, #8c6a45 8%, transparent);
  border-color: color-mix(in srgb, #8c6a45 14%, transparent);
}

.fg-dialog__metric-label,
.fg-dialog__insight-label {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bp-text-muted);
}

.fg-dialog__metric-value,
.fg-dialog__insight-value {
  display: block;
  margin-top: 6px;
  font-size: 16px;
  font-weight: 700;
  color: var(--bp-text-primary);
}

.fg-dialog__metric-caption,
.fg-dialog__insight-text,
.fg-dialog__input-text {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--bp-text-secondary);
}

.fg-dialog__input-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fg-dialog__input-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.fg-dialog__input-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--bp-text-primary);
}

.fg-dialog__insight-card--ok {
  background: color-mix(in srgb, #2e7d32 8%, transparent);
  border-color: color-mix(in srgb, #2e7d32 18%, transparent);
}

.fg-dialog__insight-card--warm {
  background: color-mix(in srgb, #c1710e 9%, transparent);
  border-color: color-mix(in srgb, #c1710e 18%, transparent);
}

.fg-dialog__insight-card--cool {
  background: color-mix(in srgb, #1565c0 8%, transparent);
  border-color: color-mix(in srgb, #1565c0 18%, transparent);
}

.mash-profile-note {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mash-profile-note__text {
  font-size: 11.5px;
  color: var(--bp-text-secondary);
  line-height: 1.45;
}

.mash-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mash-meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 99px;
  background: color-mix(in srgb, #a0622a 12%, transparent);
  color: #7a4a1e;
  border: 1px solid color-mix(in srgb, #a0622a 22%, transparent);
}

.mash-meta-chip--ramp {
  background: color-mix(in srgb, #c1710e 10%, transparent);
  color: #9a5510;
  border-color: color-mix(in srgb, #c1710e 25%, transparent);
}

.mash-steps-table-wrap {
  border-radius: 8px;
  overflow: hidden;
}

.mash-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mash-footer__profile-row,
.mash-footer__stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mash-footer__stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.mash-stat-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-height: 52px;
  padding: 8px 10px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--q-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--q-primary) 16%, transparent);
}

.mash-stat-card--muted {
  background: color-mix(in srgb, #8c6a45 9%, transparent);
  border-color: color-mix(in srgb, #8c6a45 16%, transparent);
}

.mash-stat-card__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #7a4a1e;
  background: color-mix(in srgb, #c1710e 12%, white);
  border: 1px solid color-mix(in srgb, #c1710e 22%, transparent);
}

.mash-stat-card__body {
  min-width: 0;
}

.mash-stat-card__label {
  font-size: 10.5px;
  line-height: 1.2;
  color: var(--bp-text-secondary);
}

.mash-stat-card__value {
  margin-top: 3px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--bp-text-primary);
}

.mash-footer-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 24px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  color: var(--bp-text-secondary);
  background: color-mix(in srgb, var(--q-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--q-primary) 16%, transparent);
}

.mash-footer-chip--stat {
  color: var(--bp-text-primary);
}

.mash-footer-chip--muted {
  color: var(--bp-text-muted);
}

:deep(.mash-profile-badge) {
  font-size: 0.74rem !important;
  font-weight: 600;
}

.body--dark .mash-meta-chip,
.body--dark .mash-footer-chip {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.76);
  border-color: rgba(255, 255, 255, 0.12);
}

.body--dark .mash-stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .mash-stat-card--muted {
  background: rgba(255, 255, 255, 0.04);
}

.body--dark .mash-stat-card__tag {
  color: #f0b855;
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  border-color: color-mix(in srgb, #f59e0b 25%, transparent);
}

.body--dark .fg-dialog__hero,
.body--dark .fg-dialog__metric-card,
.body--dark .fg-dialog__insight-card,
.body--dark .fg-dialog__input-panel {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .fg-dialog__hero-icon {
  color: #f0b855;
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  border-color: color-mix(in srgb, #f59e0b 24%, transparent);
}

.body--dark .fg-dialog__insight-card--ok {
  background: color-mix(in srgb, #43a047 10%, transparent);
  border-color: color-mix(in srgb, #43a047 20%, transparent);
}

.body--dark .fg-dialog__insight-card--warm {
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  border-color: color-mix(in srgb, #f59e0b 24%, transparent);
}

.body--dark .fg-dialog__insight-card--cool {
  background: color-mix(in srgb, #42a5f5 10%, transparent);
  border-color: color-mix(in srgb, #42a5f5 20%, transparent);
}

@media (max-width: 640px) {
  .fg-dialog__metrics,
  .fg-dialog__insights {
    grid-template-columns: 1fr;
  }

  .fg-dialog__input-head {
    flex-direction: column;
    align-items: stretch;
  }
}

.body--dark .mash-meta-chip--ramp,
.body--dark .mash-footer-chip--profile {
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  color: #f0b855;
  border-color: color-mix(in srgb, #f59e0b 25%, transparent);
}

.mash-pick-row:hover {
  background: rgba(193, 113, 14, 0.06);
  border-color: rgba(193, 113, 14, 0.18);
}

.mash-pick-row--default {
  border-left: 2px solid #f59e0b;
  border-color: color-mix(in srgb, #f59e0b 40%, var(--bp-border));
  background: color-mix(in srgb, #f59e0b 4%, var(--bp-surface-alt));
}

.mash-pick-icon {
  background: color-mix(in srgb, var(--q-primary) 10%, transparent);
  border-radius: 5px;
  padding: 3px 4px;
  display: flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
}

.mash-pick-icon--default {
  background: color-mix(in srgb, #f59e0b 15%, transparent);
}

.mash-pick-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--bp-text-primary);
}

.mash-pick-caption {
  font-size: 10.5px;
  color: var(--bp-text-muted);
}

.mash-info-icon {
  color: var(--bp-text-secondary);
}
</style>