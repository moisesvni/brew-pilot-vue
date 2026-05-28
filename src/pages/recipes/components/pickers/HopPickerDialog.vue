<template>
  <brew-pilot-dialog v-model="open" title="Adicionar Lúpulo" icon="mdi-hops" icon-color="green" width="560px">

    <!-- ── Busca ──────────────────────────────────────────────────────────── -->
    <template v-if="step === 'search'">
      <q-card-section class="q-pb-xs">
        <brew-pilot-search-input v-model="query" autofocus
          placeholder="Buscar lúpulo na base de dados..."
          :loading="loading" spinner-color="green"
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
              <q-btn flat dense size="sm" label="Usar" color="green" icon="add" />
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
          <brew-pilot-input v-model.number="cfg.amount" type="number" label="Quantidade"
            suffix="g" class="col-12 col-sm-3" />
          <brew-pilot-input v-model.number="cfg.alphaAcid" type="number" label="AA"
            suffix="%" class="col-12 col-sm-3" />
          <brew-pilot-select v-model="cfg.use" :options="useOpts" emit-value map-options
            label="Uso" class="col-12 col-sm-3"
            @update:model-value="onUseChange" />
          <brew-pilot-input v-model.number="cfg.time" type="number"
            :label="cfg.use === 'DryHop' ? 'Dias' : 'Minutos'"
            :suffix="cfg.use === 'DryHop' ? 'dias' : 'min'"
            class="col-12 col-sm-3" />
          <brew-pilot-input v-if="cfg.use === 'Whirlpool' || cfg.use === 'Hopstand'"
            v-model.number="cfg.temperature" type="number"
            label="Temperatura" suffix="°C" class="col-12 col-sm-4" />
        </div>
      </q-card-section>
      <q-separator  />
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="open = false" />
        <brew-pilot-button variant="filled" no-caps color="green" icon="add" label="Adicionar à receita" @click="confirmAdd" />
      </q-card-actions>
    </template>

    <!-- ── Criar novo ────────────────────────────────────────────────────── -->
    <template v-else>
      <q-card-section class="q-pb-sm">
        <div class="row items-center q-mb-md">
          <q-btn flat round dense icon="arrow_back" size="sm" @click="step = 'search'" />
          <brew-pilot-label class="q-ml-sm">Novo Lúpulo</brew-pilot-label>
        </div>
        <brew-pilot-form-section title="Novo Lúpulo">
          <div class="row q-col-gutter-sm">
            <brew-pilot-input v-model="cfg.name" label="Nome" class="col-12" autofocus
              placeholder="Nome do lúpulo" />
            <brew-pilot-input v-model.number="cfg.amount" type="number" label="Quantidade"
              suffix="g" class="col-12 col-sm-3" />
            <brew-pilot-input v-model.number="cfg.alphaAcid" type="number" label="AA %"
              suffix="%" class="col-12 col-sm-3" />
            <brew-pilot-select v-model="cfg.use" :options="useOpts" emit-value map-options
              label="Uso" class="col-12 col-sm-3"
              @update:model-value="onUseChange" />
            <brew-pilot-input v-model.number="cfg.time" type="number"
              :label="cfg.use === 'DryHop' ? 'Dias' : 'Minutos'"
              :suffix="cfg.use === 'DryHop' ? 'dias' : 'min'"
              class="col-12 col-sm-3" />
          </div>
        </brew-pilot-form-section>
      </q-card-section>
      <q-separator  />
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="open = false" />
        <brew-pilot-button variant="filled" no-caps color="green" icon="add" label="Criar e adicionar"
          :disable="!cfg.name.trim()" @click="confirmAdd" />
      </q-card-actions>
    </template>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { RecipeHop } from '@/types/recipe'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import BrewPilotSearchInput from '@/components/shared/BrewPilotSearchInput.vue'
import BrewPilotLabel from '@/components/shared/BrewPilotLabel.vue'
import BrewPilotInput from '@/components/shared/BrewPilotInput.vue'
import BrewPilotSelect from '@/components/shared/BrewPilotSelect.vue'
import BrewPilotButton from '@/components/shared/BrewPilotButton.vue'
import BrewPilotFormSection from '@/components/shared/BrewPilotFormSection.vue'
import { useIngredientPicker } from '@/composables/useIngredientPicker'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  add: [item: RecipeHop]
}>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const { step, query, results, loading, selected, cfg, reset, onQueryChange, selectResult, openCreateNew, resultCaption } =
  useIngredientPicker('Hop')

watch(() => props.modelValue, v => { if (v) reset() })

function onUseChange(use: string) {
  if (use === 'DryHop') {
    cfg.value.time = 5
    cfg.value.temperature = undefined
  } else if (use === 'Whirlpool' || use === 'Hopstand') {
    cfg.value.time = 15
    cfg.value.temperature = 85
  } else {
    cfg.value.time = 60
    cfg.value.temperature = undefined
  }
}

function confirmAdd() {
  const item: RecipeHop = {
    id: crypto.randomUUID(),
    name: cfg.value.name,
    use: cfg.value.use as RecipeHop['use'],
    amount: cfg.value.amount,
    alphaAcid: cfg.value.alphaAcid,
    time: cfg.value.time,
    temperature: cfg.value.temperature,
    sortOrder: 0,
    ingredientId: selected.value?.id,
  }
  emit('add', item)
  open.value = false
}

const useOpts = [
  { label: 'Primeira Mostura', value: 'FirstWort' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Whirlpool', value: 'Whirlpool' },
  { label: 'Hopstand', value: 'Hopstand' },
  { label: 'Dry Hop', value: 'DryHop' },
]
</script>
