<template>
  <brew-pilot-dialog
    v-model="open"
    icon="mdi-percent"
    icon-color="grey-5"
    width="420px"
    :scrollable="true"
  >
    <template #title>
      Definir Porcentagens
      <span :class="Math.abs(pctTotal - 100) < 0.5 ? 'text-positive' : 'text-negative'">
        {{ pctTotal.toFixed(1) }}%
      </span>
    </template>

    <q-card-section class="q-gutter-sm q-pt-xs">
      <div v-for="(f, i) in recipe.fermentables" :key="f.id">
        <div class="pct-hdr q-pa-sm q-mb-xs rounded-borders">
          <div class="text-caption text-weight-medium" style="color: var(--bp-text-secondary)">{{ fmtAmt(f.amount) }}</div>
          <div class="text-caption" style="color: var(--bp-text-primary)">{{ f.name }}</div>
          <div v-if="f.supplier" class="text-caption text-grey-5">{{ f.supplier }}</div>
        </div>
        <q-input v-model.number="pctValues[i]" type="number" step="0.1"
          outlined dense  prefix="%" />
      </div>
    </q-card-section>

    <template #footer>
      <q-card-section class="row items-center q-py-sm q-px-md" style="flex-shrink:0">
        <span class="text-caption text-grey-5">
          TOTAL: <strong style="color: var(--bp-text-value)">{{ totalWeightDisplay.toUpperCase() }}</strong>
        </span>
        <q-space />
        <q-btn unelevated no-caps label="DEFINIR" color="positive"
          :disable="Math.abs(pctTotal - 100) > 1" @click="apply" />
      </q-card-section>
    </template>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRecipeStore } from '../../../../../stores/recipeStore'
import BrewPilotDialog from '../../../../../components/BrewPilotDialog.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)

const pctValues = ref<number[]>([])

const totalWeight = computed(() =>
  recipe.value.fermentables.reduce((s, f) => s + f.amount, 0)
)

const totalWeightDisplay = computed(() => {
  const kg = totalWeight.value
  return kg >= 1 ? `${kg.toFixed(2)} kg` : `${(kg * 1000).toFixed(0)} g`
})

const pctTotal = computed(() =>
  pctValues.value.reduce((s, v) => s + (v ?? 0), 0)
)

function pct(amount: number): string {
  if (!totalWeight.value) return '0.0'
  return ((amount / totalWeight.value) * 100).toFixed(1)
}

function fmtAmt(kg: number): string {
  if (kg >= 1) return `${parseFloat(kg.toFixed(3))} kg`
  return `${(kg * 1000).toFixed(0)} g`
}

watch(open, val => {
  if (!val) return
  pctValues.value = recipe.value.fermentables.map(f => parseFloat(pct(f.amount)))
})

function apply() {
  const total = totalWeight.value
  recipe.value.fermentables.forEach((f, i) => {
    f.amount = parseFloat(((pctValues.value[i]! / 100) * total).toFixed(3))
  })
  open.value = false
}
</script>

<style scoped>
.pct-hdr {
  background: var(--bp-section-header-bg);
  border-left: 3px solid rgba(193, 113, 14, 0.40);
}
</style>
