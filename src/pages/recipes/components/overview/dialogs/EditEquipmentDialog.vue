<template>
  <brew-pilot-dialog v-model="open" :title="dialogTitle" icon="mdi-kettle"
    icon-color="orange-6" width="680px" scrollable>

    <template #header-actions>
      <q-btn flat round dense icon="mdi-help-circle-outline" color="grey-5">
        <q-tooltip>Ajuda sobre campos de equipamento</q-tooltip>
      </q-btn>
      <q-btn flat round dense
        :icon="form.isDefault ? 'mdi-star' : 'mdi-star-outline'"
        :color="form.isDefault ? 'amber' : 'grey-5'"
        @click="form.isDefault = !form.isDefault">
        <q-tooltip>{{ form.isDefault ? 'Equipamento padrão' : 'Definir como padrão' }}</q-tooltip>
      </q-btn>
    </template>

    <!-- Body rolável (gerenciado pelo scrollable=true do BrewPilotDialog) -->
    <div class="q-pa-md">

      <!-- Nome + Tempo + Descrição -->
       <div class="eq-card q-mb-sm">
        <div class="eq-card-title">Nome + Tempo + Descrição</div>
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm-7">
              <q-input v-model="form.name" outlined dense  label="Nome" />
            </div>
            <div class="col-12 col-sm-5">
              <q-input v-model.number="form.boilTime" type="number" outlined dense 
                label="Tempo de Fervura" suffix="min" />
            </div>
            <div class="col-12">
              <q-input v-model="form.notes" type="textarea" :rows="3" outlined dense 
                label="Descrição" />
            </div>
          </div>
        </div>

      <!-- ─ Volumes ─────────────────────────────────────────────────── -->
      <div class="eq-card q-mb-sm">
        <div class="eq-card-title">Volumes</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-select v-model="form.mashWaterMethod"
              :options="['Fermentador', 'Panela de Fervura']"
              outlined dense  label="Volume Desejado do Lote" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.batchVolume" type="number" outlined dense 
              label="Volume do Lote (Fermentador)" suffix="L" />
          </div>
          <div class="col-12">
            <q-checkbox v-model="form.calculateBoilVolume"  dense
              label="Calcular volume de fervura" color="positive" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              :model-value="form.calculateBoilVolume ? calcPreBoilVol : form.preBoilVolume"
              @update:model-value="v => { if (!form.calculateBoilVolume) form.preBoilVolume = +(v ?? 0) }"
              type="number" outlined dense 
              :label="form.calculateBoilVolume ? 'Volume Pré Fervura (calculado)' : 'Volume Pré Fervura'"
              suffix="L" :disable="form.calculateBoilVolume" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.boilOffRate" type="number" step="0.1"
              outlined dense  :label="`Evaporação (${evapPct}%)`" suffix="L/h" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.trubLoss" type="number" step="0.1"
              outlined dense  label="Perda Trub/Chiller" suffix="L" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.deadSpace" type="number" step="0.1"
              outlined dense  label="Espaço Morto Panela de Mostura" suffix="L" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.mashLoss" type="number" step="0.1"
              outlined dense  label="Perda na Panela de Mostura" suffix="L" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.spargeDeadSpace" type="number" step="0.1"
              outlined dense  label="Espaço Morto Panela de Lavagem" suffix="L" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.fermentorLoss" type="number" step="0.1"
              outlined dense  label="Perda no Fermentador" suffix="L" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.fermenterWater" type="number" step="0.1"
              outlined dense  label="Água no Fermentador" suffix="L" />
          </div>
          <div class="col-12">
            <div class="eq-info-row">
              <span>Volume Pós Fervura: <strong>{{ postBoilVol }} L</strong></span>
              <span>Volume de Engarrafamento: <strong>{{ bottlingVol }} L</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─ Eficiência ──────────────────────────────────────────────── -->
      <div class="eq-card q-mb-sm">
        <div class="eq-card-title">Eficiência</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.efficiency" type="number" step="0.1"
              outlined dense  label="Eficiência do Equipamento" suffix="%" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              :model-value="form.calculateMashEfficiency ? calcMashEff : form.mashEfficiency"
              @update:model-value="v => { if (!form.calculateMashEfficiency) form.mashEfficiency = +(v ?? 0) }"
              type="number" step="0.1" outlined dense 
              :label="form.calculateMashEfficiency ? 'Eficiência da Mostura (calculada)' : 'Eficiência da Mostura'"
              suffix="%" :disable="form.calculateMashEfficiency" />
          </div>
          <div class="col-12">
            <q-checkbox v-model="form.calculateMashEfficiency"  dense
              label="Calcular eficiência da mostura" color="positive" />
          </div>
        </div>
      </div>

      <!-- ─ Avançado ────────────────────────────────────────────────── -->
      <div class="eq-card q-mb-sm">
        <div class="eq-card-title">Avançado</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.hopUtilization" type="number" outlined dense 
              label="Multiplicador Utilização de Lúpulo" suffix="%" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.aromaHopUtilization" type="number" outlined dense 
              :label="form.calculateAromaHopUtil ? 'Utilização Lúpulo Aroma (calculada)' : 'Utilização Lúpulo de Aroma'"
              suffix="%" :disable="form.calculateAromaHopUtil" />
          </div>
          <div class="col-12">
            <q-checkbox v-model="form.calculateAromaHopUtil"  dense
              label="Calcular utilização de lúpulo de aroma" color="positive" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.hopstandTemperature" type="number" outlined dense 
              label="Temperatura de Hopstand" suffix="°C" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.whirlpoolTime" type="number" outlined dense 
              label="Tempo Whirlpool / No-Chill" suffix="min" />
          </div>
        </div>
      </div>

      <!-- ─ Altitude / Temperatura da Fervura ──────────────────────── -->
      <div class="eq-card q-mb-sm">
        <div class="eq-card-title">Altitude / Temperatura da Fervura</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <q-checkbox v-model="form.altitudeAdjust"  dense
              label="Ajuste de altitude" color="positive" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.altitude" type="number" outlined dense 
              label="Altitude" suffix="m" :disable="!form.altitudeAdjust" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              :model-value="form.altitudeAdjust ? calcBoilTemp : form.boilTemperature"
              @update:model-value="v => { if (!form.altitudeAdjust) form.boilTemperature = +(v ?? 0) }"
              type="number" step="0.1" outlined dense 
              :label="form.altitudeAdjust ? 'Temperatura de Fervura (calculada)' : 'Temperatura de Fervura'"
              suffix="°C" :disable="form.altitudeAdjust" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.boilExpansion" type="number" step="0.1"
              outlined dense  label="Contração/Expansão por Fervura" suffix="%" />
          </div>
        </div>
      </div>

      <!-- ─ Água de Mostura/Lavagem ──────────────────────────────────── -->
      <div class="eq-card q-mb-md">
        <div class="eq-card-title">Água de Mostura / Lavagem</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.grainAbsorptionRate" type="number" step="0.01"
              outlined dense  label="Taxa de Absorção de Grãos" suffix="L/kg" />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model.number="form.waterToGrainRatio" type="number" step="0.1"
              outlined dense  label="Relação Água/Grão" suffix="L/kg" />
          </div>
          <div class="col-12">
            <q-select v-model="form.mashWaterMethod"
              :options="['Padrão', 'Por Relação Água/Grão', 'Manual']"
              outlined dense 
              label="Método de Cálculo da Água Mostura/Lavagem" />
          </div>
        </div>
      </div>

    </div>

    <template #footer>
      <div class="row items-center q-px-md q-py-sm" style="gap:8px">
        <brew-pilot-button v-if="isEditing" variant="outline" no-caps label="Copiar"
          icon="mdi-content-copy" size="sm" @click="copyEquip" />
        <q-space />
        <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="open = false" />
        <brew-pilot-button variant="filled" color="positive" no-caps
          :label="isEditing ? 'Salvar' : 'Criar Perfil'"
          icon="mdi-content-save" :loading="saving" @click="save" />
      </div>
    </template>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import BrewPilotButton from '@/components/shared/BrewPilotButton.vue'
