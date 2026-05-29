<template>
  <div v-if="editItem">
    <!-- Identificação -->
    <brew-pilot-form-section title="Identificação">
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-7">
          <brew-pilot-input v-model="editItem.name" label="Nome" />
        </div>
        <div class="col-12 col-sm-5">
          <brew-pilot-select v-model="editItem.category" :options="categoryOpts" emit-value map-options
            label="Categoria" clearable />
        </div>
        <div class="col-12 col-sm-6">
          <brew-pilot-input v-model="editItem.supplier" label="Fornecedor" />
        </div>
        <div class="col-12 col-sm-6">
          <brew-pilot-input v-model="editItem.origin" label="Origem (país)" />
        </div>
      </div>
    </brew-pilot-form-section>

    <!-- ── Uso na receita ─────────────────────────────────────────────── -->
    <!-- Uso na Receita -->
    <brew-pilot-form-section title="Uso na Receita">
      <div class="row q-col-gutter-sm">
        <div class="col-6 col-sm-3">
          <brew-pilot-input v-model.number="amountKg" type="number" step="0.001" min="0"
            label="Quantidade" suffix="kg"
            @update:model-value="(v: string | number | null) => syncAmount(Number(v), 'kg')" />
        </div>
        <div class="col-6 col-sm-3">
          <brew-pilot-input v-model.number="amountG" type="number" step="1" min="0"
            label="Quantidade" suffix="g"
            @update:model-value="(v: string | number | null) => syncAmount(Number(v), 'g')" />
        </div>
        <div class="col-12 col-sm-3">
          <brew-pilot-select v-model="editItem.use" :options="useOptions" emit-value map-options
            label="Uso" />
        </div>
        <div class="col-12 col-sm-3">
          <brew-pilot-input v-model.number="editItem.colorEbc" type="number"
            label="Cor" suffix="EBC">
            <template #prepend>
              <div class="efv-color-swatch" :style="{ background: swatchColor }" />
            </template>
          </brew-pilot-input>
        </div>
      </div>
    </brew-pilot-form-section>

    <!-- ── Características ────────────────────────────────────────────── -->
    <!-- Características -->
    <brew-pilot-form-section title="Características">
      <div class="row q-col-gutter-sm q-mb-sm">
        <div class="col-12 col-sm-4">
          <brew-pilot-select v-model="editItem.type" :options="typeOptions" emit-value map-options
            label="Tipo" />
        </div>
        <div class="col-6 col-sm-4">
          <brew-pilot-input v-model.number="editItem.potential" type="number" step="0.001"
            label="Potencial (PPG)" />
        </div>
        <div class="col-6 col-sm-4">
          <brew-pilot-input v-model.number="editItem.yieldPercentage" type="number" step="0.1"
            label="Rendimento" suffix="%" />
        </div>
        <div class="col-12 col-sm-4">
          <brew-pilot-input v-model.number="editItem.diastaticPower" type="number"
            label="Poder Diastático" suffix="°L" placeholder="—" clearable />
        </div>
      </div>
      <div class="row q-gutter-md">
        <q-checkbox v-model="editItem.excludeFromTotal" dense size="sm"
          label="Excluir do total" color="primary">
          <q-tooltip max-width="220px" anchor="top middle" self="bottom middle">
            Excluir esse fermentável da porcentagem e total de fermentáveis
          </q-tooltip>
        </q-checkbox>
        <q-checkbox v-model="editItem.nonFermentable" dense size="sm"
          label="Não fermentável" color="primary">
          <q-tooltip max-width="260px" anchor="top middle" self="bottom middle">
            Esse fermentável é não-fermentável e todos os açúcares serão contabilizados
            na Densidade Final. Certifique-se de que a Densidade Final não esteja definida
            como Fixa, pois ela deve ser definida como Estimada para que funcione corretamente.
          </q-tooltip>
        </q-checkbox>
      </div>
    </brew-pilot-form-section>

    <!-- Anotações -->
    <brew-pilot-form-section title="Anotações">
      <brew-pilot-input v-model="editItem.notes" autogrow type="textarea"
        placeholder="Anotações adicionais sobre este fermentável..."
        input-style="min-height: 52px; font-size: 13px" />
    </brew-pilot-form-section>

    <!-- Informações do Fabricante -->
    <div class="efv-fabricante-card q-mb-sm">
      <div class="row items-center no-wrap efv-fabricante-header">
        <q-icon name="mdi-information-outline" size="13px" color="grey-6" class="q-mr-xs flex-shrink-0" />
        <span class="efv-fabricante-title">Informações do Fabricante</span>
        <q-space />
        <q-btn flat round dense size="sm"
          :icon="showInfo ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          :color="showInfo ? 'primary' : 'grey-6'"
          @click="showInfo = !showInfo">
          <q-tooltip>{{ showInfo ? 'Ocultar' : 'Mostrar mais informações' }}</q-tooltip>
        </q-btn>
      </div>

    <!-- Descrição: sempre visível -->
    <template v-if="editItem.ingredientId">
      <div v-if="editItem.description" class="efv-info-box q-mb-xs">
        <div class="text-caption text-grey-5 q-mb-xs">Descrição</div>
        <div class="efv-info-text">{{ editItem.description }}</div>
      </div>
    </template>
    <template v-else>
      <brew-pilot-input v-model="editItem.description" autogrow type="textarea"
        label="Descrição" placeholder="Descrição do fermentável e suas características..."
        class="q-mb-xs" input-style="min-height: 52px; font-size: 13px" />
    </template>

    <!-- Usado em e Substitutos: controlados pelo toggle -->
    <transition name="efv-slide">
      <div v-if="showInfo">
        <template v-if="editItem.ingredientId">
          <div v-if="editItem.usedIn" class="efv-info-box q-mb-xs">
            <div class="text-caption text-grey-5 q-mb-xs">Usado em</div>
            <div class="efv-info-text">{{ editItem.usedIn }}</div>
          </div>
          <div v-if="editItem.substitutes" class="efv-info-box q-mb-sm">
            <div class="text-caption text-grey-5 q-mb-xs">Substitutos</div>
            <div class="efv-info-text">{{ editItem.substitutes }}</div>
          </div>
        </template>
        <template v-else>
          <div class="row q-col-gutter-sm q-mb-xs">
            <div class="col-12">
              <brew-pilot-input v-model="editItem.usedIn" autogrow type="textarea"
                label="Usado em" placeholder="Estilos de cerveja em que é utilizado..."
                input-style="min-height: 42px; font-size: 13px" />
            </div>
            <div class="col-12">
              <brew-pilot-input v-model="editItem.substitutes"
                label="Substitutos" placeholder="Ex: Maris Otter, Pale Ale Malt..." />
            </div>
          </div>
        </template>
      </div>
    </transition>

    </div><!-- /efv-fabricante-card -->

    <!-- Botão: Exibir / Ocultar dados técnicos -->
    <div class="q-mt-sm">
      <brew-pilot-button variant="outline" no-caps class="full-width efv-details-btn"
        :icon="showDetails ? 'mdi-chevron-up' : 'mdi-flask-outline'"
        :label="showDetails ? 'Ocultar dados técnicos' : 'Exibir dados técnicos'"
        @click="showDetails = !showDetails" />
    </div>

    <!-- ── Dados técnicos (expandível) ───────────────────────────────── -->
    <transition name="efv-slide">
      <div v-if="showDetails" class="efv-details-panel q-mt-sm">
        <div class="efv-details-title row items-center q-mb-sm" style="gap:4px">
          <q-icon name="mdi-flask-outline" size="13px" color="grey-6" />
          Dados Técnicos
        </div>

        <template v-if="!editItem.ingredientId">
          <div class="row q-col-gutter-sm">
            <div class="col-6 col-sm-3">
              <brew-pilot-input v-model.number="editItem.moisture" type="number"
                clearable label="Umidade" suffix="%" />
            </div>
            <div class="col-6 col-sm-3">
              <brew-pilot-input v-model.number="editItem.protein" type="number"
                clearable label="Proteína" suffix="%" />
            </div>
            <div class="col-6 col-sm-3">
              <brew-pilot-input v-model.number="editItem.coarseFineGrind" type="number"
                clearable label="Dif. Fina/Grossa" suffix="%" />
            </div>
            <div class="col-6 col-sm-3">
              <brew-pilot-input v-model.number="editItem.fineGroundExtract" type="number"
                clearable label="Extrato (fina)" suffix="%" />
            </div>
            <div class="col-6 col-sm-3">
              <brew-pilot-input v-model.number="editItem.acid" type="number"
                clearable label="Ácido" suffix="%" />
            </div>
            <div class="col-6 col-sm-3">
              <brew-pilot-input v-model.number="editItem.friability" type="number"
                clearable label="Friabilidade" suffix="%" />
            </div>
            <div class="col-6 col-sm-3">
              <brew-pilot-input v-model.number="editItem.freeAminoNitrogen" type="number"
                clearable label="FAN" suffix="mg/L" />
            </div>
            <div class="col-6 col-sm-3">
              <brew-pilot-input v-model.number="editItem.maxInBatch" type="number"
                clearable label="Máx. na receita" suffix="%" />
            </div>
          </div>
        </template>

        <template v-else>
          <div v-if="!hasTechnicalData" class="text-caption text-grey-6 text-center q-py-sm">
            Nenhum dado técnico disponível para este ingrediente
          </div>
          <div v-else class="row q-col-gutter-sm">
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
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RecipeFermentable } from '@/types/recipe'
import { ebcToHex } from '@/core/utils/brewColors'

