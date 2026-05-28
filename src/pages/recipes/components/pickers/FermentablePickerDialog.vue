<template>
  <brew-pilot-dialog v-model="open" icon="mdi-barley" icon-color="primary" width="560px">
    <template #title>
      <div class="row items-center no-wrap" style="gap: 4px">
        <q-btn v-if="step !== 'search'" flat round dense icon="arrow_back" size="xs" color="grey-5"
          style="margin-left: -4px" @click="goBack" />
        <span>{{ dialogTitle }}</span>
      </div>
    </template>
    <div class="fpd-steps-outer">
      <transition :name="'fpd-' + transitionDir" mode="out-in">
        <!-- ── Busca ────────────────────────────────────────────────────── -->
        <fermentable-search-step
          v-if="step === 'search'"
          key="search"
          :query="query"
          :results="results"
          :loading="loading"
          :is-showing-top-searched="isShowingTopSearched"
          :available-suppliers="availableSuppliers"
          :loading-suppliers="loadingSuppliers"
          :disabled-suppliers="disabledSuppliers"
          :only-my-stock="onlyMyStock"
          :has-supplier-filter="hasSupplierFilter"
          :has-any-filter="hasAnyFilter"
          @update:query="val => { query = val; onQueryChange(val) }"
          @select="selectResult"
          @create-new="openCreateNew"
          @toggle-supplier="toggleSupplier"
          @toggle-all-suppliers="toggleAllSuppliers"
          @toggle-my-stock="toggleMyStock"
          @clear-filters="clearFilters"
        />

        <!-- ── Configurar ────────────────────────────────────────────── -->
        <fermentable-configure-step
          v-else-if="step === 'configure'"
          key="configure"
          :selected="selected!"
          :cfg="cfg"
          @add="onAddFromConfigure"
          @cancel="open = false"
        />

        <!-- ── Criar novo ────────────────────────────────────────────── -->
        <div v-else key="create">
          <q-card-section class="q-pb-sm">
            <fermentable-form-content ref="createFormRef" />
          </q-card-section>
          <q-separator />
          <q-card-actions class="q-px-md q-py-sm row items-center">
            <q-space />
            <brew-pilot-button variant="outline" no-caps label="Cancelar" @click="step = 'search'" />
            <brew-pilot-button variant="filled" no-caps color="primary" icon="add" label="Criar e adicionar"
              class="q-ml-sm" :disable="!createCanSubmit" @click="confirmCreate" />
          </q-card-actions>
        </div>

      </transition>
    </div>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RecipeFermentable } from '@/types/recipe'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import BrewPilotButton from '@/components/shared/BrewPilotButton.vue'
import FermentableFormContent from '@/pages/recipes/components/overview/dialogs/FermentableFormContent.vue'
import FermentableSearchStep from './FermentableSearchStep.vue'
import FermentableConfigureStep from './FermentableConfigureStep.vue'
import { useIngredientPicker } from '@/composables/useIngredientPicker'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  add: [item: RecipeFermentable]
}>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const { step, query, results, loading, selected, cfg, isShowingTopSearched,
  availableSuppliers, loadingSuppliers, disabledSuppliers, onlyMyStock,
  hasSupplierFilter, hasAnyFilter,
  toggleSupplier, toggleAllSuppliers, toggleMyStock, clearFilters,
  reset, onQueryChange, selectResult, openCreateNew } =
  useIngredientPicker('Fermentable')

watch(() => props.modelValue, v => { if (v) reset() })

const stepOrder = ['search', 'configure', 'create']
const transitionDir = ref('forward')
watch(step, (next, prev) => {
  transitionDir.value = stepOrder.indexOf(next) >= stepOrder.indexOf(prev) ? 'forward' : 'backward'
})

const dialogTitle = computed(() => {
  if (step.value === 'create') return 'Novo Fermentável'
  if (step.value === 'configure') return selected.value?.name ?? 'Configurar Fermentável'
  return 'Adicionar Fermentável'
})

function goBack() {
  step.value = 'search'
}

const createFormRef = ref<InstanceType<typeof FermentableFormContent> | null>(null)
const createCanSubmit = computed(() => createFormRef.value?.isValid ?? false)

function confirmCreate() {
  const item = createFormRef.value?.editItem
  if (!item?.name?.trim()) return
  emit('add', { ...item, id: crypto.randomUUID(), sortOrder: 0 })
  open.value = false
}

function onAddFromConfigure(item: RecipeFermentable) {
  emit('add', item)
  open.value = false
}
</script>

<style scoped>
/* ── Transição entre steps ─────────────────────────────────────────────── */
.fpd-steps-outer {
  overflow: hidden;
}

.fpd-forward-enter-active,
.fpd-forward-leave-active,
.fpd-backward-enter-active,
.fpd-backward-leave-active {
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.18s ease;
}

.fpd-forward-enter-from {
  transform: translateX(32px);
  opacity: 0;
}

.fpd-forward-leave-to {
  transform: translateX(-32px);
  opacity: 0;
}

.fpd-backward-enter-from {
  transform: translateX(-32px);
  opacity: 0;
}

.fpd-backward-leave-to {
  transform: translateX(32px);
  opacity: 0;
}
</style>