import { useRecipeStore } from '@/stores/recipeStore'
import { useEquipmentStore } from '@/stores/equipmentStore'
import type { EquipmentProfile } from '@/types/equipment'

const props = defineProps<{
  modelValue: boolean
  /** Perfil base para criar/editar. null = formulário em branco. isDefault=true = criar cópia. */
  baseProfile?: EquipmentProfile | null
}>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  'saved': [profile: EquipmentProfile]
}>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const recipeStore = useRecipeStore()
const equipStore  = useEquipmentStore()
const recipe      = computed(() => recipeStore.currentRecipe!)

/** Se tem id próprio (não é global) → estamos editando; senão criando */
const editingId = ref<string | null>(null)
const isEditing = computed(() => !!editingId.value)
const dialogTitle = computed(() => isEditing.value ? 'Editar Perfil de Equipamento' : 'Criar Perfil de Equipamento')
const saving = ref(false)

const defaultForm = () => ({
  name: '',
  batchVolume: 20, preBoilVolume: 24, boilTime: 60, efficiency: 72,
  mashEfficiency: 76, boilTemperature: 100, boilOffRate: 4,
  trubLoss: 2, fermentorLoss: 1, deadSpace: 1,
  notes: '' as string | undefined,
  isDefault: false,
  mashTunVolume: 30,
  mashLoss: 0,
  spargeDeadSpace: undefined as number | undefined,
  fermenterWater: undefined as number | undefined,
  calculateBoilVolume: false,
  calculateMashEfficiency: false,
  hopUtilization: 100,
  aromaHopUtilization: 76,
  calculateAromaHopUtil: true,
  hopstandTemperature: 96,
  whirlpoolTime: 20,
  altitudeAdjust: false,
  altitude: undefined as number | undefined,
  boilExpansion: 4,
  grainAbsorptionRate: 0.8,
  waterToGrainRatio: 3.0,
  mashWaterMethod: 'Padrão',
})

