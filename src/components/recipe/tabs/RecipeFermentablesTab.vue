<template>
  <div>
    <!-- Header com totais -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <span class="text-caption text-grey-5">
          {{ recipe.fermentables.length }} fermentável(is)
          · {{ totalWeight.toFixed(2) }} kg
        </span>
      </div>
      <q-btn color="primary" size="sm" icon="add" label="Adicionar" @click="addItem" />
    </div>

    <!-- Lista de fermentáveis -->
    <q-list separator>
      <q-item
        v-for="(f, i) in recipe.fermentables"
        :key="f.id"
        class="q-px-none"
      >
        <q-item-section>
          <div class="row q-gutter-sm items-center">
            <!-- Cor do malte -->
            <div
              class="rounded-borders q-mr-xs"
              style="width: 14px; height: 36px; flex-shrink: 0"
              :style="{ backgroundColor: ebcToHex(f.colorEbc) }"
            />

            <q-input
              v-model="f.name"
              borderless dense
              placeholder="Nome do fermentável"
              class="col-12 col-sm-3"
            />
            <q-input
              v-model.number="f.amount"
              type="number" dense outlined
              suffix="kg" label="Qtd"
              class="col-auto" style="max-width: 100px"
            />
            <q-input
              v-model.number="f.colorEbc"
              type="number" dense outlined
              suffix="EBC" label="Cor"
              class="col-auto" style="max-width: 90px"
            />
            <q-input
              v-model.number="f.potential"
              type="number" dense outlined
              label="PPG" hint=""
              class="col-auto" style="max-width: 80px"
            />
            <q-select
              v-model="f.use"
              :options="useOptions"
              emit-value map-options
              dense outlined label="Uso"
              class="col-auto" style="min-width: 110px"
            />
            <div class="col-auto text-caption text-grey-5">
              {{ percentage(f.amount) }}%
            </div>
            <q-btn flat round dense icon="close" color="grey-6" @click="removeItem(i)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Gráfico de percentuais -->
    <div v-if="recipe.fermentables.length" class="q-mt-md">
      <div class="text-caption text-grey-5 q-mb-xs">Composição do grist</div>
      <div class="row" style="height: 12px; border-radius: 6px; overflow: hidden">
        <div
          v-for="f in recipe.fermentables"
          :key="f.id"
          :style="{
            width: percentage(f.amount) + '%',
            backgroundColor: ebcToHex(f.colorEbc),
            transition: 'width 0.3s ease'
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe } from '../../../types/recipe.types'

const props = defineProps<{ recipe: Recipe }>()

const totalWeight = computed(() => props.recipe.fermentables.reduce((s, f) => s + f.amount, 0))

function percentage (amount: number): number {
  if (!totalWeight.value) return 0
  return parseFloat(((amount / totalWeight.value) * 100).toFixed(1))
}

function addItem () {
  props.recipe.fermentables.push({
    id: crypto.randomUUID(),
    name: '',
    type: 'Grain',
    use: 'Mash',
    amount: 1,
    colorEbc: 5,
    potential: 37,
    yieldPercentage: 78,
    sortOrder: props.recipe.fermentables.length
  })
}

function removeItem (index: number) {
  props.recipe.fermentables.splice(index, 1)
}

const useOptions = [
  { label: 'Mostura', value: 'Mash' },
  { label: 'Maceração', value: 'Steep' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Adição tardia', value: 'LateAddition' }
]

function ebcToHex (ebc: number): string {
  const srm = ebc / 1.97
  if (srm < 2) return '#F8F753'
  if (srm < 4) return '#F6F513'
  if (srm < 6) return '#ECE61A'
  if (srm < 8) return '#D5BC26'
  if (srm < 10) return '#BF9C26'
  if (srm < 13) return '#A07C2A'
  if (srm < 17) return '#8A5C28'
  if (srm < 20) return '#6A3C20'
  if (srm < 24) return '#4A2010'
  if (srm < 30) return '#2A1005'
  return '#0A0505'
}
</script>
