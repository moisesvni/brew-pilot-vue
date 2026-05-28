<template>
  <brew-pilot-dialog
    v-model="open"
    title="Editar Fermentável"
    icon="mdi-barley"
    icon-color="primary"
    width="620px"
    scrollable
  >
    <template #header-actions>
      <q-btn v-if="editItem?.ingredientId" flat round dense size="sm"
        icon="mdi-database-sync-outline" color="grey-5">
        <q-tooltip>Atualizar da base de ingredientes</q-tooltip>
      </q-btn>
    </template>

    <q-card-section v-if="editItem" class="q-pt-md q-pb-sm q-px-md">

      <!-- ── Identificação ─────────────────────────────────────────────── -->
      <div class="efv-section-label">Identificação</div>
      <div class="row q-col-gutter-sm q-mb-xs">
        <div class="col-12 col-sm-7">
          <q-input v-model="editItem.name" outlined dense label="Nome" />
        </div>
        <div class="col-12 col-sm-5">
          <q-select v-model="editItem.category" :options="categoryOpts" emit-value map-options
            outlined dense label="Categoria" clearable />
        </div>
        <div class="col-12 col-sm-6">
          <q-input v-model="editItem.supplier" outlined dense label="Fornecedor" />
        </div>
        <div class="col-12 col-sm-6">
          <q-input v-model="editItem.origin" outlined dense label="Origem (país)" />
        </div>
      </div>

      <q-separator class="q-my-sm" />

      <!-- ── Uso na receita ─────────────────────────────────────────────── -->
      <div class="efv-section-label">Uso na receita</div>
      <div class="row q-col-gutter-sm q-mb-xs">
        <div class="col-12 col-sm-4">
          <q-input v-model.number="amountDisplay" type="number" step="0.001"
            outlined dense :label="amountUnit === 'kg' ? 'Quantidade (kg)' : 'Quantidade (g)'"
            :suffix="amountUnit"
            @update:model-value="onAmountChange">
            <template #append>
              <q-btn-toggle v-model="amountUnit" flat no-caps dense size="xs"
                toggle-color="primary" color="grey-6"
                :options="[{ label: 'kg', value: 'kg' }, { label: 'g', value: 'g' }]"
                style="border: 1px solid var(--bp-border); border-radius: 4px; overflow: hidden" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-4">
          <q-select v-model="editItem.use" :options="useOptions" emit-value map-options
            outlined dense label="Uso" />
        </div>
        <div class="col-12 col-sm-4">
          <q-input v-model.number="editItem.colorEbc" type="number"
            outlined dense label="Cor" suffix="EBC">
            <template #prepend>
              <div class="efv-color-swatch" :style="{ background: swatchColor }" />
            </template>
          </q-input>
        </div>
      </div>

      <q-separator class="q-my-sm" />

      <!-- ── Características ────────────────────────────────────────────── -->
      <div class="efv-section-label">Características</div>
      <div class="row q-col-gutter-sm q-mb-xs">
        <div class="col-12 col-sm-4">
          <q-select v-model="editItem.type" :options="typeOptions" emit-value map-options
            outlined dense label="Tipo" />
        </div>
        <div class="col-6 col-sm-4">
          <q-input v-model.number="editItem.potential" type="number" step="0.001"
            outlined dense label="Potencial (PPG)" />
        </div>
        <div class="col-6 col-sm-4">
          <q-input v-model.number="editItem.yieldPercentage" type="number" step="0.1"
            outlined dense label="Rendimento" suffix="%" />
        </div>
        <div class="col-12 col-sm-4">
          <q-input v-model.number="editItem.diastaticPower" type="number"
            outlined dense label="Poder Diastático" suffix="°L"
            placeholder="—" clearable />
        </div>
      </div>

      <!-- ── Opções ─────────────────────────────────────────────────────── -->
      <div class="row q-gutter-md q-mt-xs q-mb-sm">
        <q-checkbox v-model="editItem.excludeFromTotal" dense size="sm"
          label="Excluir do total" color="primary" />
        <q-checkbox v-model="editItem.nonFermentable" dense size="sm"
          label="Não fermentável" color="primary" />
      </div>

      <q-separator class="q-my-sm" />

      <!-- ── Anotações ──────────────────────────────────────────────────── -->
      <div class="efv-section-label">Anotações</div>
      <q-input v-model="editItem.notes" outlined dense autogrow type="textarea"
        placeholder="Anotações adicionais sobre este fermentável..."
        class="q-mb-sm" input-style="min-height: 52px; font-size: 13px" />

      <!-- ── Informações do fabricante ──────────────────────────────────── -->
      <template v-if="editItem.description || editItem.usedIn">
        <div class="efv-section-label row items-center" style="gap:4px">
          <q-icon name="mdi-information-outline" size="13px" color="grey-6" />
          Informações do Fabricante
        </div>
        <div v-if="editItem.description" class="efv-info-box q-mb-xs">
          <div class="text-caption text-grey-5 q-mb-xs">Descrição</div>
          <div class="efv-info-text">{{ editItem.description }}</div>
        </div>
        <div v-if="editItem.usedIn" class="efv-info-box q-mb-xs">
          <div class="text-caption text-grey-5 q-mb-xs">Usado em</div>
          <div class="efv-info-text">{{ editItem.usedIn }}</div>
        </div>
        <div v-if="editItem.substitutes" class="efv-info-box q-mb-sm">
          <div class="text-caption text-grey-5 q-mb-xs">Substitutos</div>
          <div class="efv-info-text">{{ editItem.substitutes }}</div>
        </div>
      </template>

      <!-- ── Ver dados técnicos ─────────────────────────────────────────── -->
      <div v-if="hasTechnicalData" class="q-mt-xs">
        <q-btn flat no-caps size="sm" color="grey-5" class="full-width efv-details-btn"
          :icon-right="showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          :label="showDetails ? 'Ocultar dados técnicos' : 'Ver dados técnicos do fabricante'"
          @click="showDetails = !showDetails" />

        <transition name="efv-slide">
          <div v-if="showDetails" class="efv-details-panel q-mt-sm">
            <div class="efv-section-label row items-center" style="gap:4px">
              <q-icon name="mdi-flask-outline" size="13px" color="grey-6" />
              Dados Técnicos
            </div>
            <div class="row q-col-gutter-sm">
              <div v-if="editItem.moisture != null" class="col-6 col-sm-3">
                <div class="efv-spec-chip">
                  <div class="efv-spec-label">Umidade</div>
                  <div class="efv-spec-val">{{ editItem.moisture }}<span class="efv-spec-unit">%</span></div>
                </div>
              </div>
              <div v-if="editItem.protein != null" class="col-6 col-sm-3">
                <div class="efv-spec-chip">
                  <div class="efv-spec-label">Proteína</div>
                  <div class="efv-spec-val">{{ editItem.protein }}<span class="efv-spec-unit">%</span></div>
                </div>
              </div>
              <div v-if="editItem.coarseFineGrind != null" class="col-6 col-sm-3">
                <div class="efv-spec-chip">
                  <div class="efv-spec-label">Dif. Fina/Grossa</div>
                  <div class="efv-spec-val">{{ editItem.coarseFineGrind }}<span class="efv-spec-unit">%</span></div>
                </div>
              </div>
              <div v-if="editItem.fineGroundExtract != null" class="col-6 col-sm-3">
                <div class="efv-spec-chip">
                  <div class="efv-spec-label">Extrato (fina)</div>
                  <div class="efv-spec-val">{{ editItem.fineGroundExtract }}<span class="efv-spec-unit">%</span></div>
                </div>
              </div>
              <div v-if="editItem.acid != null" class="col-6 col-sm-3">
                <div class="efv-spec-chip">
                  <div class="efv-spec-label">Ácido</div>
                  <div class="efv-spec-val">{{ editItem.acid }}<span class="efv-spec-unit">%</span></div>
                </div>
              </div>
              <div v-if="editItem.friability != null" class="col-6 col-sm-3">
                <div class="efv-spec-chip">
                  <div class="efv-spec-label">Friabilidade</div>
                  <div class="efv-spec-val">{{ editItem.friability }}<span class="efv-spec-unit">%</span></div>
                </div>
              </div>
              <div v-if="editItem.freeAminoNitrogen != null" class="col-6 col-sm-3">
                <div class="efv-spec-chip">
                  <div class="efv-spec-label">FAN</div>
                  <div class="efv-spec-val">{{ editItem.freeAminoNitrogen }}<span class="efv-spec-unit">mg/L</span></div>
                </div>
              </div>
              <div v-if="editItem.maxInBatch != null" class="col-6 col-sm-3">
                <div class="efv-spec-chip">
                  <div class="efv-spec-label">Máx. na receita</div>
                  <div class="efv-spec-val">{{ editItem.maxInBatch }}<span class="efv-spec-unit">%</span></div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

    </q-card-section>

    <template #footer>
      <q-card-actions class="q-px-md q-py-sm">
        <q-btn flat no-caps label="Remover" icon="mdi-delete-outline" color="negative" size="sm" @click="remove" />
        <q-space />
        <q-btn flat no-caps label="Cancelar" color="grey-5" size="sm" @click="open = false" />
        <q-btn unelevated no-caps label="Salvar" icon="mdi-check" color="positive" size="sm" @click="save" />
      </q-card-actions>
    </template>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RecipeFermentable } from '@/types/recipe'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import { ebcToHex } from '@/utils/brewColors'

