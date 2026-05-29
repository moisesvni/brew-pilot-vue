<template>
  <div>
    <q-card-section class="q-pb-xs">
      <brew-pilot-search-input
        :model-value="query"
        autofocus
        placeholder="Buscar fermentável na base de dados..."
        :loading="loading"
        spinner-color="primary"
        @update:model-value="emit('update:query', $event as string)"
      />
    </q-card-section>

    <!-- ── Barra de filtros ──────────────────────────────────────────── -->
    <div class="row items-center no-wrap q-px-md q-pb-sm" style="gap: 6px">
      <q-chip clickable dense size="sm" icon="mdi-package-variant-closed"
        :color="onlyMyStock ? 'primary' : 'transparent'"
        :text-color="onlyMyStock ? 'white' : 'grey-5'"
        :class="['fpd-filter-chip', onlyMyStock ? 'fpd-filter-chip--active' : '']"
        @click="emit('toggle-my-stock')">
        Meu estoque
      </q-chip>

      <q-btn dense no-caps size="sm" flat
        :class="['fpd-filter-btn', hasSupplierFilter ? 'fpd-filter-btn--active' : '']"
        :icon="hasSupplierFilter ? 'mdi-domain-plus' : 'mdi-domain'">
        <span class="q-ml-xs">Fornecedores</span>
        <span v-if="hasSupplierFilter" class="fpd-filter-count q-ml-xs">
          {{ availableSuppliers.length - disabledSuppliers.length }}/{{ availableSuppliers.length }}
        </span>
        <q-icon name="mdi-chevron-down" size="14px" class="q-ml-xs" />
        <q-menu anchor="bottom left" self="top left" class="fpd-supplier-menu" :offset="[0, 4]">
          <div style="min-width: 260px">
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
                @click.stop="emit('toggle-all-suppliers', true)" />
              <q-btn flat no-caps dense size="xs" label="Nenhum" color="grey-5" class="q-ml-xs"
                @click.stop="emit('toggle-all-suppliers', false)" />
            </div>
            <q-separator />
            <div v-if="loadingSuppliers" class="text-center q-py-md">
              <q-spinner size="24px" color="primary" />
            </div>
            <q-list v-else dense style="max-height: 260px; overflow-y: auto">
              <q-item v-for="s in availableSuppliers" :key="s" dense clickable style="min-height: 34px"
                @click.stop="emit('toggle-supplier', s)">
                <q-item-section side style="padding-right: 10px; min-width: 0">
                  <q-checkbox :model-value="isSupplierEnabled(s)" dense size="sm" color="primary"
                    @update:model-value="emit('toggle-supplier', s)" @click.stop />
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

      <q-btn v-if="hasAnyFilter" flat dense no-caps size="xs" round icon="mdi-close-circle" color="grey-6"
        @click="emit('clear-filters')">
        <q-tooltip>Limpar filtros</q-tooltip>
      </q-btn>
      <q-space />
      <div v-if="hasAnyFilter" class="text-caption text-primary" style="font-size: 10px; white-space: nowrap">
        Filtros ativos
      </div>
    </div>

    <!-- ── Lista de resultados ──────────────────────────────────────── -->
    <div class="overflow-auto" style="min-height:120px;max-height:340px">
      <div v-if="!loading && !results.length && query.length > 1"
        class="text-center q-py-md text-grey-5">
        <q-icon name="search_off" size="36px" class="q-mb-xs" /><br>
        Nenhum resultado para "<strong>{{ query }}</strong>"
      </div>
      <div v-else-if="!query && !isShowingTopSearched"
        class="text-center q-py-md text-grey-6 text-caption">
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
            @click="emit('select', r)">
            <q-item-section>
              <q-item-label style="color: var(--bp-text-primary)" class="text-weight-medium">
                {{ r.name }}
              </q-item-label>
              <q-item-label caption class="text-grey-5">{{ resultCaption(r) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense size="sm" label="Usar" color="primary" icon="add" />
            </q-item-section>
          </q-item>
        </q-list>
      </template>
    </div>

    <!-- ── Criar novo ───────────────────────────────────────────────── -->
    <div class="q-px-md q-pb-md q-pt-xs">
      <q-separator class="q-mb-sm" />
      <brew-pilot-button
        variant="outline"
        no-caps
        class="full-width"
        icon="mdi-plus-circle-outline"
        label="Criar novo (não está na base)"
        @click="emit('create-new')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IngredientResult } from '@/services/ingredients.service'

const props = defineProps<{
  query: string
  results: IngredientResult[]
  loading: boolean
  isShowingTopSearched: boolean
  availableSuppliers: string[]
  loadingSuppliers: boolean
  disabledSuppliers: string[]
  onlyMyStock: boolean
  hasSupplierFilter: boolean
  hasAnyFilter: boolean
}>()

const emit = defineEmits<{
  'update:query': [val: string]
  'select': [result: IngredientResult]
  'create-new': []
  'toggle-supplier': [supplier: string]
  'toggle-all-suppliers': [enable: boolean]
  'toggle-my-stock': []
  'clear-filters': []
}>()

function isSupplierEnabled(s: string): boolean {
  return !props.disabledSuppliers.includes(s)
}

function resultCaption(r: IngredientResult): string {
  const parts: string[] = []
  if (r.producer) parts.push(r.producer)
  if (r.fermentableType) parts.push(r.fermentableType)
  if (r.colorEbc !== undefined) parts.push(`${r.colorEbc} EBC`)
  if (r.potential !== undefined) parts.push(`PPG ${r.potential}`)
  if (r.alphaAcid !== undefined) parts.push(`AA ${r.alphaAcid}%`)
  if (r.laboratory) parts.push(r.laboratory)
  if (r.attenuation !== undefined) parts.push(`Aten. ${r.attenuation}%`)
  return parts.join(' · ')
}
</script>

<style scoped>
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
  background: rgba(193, 113, 14, 0.2);
  color: var(--q-primary);
  border-radius: 10px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 600;
}
</style>
