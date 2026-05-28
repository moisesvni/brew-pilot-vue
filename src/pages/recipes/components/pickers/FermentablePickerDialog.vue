<template>
  <brew-pilot-dialog v-model="open" title="Adicionar Fermentável" icon="mdi-barley" icon-color="primary" width="560px">
    <!-- ── Busca ──────────────────────────────────────────────────────────── -->
    <template v-if="step === 'search'">
      <q-card-section class="q-pb-xs">
        <brew-pilot-search-input v-model="query" autofocus
          placeholder="Buscar fermentável na base de dados..."
          :loading="loading" spinner-color="primary"
          @update:model-value="onQueryChange" />
      </q-card-section>

      <!-- ── Barra de filtros ──────────────────────────────────────────── -->
      <div class="row items-center no-wrap q-px-md q-pb-sm" style="gap: 6px">
        <!-- Toggle: Meu estoque -->
        <q-chip clickable dense size="sm" icon="mdi-package-variant-closed"
          :color="onlyMyStock ? 'primary' : 'transparent'"
          :text-color="onlyMyStock ? 'white' : 'grey-5'"
          :class="['fpd-filter-chip', onlyMyStock ? 'fpd-filter-chip--active' : '']"
          @click="toggleMyStock">
          Meu estoque
        </q-chip>

        <!-- Botão: Fornecedores (q-menu popover) -->
        <q-btn dense no-caps size="sm" flat
          :class="['fpd-filter-btn', hasSupplierFilter ? 'fpd-filter-btn--active' : '']"
          :icon="hasSupplierFilter ? 'mdi-domain-plus' : 'mdi-domain'">
          <span class="q-ml-xs">Fornecedores</span>
          <span v-if="hasSupplierFilter" class="fpd-filter-count q-ml-xs">
            {{ availableSuppliers.length - disabledSuppliers.length }}/{{ availableSuppliers.length }}
          </span>
          <q-icon name="mdi-chevron-down" size="14px" class="q-ml-xs" />

          <q-menu anchor="bottom left" self="top left" class="fpd-supplier-menu"
            :offset="[0, 4]" @before-show="() => {}">
            <div style="min-width: 260px">
              <!-- header do menu -->
              <div class="row items-center q-px-md q-pt-sm q-pb-xs">
                <div>
                  <div class="text-body2 text-weight-medium" style="color: var(--bp-text-primary)">
                    Fornecedores
                  </div>
                  <div class="text-caption text-grey-6" style="font-size: 11px">
                    Filtre quais serão exibidos na busca
                  </div>
                </div>
                <q-space />
                <q-btn flat no-caps dense size="xs" label="Todos" color="primary"
                  @click.stop="toggleAllSuppliers(true)" />
                <q-btn flat no-caps dense size="xs" label="Nenhum" color="grey-5"
                  class="q-ml-xs" @click.stop="toggleAllSuppliers(false)" />
              </div>
              <q-separator />
              <!-- lista de fornecedores -->
              <div v-if="loadingSuppliers" class="text-center q-py-md">
                <q-spinner size="24px" color="primary" />
              </div>
              <q-list v-else dense style="max-height: 260px; overflow-y: auto">
                <q-item v-for="s in availableSuppliers" :key="s" dense clickable
                  style="min-height: 34px" @click.stop="toggleSupplier(s)">
                  <q-item-section side style="padding-right: 10px; min-width: 0">
                    <q-checkbox :model-value="isSupplierEnabled(s)" dense size="sm" color="primary"
                      @update:model-value="toggleSupplier(s)" @click.stop />
                  </q-item-section>
                  <q-item-section style="font-size: 13px; color: var(--bp-text-primary)">
                    {{ s }}
                  </q-item-section>
                </q-item>
                <q-item v-if="!availableSuppliers.length" dense class="text-center q-py-sm">
                  <q-item-section class="text-caption text-grey-6">Nenhum fornecedor encontrado</q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-menu>
        </q-btn>

        <!-- Limpar filtros -->
        <q-btn v-if="hasAnyFilter" flat dense no-caps size="xs" round
          icon="mdi-close-circle" color="grey-6"
          @click="clearFilters">
          <q-tooltip>Limpar filtros</q-tooltip>
        </q-btn>

        <q-space />
        <div v-if="hasAnyFilter" class="text-caption text-primary" style="font-size: 10px; white-space: nowrap">
          Filtros ativos
        </div>
      </div>
      <div class="overflow-auto" style="min-height:120px;max-height:340px">
        <div v-if="!loading && !results.length && query.length > 1"
          class="text-center q-py-md text-grey-5">
          <q-icon name="search_off" size="36px" class="q-mb-xs" /><br>
          Nenhum resultado para "<strong>{{ query }}</strong>"
        </div>
        <div v-else-if="!query && !isShowingTopSearched" class="text-center q-py-md text-grey-6 text-caption">
          Digite para buscar na base de dados
        </div>
        <template v-else>
          <div v-if="isShowingTopSearched && !query"
            class="q-px-md q-pt-sm q-pb-xs text-caption text-grey-6 row items-center" style="gap:4px">
            <q-icon name="mdi-fire" color="orange-6" size="13px" />
            Mais pesquisados
          </div>
          <q-list separator>
            <q-item v-for="r in results" :key="r.id" clickable v-ripple class="q-py-sm"
              @click="selectResult(r)">
              <q-item-section>
                <q-item-label style="color: var(--bp-text-primary)" class="text-weight-medium">{{ r.name }}</q-item-label>
                <q-item-label caption class="text-grey-5">{{ resultCaption(r) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat dense size="sm" label="Usar" color="primary" icon="add" />
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </div>
      <q-card-section class="q-pt-xs q-pb-sm">
        <q-btn flat class="full-width" icon="mdi-plus-circle-outline"
          label="Criar novo (não está na base)" color="grey-4" size="sm"
          @click="openCreateNew" />
      </q-card-section>
    </template>

    <!-- ── Configurar ────────────────────────────────────────────────────── -->
    <template v-else-if="step === 'configure'">
      <q-card-section class="q-pb-sm">
        <!-- cabeçalho do item selecionado -->
        <div class="row items-start no-wrap q-mb-md" style="gap:10px">
          <q-btn flat round dense icon="arrow_back" size="sm" class="q-mt-xs" @click="step = 'search'" />
          <div class="col">
            <div class="text-body1 text-weight-bold" style="color: var(--bp-text-primary)">{{ selected!.name }}</div>
            <div class="text-caption text-grey-5">{{ resultCaption(selected!) }}</div>
            <div v-if="selected!.origin || selected!.category" class="row items-center q-mt-xs" style="gap:6px">
              <q-chip v-if="selected!.category" dense size="sm" color="primary" text-color="white"
                class="q-py-none" style="font-size:10px;height:18px">{{ selected!.category }}</q-chip>
              <span v-if="selected!.origin" class="text-caption text-grey-6">{{ selected!.origin }}</span>
            </div>
          </div>
          <!-- swatch de cor -->
          <div class="cfg-color-swatch q-mt-xs" :style="{ background: ebcToHex(cfg.colorEbc) }" />
        </div>

        <div class="row q-col-gutter-sm">
          <!-- Quantidade com toggle kg/g -->
          <div class="col-12 col-sm-5">
            <q-input v-model.number="cfgAmountDisplay" type="number" step="0.001"
              outlined dense :suffix="cfgAmountUnit"
              :label="cfgAmountUnit === 'kg' ? 'Quantidade (kg)' : 'Quantidade (g)'"
              @update:model-value="onCfgAmountChange">
              <template #append>
                <q-btn-toggle v-model="cfgAmountUnit" flat no-caps dense size="xs"
                  toggle-color="primary" color="grey-6"
                  :options="[{ label: 'kg', value: 'kg' }, { label: 'g', value: 'g' }]"
                  style="border: 1px solid var(--bp-border); border-radius: 4px; overflow: hidden" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-4">
            <q-select v-model="cfg.use" :options="useOpts" emit-value map-options
              label="Uso" outlined dense />
          </div>
          <div class="col-12 col-sm-3">
            <q-input v-model.number="cfg.colorEbc" type="number"
              label="Cor" suffix="EBC" outlined dense>
              <template #prepend>
                <div class="cfg-swatch-sm" :style="{ background: ebcToHex(cfg.colorEbc) }" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- descrição resumida do ingrediente -->
        <div v-if="selected!.description" class="cfg-desc-box q-mt-sm">
          <q-icon name="mdi-information-outline" size="12px" color="grey-6" class="q-mr-xs" />
          <span class="text-caption text-grey-5" style="font-size:11.5px; line-height:1.5">
            {{ selected!.description.slice(0, 200) }}{{ selected!.description.length > 200 ? '…' : '' }}
          </span>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps label="Cancelar" color="grey-5" @click="open = false" />
        <q-btn unelevated no-caps color="primary" icon="add" label="Adicionar à receita" @click="confirmAdd" />
      </q-card-actions>
    </template>

    <!-- ── Criar novo ────────────────────────────────────────────────────── -->
    <template v-else>
      <q-card-section class="q-pb-sm">
        <div class="row items-center q-mb-md">
          <q-btn flat round dense icon="arrow_back" size="sm" @click="step = 'search'" />
          <brew-pilot-label class="q-ml-sm">Novo Fermentável</brew-pilot-label>
        </div>
        <div class="row q-col-gutter-sm">
          <!-- Nome -->
          <div class="col-12">
            <q-input v-model="cfg.name" label="Nome" outlined dense autofocus
              placeholder="Nome do fermentável" />
          </div>
          <!-- Categoria + Tipo -->
          <div class="col-12 col-sm-6">
            <q-select v-model="cfg.category" :options="categoryOpts" emit-value map-options
              label="Categoria" outlined dense clearable />
          </div>
          <div class="col-12 col-sm-6">
            <q-select v-model="cfg.fermentableType" :options="typeOpts" emit-value map-options
              label="Tipo" outlined dense />
          </div>
          <!-- Fornecedor + Origem -->
          <div class="col-12 col-sm-6">
            <q-input v-model="cfg.supplier" label="Fornecedor" outlined dense
              placeholder="Ex: Agraria, Franco..." />
          </div>
          <div class="col-12 col-sm-6">
            <q-input v-model="cfg.origin" label="Origem (país)" outlined dense
              placeholder="Ex: Brasil, Alemanha..." />
          </div>
          <!-- Quantidade + Uso -->
          <div class="col-12 col-sm-5">
            <q-input v-model.number="cfgAmountDisplay" type="number" step="0.001"
              outlined dense :suffix="cfgAmountUnit"
              :label="cfgAmountUnit === 'kg' ? 'Quantidade (kg)' : 'Quantidade (g)'"
              @update:model-value="onCfgAmountChange">
              <template #append>
                <q-btn-toggle v-model="cfgAmountUnit" flat no-caps dense size="xs"
                  toggle-color="primary" color="grey-6"
                  :options="[{ label: 'kg', value: 'kg' }, { label: 'g', value: 'g' }]"
                  style="border: 1px solid var(--bp-border); border-radius: 4px; overflow: hidden" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-4">
            <q-select v-model="cfg.use" :options="useOpts" emit-value map-options
              label="Uso" outlined dense />
          </div>
          <!-- Cor -->
          <div class="col-12 col-sm-3">
            <q-input v-model.number="cfg.colorEbc" type="number" label="Cor"
              suffix="EBC" outlined dense>
              <template #prepend>
                <div class="cfg-swatch-sm" :style="{ background: ebcToHex(cfg.colorEbc) }" />
              </template>
            </q-input>
          </div>
          <!-- PPG + Rendimento + Poder Diastático -->
          <div class="col-6 col-sm-4">
            <q-input v-model.number="cfg.potential" type="number" label="Potencial (PPG)"
              outlined dense />
          </div>
          <div class="col-6 col-sm-4">
            <q-input v-model.number="cfg.yieldPercentage" type="number" label="Rendimento"
              suffix="%" outlined dense />
          </div>
          <div class="col-12 col-sm-4">
            <q-input v-model.number="cfg.diastaticPower" type="number" label="Poder Diastático"
              suffix="°L" outlined dense placeholder="—" clearable />
          </div>
          <!-- Anotações -->
          <div class="col-12">
            <q-input v-model="cfg.notes" label="Anotações" outlined dense autogrow type="textarea"
              placeholder="Anotações opcionais..." input-style="min-height: 42px; font-size: 13px" />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps label="Cancelar" color="grey-5" @click="open = false" />
        <q-btn unelevated no-caps color="primary" icon="add" label="Criar e adicionar"
          :disable="!cfg.name.trim()" @click="confirmAdd" />
      </q-card-actions>
    </template>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RecipeFermentable } from '@/types/recipe'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import BrewPilotSearchInput from '@/components/shared/BrewPilotSearchInput.vue'
import { useIngredientPicker } from '@/composables/useIngredientPicker'
import { ebcToHex } from '@/utils/brewColors'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  add: [item: RecipeFermentable]
}>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const { step, query, results, loading, selected, cfg, isShowingTopSearched,
  availableSuppliers, loadingSuppliers, disabledSuppliers, onlyMyStock,
  hasSupplierFilter, hasAnyFilter, isSupplierEnabled,
  toggleSupplier, toggleAllSuppliers, toggleMyStock, clearFilters,
  reset, onQueryChange, selectResult, openCreateNew, resultCaption } =
  useIngredientPicker('Fermentable')

