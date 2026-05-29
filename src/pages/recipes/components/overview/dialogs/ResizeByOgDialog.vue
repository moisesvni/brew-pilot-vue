<template>
  <brew-pilot-dialog
    v-model="open"
    title="Redimensionar por OG"
    icon="mdi-scale"
    width="320px"
  >
    <q-card-section>
      <q-input v-model.number="ogTarget" type="number" step="0.001" min="1.010" max="1.180"
        outlined dense  :hint="`Atual: ${stats?.og.toFixed(4) ?? '—'}`" />
    </q-card-section>

    <template #footer>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps label="CANCELAR" color="grey-5" @click="open = false" />
        <q-btn unelevated no-caps label="REDIMENSIONAR" color="positive" @click="apply" />
      </q-card-actions>
    </template>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats = computed(() => store.stats)

const ogTarget = ref(1.050)

watch(open, val => {
  if (!val) return
  ogTarget.value = parseFloat((stats.value?.og ?? 1.050).toFixed(4))
})

function apply() {
  const cur = stats.value?.og ?? 1.050
  if (cur <= 1) return
  const factor = (ogTarget.value - 1) / (cur - 1)
  recipe.value.fermentables.forEach(f => {
    f.amount = parseFloat((f.amount * factor).toFixed(3))
  })
  open.value = false
}
</script>