const props = defineProps<{
  modelValue: boolean
  item: RecipeFermentable | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', item: RecipeFermentable): void
  (e: 'remove', id: string): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const editItem = ref<RecipeFermentable | null>(null)
const showDetails = ref(false)
const amountUnit = ref<'kg' | 'g'>('kg')

const amountDisplay = computed({
  get: () => {
    if (!editItem.value) return 0
    return amountUnit.value === 'g'
      ? parseFloat((editItem.value.amount * 1000).toFixed(1))
      : parseFloat(editItem.value.amount.toFixed(4))
  },
  set: () => { /* handled by onAmountChange */ }
})

function onAmountChange(val: string | number | null) {
  if (!editItem.value) return
  const n = Number(val ?? 0)
  editItem.value.amount = amountUnit.value === 'g' ? n / 1000 : n
}

const swatchColor = computed(() =>
  editItem.value ? ebcToHex(editItem.value.colorEbc) : '#888'
)

const hasTechnicalData = computed(() => {
  const i = editItem.value
  if (!i) return false
  return (
    i.moisture != null || i.protein != null || i.coarseFineGrind != null ||
    i.fineGroundExtract != null || i.acid != null || i.friability != null ||
    i.freeAminoNitrogen != null || i.maxInBatch != null
  )
})

watch(() => props.item, item => {
  if (item) {
    editItem.value = { ...item }
    amountUnit.value = item.amount < 0.1 ? 'g' : 'kg'
    showDetails.value = false
  }
}, { immediate: true })

function save() {
  if (!editItem.value) return
  emit('save', { ...editItem.value })
  open.value = false
}

function remove() {
  if (!editItem.value) return
  emit('remove', editItem.value.id)
  open.value = false
}

const categoryOpts = [
  { label: 'Base', value: 'Base' },
  { label: 'Caramelo / Crystal', value: 'Crystal' },
  { label: 'Torrado', value: 'Roasted' },
  { label: 'Defumado', value: 'Smoked' },
  { label: 'Trigo', value: 'Wheat' },
  { label: 'Centeio', value: 'Rye' },
  { label: 'Aveia', value: 'Oats' },
  { label: 'Adjunto', value: 'Adjunct' },
  { label: 'Extrato', value: 'Extract' },
  { label: 'Mel / Xarope', value: 'Sugar' },
  { label: 'Outro', value: 'Other' },
]

const typeOptions = [
  { label: 'Grão', value: 'Grain' },
  { label: 'Extrato Seco', value: 'DryExtract' },
  { label: 'Extrato Líquido', value: 'LiquidExtract' },
  { label: 'Açúcar', value: 'Sugar' },
  { label: 'Mel', value: 'Honey' },
  { label: 'Suco', value: 'Juice' },
  { label: 'Adjunto', value: 'Adjunct' },
]

const useOptions = [
  { label: 'Mostura', value: 'Mash' },
  { label: 'Maceração', value: 'Steep' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Adição Tardia', value: 'LateAddition' },
]
</script>

<style scoped>
.efv-section-label {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--bp-text-secondary, #888);
  margin-bottom: 8px;
}

.efv-color-swatch {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(255,255,255,0.15);
  flex-shrink: 0;
}

.efv-info-box {
  background: rgba(255,255,255,0.04);
  border-left: 2px solid var(--bp-border, #333);
  border-radius: 0 4px 4px 0;
  padding: 8px 10px;
}

.efv-info-text {
  font-size: 12px;
  line-height: 1.55;
  color: var(--bp-text-secondary, #aaa);
}

.efv-details-btn {
  border: 1px dashed var(--bp-border, #333);
  border-radius: 6px;
  font-size: 12px;
}

.efv-details-panel {
  border: 1px solid var(--bp-border, #333);
  border-radius: 6px;
  padding: 12px;
  background: rgba(255,255,255,0.025);
}

.efv-spec-chip {
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  padding: 8px 10px;
  text-align: center;
}

.efv-spec-label {
  font-size: 10px;
  color: var(--bp-text-secondary, #888);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 3px;
}

.efv-spec-val {
  font-size: 16px;
  font-weight: 700;
  color: var(--bp-text-primary, #eee);
  line-height: 1.1;
}

.efv-spec-unit {
  font-size: 10px;
  font-weight: 400;
  color: var(--bp-text-secondary, #888);
  margin-left: 2px;
}

.efv-slide-enter-active,
.efv-slide-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
  max-height: 500px;
}

.efv-slide-enter-from,
.efv-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
