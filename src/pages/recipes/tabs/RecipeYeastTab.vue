<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-caption text-grey-5">
        FG estimada:
        <span class="text-amber">{{ stats ? stats.fg.toFixed(3) : '—' }}</span>
        · ABV:
        <span class="text-amber">{{ stats ? stats.abv.toFixed(1) + '%' : '—' }}</span>
      </div>
      <q-btn color="primary" size="sm" icon="add" label="Adicionar" @click="pickerOpen = true" />
    </div>

    <q-list separator>
      <q-item v-for="(y, i) in recipe.yeasts" :key="y.id" class="q-px-none">
        <q-item-section>
          <div class="row q-gutter-sm items-center">
            <q-input
              v-model="y.name"
              borderless dense placeholder="Levedura"
              class="col-12 col-sm-3"
            />
            <q-input
              v-if="y.laboratory !== undefined"
              v-model="y.laboratory"
              borderless dense placeholder="Lab"
              class="col-auto" style="max-width: 100px"
            />
            <q-select
              v-model="y.form"
              :options="formOptions"
              emit-value map-options
              dense outlined label="Forma"
              class="col-auto" style="min-width: 100px"
            />
            <q-input
              v-model.number="y.attenuation"
              type="number" dense outlined
              suffix="%" label="Atenuação"
              class="col-auto" style="max-width: 100px"
            />
            <q-input
              v-model.number="y.packages"
              type="number" dense outlined
              label="Pacotes"
              class="col-auto" style="max-width: 80px"
            />
            <q-input
              v-model.number="y.fermentationTemperature"
              type="number" dense outlined
              suffix="°C" label="Temp."
              class="col-auto" style="max-width: 85px"
            />
            <q-btn flat round dense icon="close" color="grey-6" @click="removeItem(i)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <yeast-picker-dialog v-model="pickerOpen" @add="onAdd" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '../../../stores/recipeStore'
import type { Recipe, RecipeYeast, RecipeStats } from '../../../types/recipe'
import YeastPickerDialog from '../components/pickers/YeastPickerDialog.vue'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats   = computed(() => store.stats)

const pickerOpen = ref(false)

function onAdd (item: RecipeYeast) {
  recipe.value.yeasts.push(item)
}

function removeItem (index: number) {
  recipe.value.yeasts.splice(index, 1)
}

const formOptions = [
  { label: 'Seca', value: 'Dry' },
  { label: 'Líquida', value: 'Liquid' },
  { label: 'Lama', value: 'Slurry' }
]
</script>