const form = ref(defaultForm())

watch(() => props.modelValue, (v) => { if (v) initForm() }, { immediate: true })

function initForm() {
  const base = props.baseProfile

  if (base && !base.isDefault) {
    // Editando perfil próprio do usuário
    editingId.value = base.id
    form.value = { ...defaultForm(), ...base, notes: base.notes ?? '' }
  } else if (base && base.isDefault) {
    // Criando cópia a partir de perfil global
    editingId.value = null
    form.value = { ...defaultForm(), ...base, name: base.name + ' (Meu)', notes: base.notes ?? '', isDefault: false }
  } else {
    // Novo do zero
    editingId.value = null
    form.value = {
      ...defaultForm(),
      batchVolume:   recipe.value.batchVolume,
      preBoilVolume: recipe.value.preBoilVolume ?? 24,
      boilTime:      recipe.value.boilTime,
      efficiency:    recipe.value.efficiency,
    }
  }
}

// Computed de volumes
const calcPreBoilVol = computed(() => {
  const f = form.value
  const evap = (f.boilOffRate * f.boilTime) / 60
  return +(f.batchVolume + f.trubLoss + f.fermentorLoss + evap).toFixed(2)
})
const postBoilVol = computed(() =>
  +(form.value.batchVolume + form.value.trubLoss).toFixed(2)
)
const bottlingVol = computed(() =>
  +(form.value.batchVolume - form.value.fermentorLoss).toFixed(2)
)
const evapPct = computed(() => {
  const f = form.value
  const preBoil = f.calculateBoilVolume ? calcPreBoilVol.value : f.preBoilVolume
  if (!preBoil) return 0
  const evap = (f.boilOffRate * f.boilTime) / 60
  return +(evap / preBoil * 100).toFixed(1)
})
const calcMashEff = computed(() => {
  const f = form.value
  const preBoil = f.calculateBoilVolume ? calcPreBoilVol.value : f.preBoilVolume
  if (!preBoil || !f.batchVolume) return f.mashEfficiency
  return +(f.efficiency * preBoil / f.batchVolume).toFixed(1)
})
const calcBoilTemp = computed(() =>
  +(100 - (form.value.altitude ?? 0) * 0.0034).toFixed(1)
)

watch(calcPreBoilVol, (v) => {
  if (form.value.calculateBoilVolume) form.value.preBoilVolume = v
})

async function save() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      preBoilVolume: form.value.calculateBoilVolume ? calcPreBoilVol.value : form.value.preBoilVolume,
      isDefault: false,
    }
    let saved: EquipmentProfile
    if (editingId.value) {
      saved = await equipStore.update(editingId.value, payload)
    } else {
      saved = await equipStore.create(payload)
    }
    emit('saved', saved)
    open.value = false
  } catch (e) {
    console.error('Erro ao salvar perfil de equipamento:', e)
  } finally {
    saving.value = false
  }
}

function copyEquip() {
  form.value.name = form.value.name + ' (Cópia)'
  editingId.value = null
}
</script>

<style scoped>
.eq-card {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 10px 12px 14px;
}

.eq-card-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--bp-text-muted);
  margin-bottom: 10px;
}

.eq-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 12px;
  color: var(--bp-text-muted);
}
</style>
