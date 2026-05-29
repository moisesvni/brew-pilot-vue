<template>
  <div>
    <q-card-section class="q-pb-sm">
      <!-- ── Contexto do item selecionado ─────────────────────────── -->
      <div class="row items-center no-wrap q-mb-md" style="gap:8px">
        <div class="col">
          <div class="text-caption text-grey-5">{{ resultCaption(selected) }}</div>
          <div v-if="selected.origin || selected.category" class="row items-center q-mt-xs" style="gap:6px">
            <q-chip v-if="selected.category" dense size="sm" color="primary" text-color="white"
              class="q-py-none" style="font-size:10px;height:18px">
              {{ selected.category }}
            </q-chip>
            <span v-if="selected.origin" class="text-caption text-grey-6">{{ selected.origin }}</span>
          </div>
        </div>
        <div class="cfg-color-swatch" :style="{ background: ebcToHex(cfg.colorEbc) }" />
      </div>

      <!-- ── Campos ───────────────────────────────────────────────── -->
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-5">
          <brew-pilot-input v-model.number="cfgAmountDisplay" type="number" step="0.001"
            :suffix="cfgAmountUnit" :label="cfgAmountUnit === 'kg' ? 'Quantidade (kg)' : 'Quantidade (g)'"
            @update:model-value="onCfgAmountChange">
            <template #append>
              <q-btn-toggle v-model="cfgAmountUnit" flat no-caps dense size="xs" toggle-color="primary"
                color="grey-6" :options="[{ label: 'kg', value: 'kg' }, { label: 'g', value: 'g' }]"
                style="border: 1px solid var(--bp-border); border-radius: 4px; overflow: hidden" />
            </template>
          </brew-pilot-input>
        </div>
        <div class="col-12 col-sm-4">
          <brew-pilot-select v-model="cfg.use" :options="useOpts" emit-value map-options label="Uso" />
        </div>
        <div class="col-12 col-sm-3">
          <brew-pilot-input v-model.number="cfg.colorEbc" type="number" label="Cor" suffix="EBC">
            <template #prepend>
              <div class="cfg-swatch-sm" :style="{ background: ebcToHex(cfg.colorEbc) }" />
            </template>
          </brew-pilot-input>
        </div>
      </div>

      <!-- ── Descrição ─────────────────────────────────────────────── -->
      <div v-if="selected.description" class="cfg-desc-box q-mt-sm">
        <q-icon name="mdi-information-outline" size="12px" color="grey-6" class="q-mr-xs" />
        <span class="text-caption text-grey-5" style="font-size:11.5px; line-height:1.5">
          {{ selected.description.slice(0, 200) }}{{ selected.description.length > 200 ? '…' : '' }}
        </span>
      </div>
    </q-card-section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IngredientResult } from '@/services/ingredients.service'
import type { PickerCfg } from '@/composables/useIngredientPicker'
import type { RecipeFermentable } from '@/types/recipe'
import { ebcToHex } from '@/core/utils/brewColors'

const props = defineProps<{
  selected: IngredientResult
  cfg: PickerCfg
}>()

const emit = defineEmits<{
  'add': [item: RecipeFermentable]
  'cancel': []
  'back': []
}>()

const cfgAmountUnit = ref<'kg' | 'g'>('kg')

const cfgAmountDisplay = computed({
  get: () => cfgAmountUnit.value === 'g'
    ? parseFloat((props.cfg.amount * 1000).toFixed(1))
    : parseFloat(props.cfg.amount.toFixed(4)),
  set: () => { /* via onCfgAmountChange */ }
})

function onCfgAmountChange(val: string | number | null) {
  const n = Number(val ?? 0)
  props.cfg.amount = cfgAmountUnit.value === 'g' ? n / 1000 : n
}

const useOpts = [
  { label: 'Mostura', value: 'Mash' },
  { label: 'Maceração', value: 'Steep' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Adição tardia', value: 'LateAddition' },
]

function resultCaption(r: IngredientResult): string {
  const parts: string[] = []
  if (r.producer) parts.push(r.producer)
  if (r.fermentableType) parts.push(r.fermentableType)
  if (r.colorEbc !== undefined) parts.push(`${r.colorEbc} EBC`)
  if (r.potential !== undefined) parts.push(`PPG ${r.potential}`)
  return parts.join(' · ')
}

function confirmAdd() {
  const item: RecipeFermentable = {
    id: crypto.randomUUID(),
    name: props.cfg.name,
    type: props.cfg.fermentableType as RecipeFermentable['type'],
    use: props.cfg.use as RecipeFermentable['use'],
    amount: props.cfg.amount,
    colorEbc: props.cfg.colorEbc,
    potential: props.cfg.potential,
    yieldPercentage: props.cfg.yieldPercentage,
    sortOrder: 0,
    ingredientId: props.selected.id,
    category: props.cfg.category || undefined,
    origin: props.cfg.origin || undefined,
    supplier: props.cfg.supplier || props.selected.producer || undefined,
    diastaticPower: props.cfg.diastaticPower ?? undefined,
    notes: props.cfg.notes || undefined,
    description: props.cfg.description || undefined,
    usedIn: props.cfg.usedIn || undefined,
    substitutes: props.cfg.substitutes || undefined,
    moisture: props.cfg.moisture ?? undefined,
    protein: props.cfg.protein ?? undefined,
    coarseFineGrind: props.cfg.coarseFineGrind ?? undefined,
    fineGroundExtract: props.cfg.fineGroundExtract ?? undefined,
    acid: props.cfg.acid ?? undefined,
    friability: props.cfg.friability ?? undefined,
    freeAminoNitrogen: props.cfg.freeAminoNitrogen ?? undefined,
    maxInBatch: props.cfg.maxInBatch ?? undefined,
  }
  emit('add', item)
}

defineExpose({ confirmAdd })
</script>

<style scoped>
.cfg-color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.cfg-swatch-sm {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.cfg-desc-box {
  background: rgba(255, 255, 255, 0.04);
  border-left: 2px solid var(--bp-border, #333);
  border-radius: 0 4px 4px 0;
  padding: 8px 10px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}
</style>
