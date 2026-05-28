<template>
  <div class="row q-gutter-lg">
    <!-- Coluna esquerda: campos básicos -->
    <div class="col-12 col-md-7">
      <div class="row q-gutter-md">
        <q-select
          v-model="recipe.type"
          :options="typeOptions"
          emit-value map-options
          label="Tipo de receita"
          outlined dark dense
          class="col-12 col-sm-5"
        />
        <q-input
          v-model.number="recipe.batchVolume"
          type="number" label="Volume final (L)"
          outlined dark dense suffix="L"
          class="col-12 col-sm-3"
        />
        <q-input
          v-model.number="recipe.boilTime"
          type="number" label="Fervura"
          outlined dark dense suffix="min"
          class="col-12 col-sm-3"
        />
        <q-input
          v-model.number="recipe.efficiency"
          type="number" label="Eficiência"
          outlined dark dense suffix="%"
          class="col-12 col-sm-3"
        />
        <q-input
          v-model.number="recipe.preBoilVolume"
          type="number" label="Vol. pré-fervura"
          outlined dark dense suffix="L"
          class="col-12 col-sm-3"
        />
      </div>
    </div>

    <!-- Coluna direita: barras de estilo -->
    <div v-if="stats" class="col-12 col-md-4">
      <div class="text-caption text-grey-5 q-mb-sm">Comparação com o estilo</div>
      <style-bar v-if="recipe.styleGuide" label="ABV" unit="%" :value="stats.abv" :min="recipe.styleGuide.abvMin" :max="recipe.styleGuide.abvMax" />
      <style-bar v-if="recipe.styleGuide" label="OG" :value="(stats.og - 1) * 1000" :min="(recipe.styleGuide.ogMin - 1) * 1000" :max="(recipe.styleGuide.ogMax - 1) * 1000" />
      <style-bar v-if="recipe.styleGuide" label="IBU" :value="stats.ibu" :min="recipe.styleGuide.ibuMin" :max="recipe.styleGuide.ibuMax" />
      <style-bar v-if="recipe.styleGuide" label="EBC" :value="stats.ebc" :min="recipe.styleGuide.ebcMin" :max="recipe.styleGuide.ebcMax" />
      <div v-if="!recipe.styleGuide" class="text-grey-6 text-caption">Selecione um estilo para ver a comparação.</div>

      <q-separator class="q-my-sm" />
      <div class="row q-gutter-sm justify-around">
        <div v-if="stats" class="column items-center">
          <span class="text-amber text-weight-bold">{{ stats.buGuRatio }}</span>
          <span class="text-caption text-grey-5">BU/GU</span>
        </div>
        <div v-if="stats" class="column items-center">
          <span class="text-amber text-weight-bold">{{ stats.calories }}</span>
          <span class="text-caption text-grey-5">Cal/355ml</span>
        </div>
        <div v-if="stats" class="column items-center">
          <span class="text-amber text-weight-bold">{{ stats.totalGrainWeight.toFixed(2) }}kg</span>
          <span class="text-caption text-grey-5">Maltes</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'

import StyleBar from '../components/StyleBar.vue'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats   = computed(() => store.stats)

const typeOptions = [
  { label: 'All Grain', value: 'AllGrain' },
  { label: 'Extrato', value: 'Extract' },
  { label: 'Parcial Mash', value: 'PartialMash' }
]
</script>
