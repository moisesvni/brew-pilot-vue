<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-caption text-grey-5">{{ recipe.miscs.length }} ingrediente(s) adicional(is)</div>
      <q-btn color="primary" size="sm" icon="add" label="Adicionar" @click="addItem" />
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
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '../../../types/recipe.types'

const props = defineProps<{ recipe: Recipe }>()

function addItem () {
  props.recipe.miscs.push({
    id: crypto.randomUUID(),
    name: '',
    use: 'Boil',
    amount: 1,
    unit: 'g'
  })
}

function removeItem (index: number) {
  props.recipe.miscs.splice(index, 1)
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