watch(() => props.modelValue, v => { if (v) reset() })

// ── Quantidade com toggle kg/g ────────────────────────────────────────────────
const cfgAmountUnit = ref<'kg' | 'g'>('kg')

const cfgAmountDisplay = computed({
  get: () => cfgAmountUnit.value === 'g'
    ? parseFloat((cfg.value.amount * 1000).toFixed(1))
    : parseFloat(cfg.value.amount.toFixed(4)),
  set: () => { /* via onCfgAmountChange */ }
})

function onCfgAmountChange(val: string | number | null) {
  const n = Number(val ?? 0)
  cfg.value.amount = cfgAmountUnit.value === 'g' ? n / 1000 : n
}

// ── Confirmar adição ─────────────────────────────────────────────────────────
function confirmAdd() {
  const item: RecipeFermentable = {
    id: crypto.randomUUID(),
    name: cfg.value.name,
    type: cfg.value.fermentableType as RecipeFermentable['type'],
    use: cfg.value.use as RecipeFermentable['use'],
    amount: cfg.value.amount,
    colorEbc: cfg.value.colorEbc,
    potential: cfg.value.potential,
    yieldPercentage: cfg.value.yieldPercentage,
    sortOrder: 0,
    ingredientId: selected.value?.id,
    category: cfg.value.category || undefined,
    origin: cfg.value.origin || undefined,
    supplier: cfg.value.supplier || selected.value?.producer || undefined,
    diastaticPower: cfg.value.diastaticPower ?? undefined,
    notes: cfg.value.notes || undefined,
    description: cfg.value.description || undefined,
    usedIn: cfg.value.usedIn || undefined,
    substitutes: cfg.value.substitutes || undefined,
    moisture: cfg.value.moisture ?? undefined,
    protein: cfg.value.protein ?? undefined,
    coarseFineGrind: cfg.value.coarseFineGrind ?? undefined,
    fineGroundExtract: cfg.value.fineGroundExtract ?? undefined,
    acid: cfg.value.acid ?? undefined,
    friability: cfg.value.friability ?? undefined,
    freeAminoNitrogen: cfg.value.freeAminoNitrogen ?? undefined,
    maxInBatch: cfg.value.maxInBatch ?? undefined,
  }
  emit('add', item)
  open.value = false
}

