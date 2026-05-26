<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-caption text-grey-5">{{ recipe.miscs.length }} ingrediente(s) adicional(is)</div>
      <q-btn v-if="!hideButton" color="primary" size="sm" icon="add" label="Adicionar" @click="pickerOpen = true" />
    </div>

    <q-list separator>
      <q-item v-for="(m, i) in recipe.miscs" :key="m.id" class="q-px-none">
        <q-item-section>
          <div class="row q-gutter-sm items-center">
            <q-input
              v-model="m.name"
              borderless dense placeholder="Ex: Irish Moss, Lactose, Cascas de Laranja..."
              class="col-12 col-sm-4"
            />
            <q-input
              v-model.number="m.amount"
              type="number" dense outlined
              :suffix="m.unit" label="Qtd"
              class="col-auto" style="max-width: 90px"
            />
            <q-select
              v-model="m.unit"
              :options="unitOptions"
              dense outlined label="Unidade"
              class="col-auto" style="min-width: 80px"
              emit-value map-options
            />
            <q-select
              v-model="m.use"
              :options="useOptions"
              emit-value map-options
              dense outlined label="Uso"
              class="col-auto" style="min-width: 130px"
            />
            <q-input
              v-if="m.use === 'Boil' || m.use === 'Mash'"
              v-model.number="m.time"
              type="number" dense outlined
              suffix="min" label="Tempo"
              class="col-auto" style="max-width: 85px"
            />
            <q-btn flat round dense icon="close" color="grey-6" @click="removeItem(i)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <ingredient-picker-dialog v-model="pickerOpen" type="Misc" @add="onAdd" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '../../../stores/recipeStore'

import IngredientPickerDialog from '../components/IngredientPickerDialog.vue'

const props = defineProps<{ hideButton?: boolean }>()
const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)

const pickerOpen = ref(false)

defineExpose({ openPicker: () => { pickerOpen.value = true } })

function onAdd (item: RecipeMisc) {
  recipe.value.miscs.push(item)
}

function removeItem (index: number) {
  recipe.value.miscs.splice(index, 1)
}

const useOptions = [
  { label: 'Mostura', value: 'Mash' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Fermentação', value: 'Fermentation' },
  { label: 'Envase', value: 'Packaging' }
]

const unitOptions = [
  { label: 'g', value: 'g' },
  { label: 'kg', value: 'kg' },
  { label: 'ml', value: 'ml' },
  { label: 'L', value: 'L' },
  { label: 'un', value: 'un' },
  { label: 'tsp', value: 'tsp' },
  { label: 'tbsp', value: 'tbsp' }
]
</script>
