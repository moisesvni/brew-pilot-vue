<template>
  <brew-pilot-dialog
    v-model="open"
    title="Ajustar Cor da Receita"
    icon="mdi-palette"
    width="480px"
    persistent
  >
    <template #header-actions>
      <q-btn flat round dense icon="settings" color="grey-5" />
    </template>

    <!-- preview -->
    <div class="row items-center justify-center q-gutter-xl q-pt-sm">
      <div class="column items-center">
        <div class="text-caption text-grey-5 q-mb-xs">Atual</div>
        <q-icon name="mdi-beer" size="52px" :style="{ color: ebcToHex(stats?.ebc ?? 20) }" />
        <div class="text-caption q-mt-xs" style="color: var(--bp-text-value)">{{ stats?.ebc.toFixed(1) }} EBC</div>
      </div>
      <q-icon name="arrow_forward" color="grey-6" size="20px" />
      <div class="column items-center">
        <div class="text-caption q-mb-xs" style="color: var(--bp-text-secondary)">Ajustado</div>
        <q-icon name="mdi-beer" size="52px" :style="{ color: ebcToHex(colorAchieved) }" />
        <div class="text-caption q-mt-xs" style="color: var(--bp-text-value)">{{ colorAchieved.toFixed(1) }} EBC</div>
      </div>
    </div>

    <!-- slider + input -->
    <q-card-section class="q-pt-xs">
      <div class="row items-center q-gutter-sm q-mb-sm">
        <span class="text-caption text-grey-6" style="min-width:44px">2 EBC</span>
        <q-slider v-model="colorTarget" :min="2" :max="99" :step="0.1" color="primary"  class="col" />
        <span class="text-caption text-grey-6" style="min-width:44px;text-align:right">99 EBC</span>
      </div>
      <q-input v-model.number="colorTarget" type="number" step="0.1" outlined dense  label="Cor Alvo (EBC)" />
    </q-card-section>

    <!-- fermentables selection -->
    <q-card-section class="q-pt-xs">
      <div class="text-caption text-grey-5 q-mb-sm">Selecionar Fermentáveis para ajustar</div>
      <q-list dense>
        <q-item v-for="(f, i) in recipe.fermentables" :key="f.id" class="q-px-none q-py-xs">
          <q-item-section side style="padding-right:8px">
            <q-checkbox v-model="colorSelected[i]"  dense color="positive" />
          </q-item-section>
          <q-item-section side style="min-width:52px;padding-right:8px">
            <div class="text-caption text-grey-4">{{ fmtAmt(f.amount) }}</div>
          </q-item-section>
          <q-item-section side style="min-width:36px;padding-right:8px">
            <div class="text-caption text-grey-6">{{ pct(f.amount) }}%</div>
          </q-item-section>
          <q-item-section>
            <q-item-label style="font-size:12px; color: var(--bp-text-primary)">{{ f.name }}</q-item-label>
            <q-item-label caption class="row items-center no-wrap text-grey-7" style="gap:3px;font-size:10.5px">
              <q-icon name="mdi-barley" size="10px" color="primary" />
              {{ f.colorEbc }} EBC
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <template #footer>
      <q-card-section class="q-py-sm q-px-md">
        <div class="row justify-between text-caption text-grey-5">
          <span>Cor Alcançada</span>
          <strong style="color: var(--bp-text-value)">{{ colorAchieved.toFixed(1) }} EBC</strong>
        </div>
        <div class="row justify-between text-caption q-mt-xs" style="color: var(--bp-text-secondary)">
          <span>Mudança total da carga de grãos</span>
          <strong style="color: var(--bp-text-value)">{{ colorWeightDelta >= 0 ? '+' : '' }}{{ colorWeightDelta.toFixed(3) }} kg</strong>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps label="CANCELAR" color="grey-5" @click="open = false" />
        <q-btn unelevated no-caps label="APLICAR ALTERAÇÕES" color="positive" @click="apply" />
      </q-card-actions>
    </template>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import { calculateEbc } from '@/composables/useBrewCalculator'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import { ebcToHex } from '@/utils/brewColors'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats = computed(() => store.stats)

const colorTarget = ref(20)
const colorSelected = ref<boolean[]>([])

const totalWeight = computed(() =>
  recipe.value.fermentables.reduce((s, f) => s + f.amount, 0)
)

function pct(amount: number): string {
  if (!totalWeight.value) return '0.0'
  return ((amount / totalWeight.value) * 100).toFixed(1)
}

function fmtAmt(kg: number): string {
  if (kg >= 1) return `${parseFloat(kg.toFixed(3))} kg`
  return `${(kg * 1000).toFixed(0)} g`
}


const colorScaleFactor = computed(() => {
  if (!colorSelected.value.some(Boolean)) return 1
  let lo = 0, hi = 10, mid = 1
  for (let i = 0; i < 40; i++) {
    mid = (lo + hi) / 2
    const test = recipe.value.fermentables.map((f, idx) => ({
      amount: colorSelected.value[idx] ? f.amount * mid : f.amount,
      colorEbc: f.colorEbc
    }))
    const ebc = calculateEbc(test, recipe.value.batchVolume)
    if (ebc < colorTarget.value) lo = mid; else hi = mid
  }
  return mid
})

const colorAchieved = computed(() => {
  const adj = recipe.value.fermentables.map((f, i) => ({
    amount: colorSelected.value[i] ? f.amount * colorScaleFactor.value : f.amount,
    colorEbc: f.colorEbc
  }))
  return parseFloat(calculateEbc(adj, recipe.value.batchVolume).toFixed(1))
})

const colorWeightDelta = computed(() => {
  const scale = colorScaleFactor.value
  return recipe.value.fermentables.reduce((s, f, i) =>
    colorSelected.value[i] ? s + f.amount * (scale - 1) : s, 0)
})

watch(open, val => {
  if (!val) return
  colorTarget.value = parseFloat((stats.value?.ebc ?? 20).toFixed(1))
  colorSelected.value = recipe.value.fermentables.map(() => true)
})

function apply() {
  const s = colorScaleFactor.value
  recipe.value.fermentables.forEach((f, i) => {
    if (colorSelected.value[i]) f.amount = parseFloat((f.amount * s).toFixed(3))
  })
  open.value = false
}
</script>
