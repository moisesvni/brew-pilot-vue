<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-caption text-grey-5">{{ recipe.mashSteps.length }} etapa(s) de mostura</div>
      <q-btn color="primary" size="sm" icon="add" label="Adicionar etapa" @click="addStep" />
    </div>

    <q-list separator>
      <q-item v-for="(step, i) in sortedSteps" :key="step.id" class="q-px-none">
        <q-item-section>
          <div class="row q-gutter-sm items-center">
            <q-input
              v-model="step.name"
              borderless dense placeholder="Nome da etapa"
              class="col-12 col-sm-3"
            />
            <q-select
              v-model="step.type"
              :options="stepTypes"
              emit-value map-options
              dense outlined label="Tipo"
              class="col-auto" style="min-width: 120px"
            />
            <q-input
              v-model.number="step.temperature"
              type="number" dense outlined
              suffix="°C" label="Temp."
              class="col-auto" style="max-width: 90px"
            />
            <q-input
              v-model.number="step.time"
              type="number" dense outlined
              suffix="min" label="Tempo"
              class="col-auto" style="max-width: 90px"
            />
            <q-input
              v-model.number="step.waterRatio"
              type="number" dense outlined
              suffix="L/kg" label="Relação"
              class="col-auto" style="max-width: 95px"
            />
            <q-btn flat round dense icon="close" color="grey-6" @click="removeStep(i)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Perfis prontos -->
    <div class="q-mt-md">
      <div class="text-caption text-grey-5 q-mb-xs">Perfis prontos</div>
      <div class="row q-gutter-sm">
        <q-chip
          v-for="p in presets"
          :key="p.label"
          clickable outline color="grey-7"
          @click="applyPreset(p)"
        >
          {{ p.label }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRecipeStore } from '../../../stores/recipeStore'

const store  = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)

const sortedSteps = computed(() => [...recipe.value.mashSteps].sort((a, b) => a.sortOrder - b.sortOrder))

function addStep () {
  recipe.value.mashSteps.push({
    id: crypto.randomUUID(),
    name: 'Nova Etapa',
    type: 'Infusion',
    temperature: 67,
    time: 60,
    waterRatio: 3.0,
    sortOrder: recipe.value.mashSteps.length
  })
}

function removeStep (index: number) {
  recipe.value.mashSteps.splice(index, 1)
}

const stepTypes = [
  { label: 'Infusão', value: 'Infusion' },
  { label: 'Temperatura', value: 'Temperature' },
  { label: 'Decocção', value: 'Decoction' }
]

const presets = [
  {
    label: 'Single Infusion — Padrão',
    steps: [
      { name: 'Sacarificação', type: 'Infusion', temperature: 67, time: 75, waterRatio: 3.0 },
      { name: 'MashOut', type: 'Temperature', temperature: 75, time: 10 }
    ]
  },
  {
    label: 'Single Infusion — Seco',
    steps: [
      { name: 'Sacarificação', type: 'Infusion', temperature: 63, time: 75, waterRatio: 3.0 },
      { name: 'MashOut', type: 'Temperature', temperature: 75, time: 10 }
    ]
  },
  {
    label: 'Weiss — Duas rampas',
    steps: [
      { name: 'Proteólise', type: 'Infusion', temperature: 52, time: 20, waterRatio: 2.5 },
      { name: 'Sacarificação', type: 'Temperature', temperature: 65, time: 45 },
      { name: 'MashOut', type: 'Temperature', temperature: 75, time: 10 }
    ]
  }
]

function applyPreset (preset: typeof presets[0]) {
  recipe.value.mashSteps.splice(0)
  preset.steps.forEach((s, i) => {
    recipe.value.mashSteps.push({
      id: crypto.randomUUID(),
      sortOrder: i,
      waterRatio: undefined,
      temperature: 0,
      time: 0,
      type: 'Infusion',
      name: '',
      ...s
    } as RecipeMashStep)
  })
}
</script>