const props = defineProps<{
  item?: RecipeFermentable | null
}>()

const editItem = ref<RecipeFermentable | null>(null)
const showDetails = ref(false)
const showInfo = ref(false)
const amountKg = ref(0)
const amountG  = ref(0)

function syncAmount(val: number, from: 'kg' | 'g') {
  if (!editItem.value) return
  const n = isNaN(val) ? 0 : val
  if (from === 'kg') {
    editItem.value.amount = n
    amountKg.value = n
    amountG.value = parseFloat((n * 1000).toFixed(2))
  } else {
    editItem.value.amount = n / 1000
    amountG.value = n
    amountKg.value = parseFloat((n / 1000).toFixed(4))
  }
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

const isValid = computed(() => !!(editItem.value?.name?.trim()))

watch(() => props.item, (item) => {
  if (item) {
    editItem.value = { ...item }
    amountKg.value = parseFloat(item.amount.toFixed(4))
    amountG.value = parseFloat((item.amount * 1000).toFixed(2))
    showInfo.value = !!(item.usedIn || item.substitutes)
  } else {
    editItem.value = {
      id: '',
      name: '',
      type: 'Grain',
      use: 'Mash',
      amount: 1,
      colorEbc: 5,
      potential: 37,
      yieldPercentage: 78,
      sortOrder: 0,
    } as RecipeFermentable
    amountKg.value = 1
    amountG.value = 1000
    showInfo.value = false
  }
  showDetails.value = false
}, { immediate: true })

defineExpose({ editItem, isValid })

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
.efv-fabricante-card {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 10px 12px 12px;
}

.efv-fabricante-header {
  margin-bottom: 10px;
}

.efv-details-title {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--bp-text-muted);
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
  border-style: dashed !important;
  font-size: 12px;
}

.efv-details-panel {
  border: 1px solid var(--bp-border);
  border-radius: 6px;
  padding: 12px;
  background: var(--bp-surface-alt);
}

.efv-spec-chip {
  background: var(--bp-surface);
  border: 1px solid var(--bp-border);
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
  max-height: 600px;
}

.efv-slide-enter-from,
.efv-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
