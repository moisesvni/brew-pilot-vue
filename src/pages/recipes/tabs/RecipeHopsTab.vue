<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-caption text-grey-5">
        {{ recipe.hops.length }} adição(ões) · IBU total:
        <span class="text-amber">{{ stats ? Math.round(stats.ibu) : 0 }}</span>
      </div>
      <q-btn color="primary" size="sm" icon="add" label="Adicionar" @click="pickerOpen = true" />
    </div>

    <q-list separator>
      <q-item v-for="(h, i) in recipe.hops" :key="h.id" class="q-px-none">
        <q-item-section>
          <div class="row q-gutter-sm items-center">
            <q-input
              v-model="h.name"
              borderless dense placeholder="Lúpulo"
              class="col-12 col-sm-3"
            />
            <q-input
              v-model.number="h.amount"
              type="number" dense outlined
              suffix="g" label="Qtd"
              class="col-auto" style="max-width: 90px"
            />
            <q-input
              v-model.number="h.alphaAcid"
              type="number" dense outlined
              suffix="%" label="AA"
              class="col-auto" style="max-width: 80px"
            />
            <q-select
              v-model="h.use"
              :options="useOptions"
              emit-value map-options
              dense outlined label="Uso"
              class="col-auto" style="min-width: 120px"
              @update:model-value="onUseChange(h)"
            />
            <q-input
              v-model.number="h.time"
              type="number" dense outlined
              :suffix="h.use === 'DryHop' ? 'dias' : 'min'"
              label="Tempo"
              class="col-auto" style="max-width: 90px"
            />
            <q-input
              v-if="h.use === 'Whirlpool' || h.use === 'Hopstand'"
              v-model.number="h.temperature"
              type="number" dense outlined
              suffix="°C" label="Temp."
              class="col-auto" style="max-width: 80px"
            />
            <div class="col-auto text-caption text-grey-5">
              {{ h.use !== 'DryHop' ? ibuOf(h) + ' IBU' : h.amount.toFixed(0) + ' g' }}
            </div>
            <q-btn flat round dense icon="close" color="grey-6" @click="removeItem(i)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <hop-picker-dialog v-model="pickerOpen" @add="onAdd" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import type { Recipe, RecipeHop, RecipeStats } from '@/types/recipe'
import { calculateIbuTinseth, calculateIbuWhirlpool } from '@/composables/useBrewCalculator'
import HopPickerDialog from '../components/pickers/HopPickerDialog.vue'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats   = computed(() => store.stats)

const pickerOpen = ref(false)

function onAdd (item: RecipeHop) {
  item.sortOrder = recipe.value.hops.length
  recipe.value.hops.push(item)
}

function removeItem (index: number) {
  recipe.value.hops.splice(index, 1)
}

function onUseChange (hop: RecipeHop) {
  if (hop.use === 'DryHop') hop.time = 5
  else if (hop.use === 'Whirlpool' || hop.use === 'Hopstand') {
    hop.time = 15
    hop.temperature = 85
  }
}

function ibuOf (hop: RecipeHop): number {
  const og = stats.value?.og ?? 1.050
  if (hop.use === 'Boil' || hop.use === 'FirstWort') {
    return calculateIbuTinseth(hop.amount, hop.alphaAcid, hop.time, og, recipe.value.batchVolume)
  }
  if (hop.use === 'Whirlpool' || hop.use === 'Hopstand') {
    return calculateIbuWhirlpool(hop.amount, hop.alphaAcid, hop.time, hop.temperature ?? 85, recipe.value.batchVolume)
  }
  return 0
}

const useOptions = [
  { label: 'Primeira Mostura', value: 'FirstWort' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Whirlpool', value: 'Whirlpool' },
  { label: 'Hopstand', value: 'Hopstand' },
  { label: 'Dry Hop', value: 'DryHop' }
]
</script>