const useOpts = [
  { label: 'Mostura', value: 'Mash' },
  { label: 'Maceração', value: 'Steep' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Adição tardia', value: 'LateAddition' },
]

const typeOpts = [
  { label: 'Grão', value: 'Grain' },
  { label: 'Extrato Seco', value: 'DryExtract' },
  { label: 'Extrato Líquido', value: 'LiquidExtract' },
  { label: 'Açúcar', value: 'Sugar' },
  { label: 'Mel', value: 'Honey' },
  { label: 'Adjunto', value: 'Adjunct' },
]

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
</script>

<style scoped>
.cfg-color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.15);
  flex-shrink: 0;
}

.cfg-swatch-sm {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid rgba(255,255,255,0.15);
  flex-shrink: 0;
}

.cfg-desc-box {
  background: rgba(255,255,255,0.04);
  border-left: 2px solid var(--bp-border, #333);
  border-radius: 0 4px 4px 0;
  padding: 8px 10px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

/* ── Filtros ────────────────────────────────────────────────────────────── */
.fpd-filter-chip {
  border: 1px solid var(--bp-border, #444) !important;
  font-size: 11.5px;
  height: 26px;
  transition: all 0.15s;
}

.fpd-filter-chip--active {
  border-color: var(--q-primary) !important;
}

.fpd-filter-btn {
  border: 1px solid var(--bp-border, #444);
  border-radius: 20px;
  padding: 0 10px;
  height: 26px;
  font-size: 11.5px;
  color: var(--bp-text-secondary, #888);
  transition: all 0.15s;
}

.fpd-filter-btn--active {
  border-color: var(--q-primary) !important;
  color: var(--q-primary) !important;
}

.fpd-filter-count {
  background: rgba(193,113,14,0.2);
  color: var(--q-primary);
  border-radius: 10px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 600;
}
</style>
