<template>
  <brew-pilot-dialog v-model="open" title="Redimensionar Lote" icon="mdi-resize"
    icon-color="grey-5" width="380px">

    <q-card-section class="column q-gutter-md q-pt-md">
      <q-input v-model.number="form.batchVolume" type="number" outlined dense 
        label="Volume do Lote (Fermentador)" suffix="L" />
      <q-input v-model.number="form.efficiency" type="number" outlined dense 
        label="Eficiência do Equipamento" suffix="%" />
    </q-card-section>

    <template #footer>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps label="Cancelar" color="grey-5" @click="open = false" />
        <q-btn unelevated no-caps label="Redimensionar" color="positive"
          text-color="white" @click="save" />
      </q-card-actions>
    </template>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)

const form = ref({ batchVolume: 20, efficiency: 72 })

watch(() => props.modelValue, (v) => {
  if (v) {
    form.value.batchVolume = recipe.value.batchVolume
    form.value.efficiency = recipe.value.efficiency
  }
})

function save() {
  recipe.value.batchVolume = form.value.batchVolume
  recipe.value.efficiency = form.value.efficiency
  open.value = false
}
</script>
