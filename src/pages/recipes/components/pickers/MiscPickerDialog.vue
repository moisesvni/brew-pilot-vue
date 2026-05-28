<template>
  <brew-pilot-dialog v-model="open" title="Adicionar Diverso" icon="mdi-flask-outline" icon-color="blue-grey" width="560px">

    <!-- ── Busca ──────────────────────────────────────────────────────────── -->
    <template v-if="step === 'search'">
      <q-card-section class="q-pb-xs">
        <brew-pilot-search-input v-model="query" autofocus
          placeholder="Buscar ingrediente na base de dados..."
          :loading="loading" spinner-color="blue-grey"
          @update:model-value="onQueryChange" />
      </q-card-section>
      <div class="overflow-auto" style="min-height:120px;max-height:340px">
        <div v-if="!loading && !results.length && query.length > 1"
          class="text-center q-py-md text-grey-5">
          <q-icon name="search_off" size="36px" class="q-mb-xs" /><br>
          Nenhum resultado para "<strong>{{ query }}</strong>"
        </div>
        <div v-else-if="!query" class="text-center q-py-md text-grey-6 text-caption">
          Digite para buscar na base de dados
        </div>
        <q-list separator>
          <q-item v-for="r in results" :key="r.id" clickable v-ripple class="q-py-sm"
            @click="selectResult(r)">
            <q-item-section>
              <q-item-label style="color: var(--bp-text-primary)" class="text-weight-medium">{{ r.name }}</q-item-label>
              <q-item-label caption class="text-grey-5">{{ resultCaption(r) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense size="sm" label="Usar" color="blue-grey" icon="add" />
            </q-item-section>
          </q-item>
        </q-list>
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
        <div class="row items-center q-mb-md">
          <q-btn flat round dense icon="arrow_back" size="sm" @click="step = 'search'" />
          <div class="q-ml-sm">
            <div class="text-body1 text-weight-bold" style="color: var(--bp-text-primary)">{{ selected!.name }}</div>
            <div class="text-caption text-grey-5">{{ resultCaption(selected!) }}</div>
          </div>
        </div>
        <div class="row q-col-gutter-sm">
          <q-input v-model.number="cfg.amount" type="number" label="Quantidade"
            outlined dense  class="col-12 col-sm-3" />
          <q-select v-model="cfg.unit" :options="unitOpts" emit-value map-options
            label="Unidade" outlined dense  class="col-12 col-sm-3" />
          <q-select v-model="cfg.use" :options="useOpts" emit-value map-options
            label="Uso" outlined dense  class="col-12 col-sm-3" />
          <q-input v-if="cfg.use === 'Boil' || cfg.use === 'Mash'"
            v-model.number="cfg.time" type="number"
            label="Tempo" suffix="min" outlined dense  class="col-12 col-sm-3" />
        </div>
      </q-card-section>
      <q-separator  />
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps label="Cancelar" color="grey-5" @click="open = false" />
        <q-btn unelevated no-caps color="blue-grey" icon="add" label="Adicionar à receita" @click="confirmAdd" />
      </q-card-actions>
    </template>

    <!-- ── Criar novo ────────────────────────────────────────────────────── -->
    <template v-else>
      <q-card-section class="q-pb-sm">
        <div class="row items-center q-mb-md">
          <q-btn flat round dense icon="arrow_back" size="sm" @click="step = 'search'" />
          <brew-pilot-label class="q-ml-sm">Novo Diverso</brew-pilot-label>
        </div>
        <div class="row q-col-gutter-sm">
          <q-input v-model="cfg.name" label="Nome" outlined dense  class="col-12" autofocus
            placeholder="Nome do ingrediente" />
          <q-input v-model.number="cfg.amount" type="number" label="Quantidade"
            outlined dense  class="col-12 col-sm-3" />
          <q-select v-model="cfg.unit" :options="unitOpts" emit-value map-options
            label="Unidade" outlined dense  class="col-12 col-sm-3" />
          <q-select v-model="cfg.use" :options="useOpts" emit-value map-options
            label="Uso" outlined dense  class="col-12 col-sm-3" />
        </div>
      </q-card-section>
      <q-separator  />
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps label="Cancelar" color="grey-5" @click="open = false" />
        <q-btn unelevated no-caps color="blue-grey" icon="add" label="Criar e adicionar"
          :disable="!cfg.name.trim()" @click="confirmAdd" />
      </q-card-actions>
    </template>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { RecipeMisc } from '@/types/recipe'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import BrewPilotSearchInput from '@/components/shared/BrewPilotSearchInput.vue'
import { useIngredientPicker } from '@/composables/useIngredientPicker'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  add: [item: RecipeMisc]
}>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const { step, query, results, loading, selected, cfg, reset, onQueryChange, selectResult, openCreateNew, resultCaption } =
  useIngredientPicker('Misc')

watch(() => props.modelValue, v => { if (v) reset() })

function confirmAdd() {
  const item: RecipeMisc = {
    id: crypto.randomUUID(),
    name: cfg.value.name,
    use: cfg.value.use as RecipeMisc['use'],
    amount: cfg.value.amount,
    unit: cfg.value.unit,
    time: cfg.value.time || undefined,
    ingredientId: selected.value?.id,
  }
  emit('add', item)
  open.value = false
}

const useOpts = [
  { label: 'Mostura', value: 'Mash' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Fermentação', value: 'Fermentation' },
  { label: 'Envase', value: 'Packaging' },
]

const unitOpts = [
  { label: 'g', value: 'g' },
  { label: 'kg', value: 'kg' },
  { label: 'ml', value: 'ml' },
  { label: 'L', value: 'L' },
  { label: 'un', value: 'un' },
  { label: 'tsp', value: 'tsp' },
  { label: 'tbsp', value: 'tbsp' },
]
</script>
