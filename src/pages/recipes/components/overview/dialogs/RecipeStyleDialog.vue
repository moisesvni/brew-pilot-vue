<template>
  <brew-pilot-dialog v-model="open" title="Selecionar Estilo BJCP" icon="mdi-book-open-variant"
    icon-color="primary" width="560px">

    <q-card-section>
      <q-input v-model="styleSearch" outlined dense
        placeholder="Buscar estilo (ex: IPA, Stout, 12C...)"
         class="q-mb-md" @update:model-value="onSearch">
        <template #prepend><q-icon name="search" color="grey-5" /></template>
      </q-input>

      <div v-if="loading" class="text-center q-py-lg">
        <q-spinner color="primary" size="32px" />
      </div>
      <div v-else-if="!filteredStyles.length" class="text-grey-5 text-center q-py-lg">
        Nenhum estilo encontrado
      </div>
      <q-list v-else separator style="max-height: 55vh; overflow-y: auto">
        <q-item v-for="s in filteredStyles" :key="s.id" clickable v-ripple
          :active="recipe.styleGuideId === s.id" active-class="bg-amber-2 text-dark"
          @click="selectStyle(s)">
          <q-item-section>
            <q-item-label class="text-weight-medium">
              <span class="text-amber-8">{{ s.code }}</span> {{ s.name }}
            </q-item-label>
            <q-item-label caption class="text-grey-5">
              {{ s.category }} · ABV {{ s.abvMin }}–{{ s.abvMax }}% ·
              IBU {{ s.ibuMin }}–{{ s.ibuMax }}
            </q-item-label>
          </q-item-section>
          <q-item-section side v-if="recipe.styleGuideId === s.id">
            <q-icon name="check_circle" color="positive" />
          </q-item-section>
        </q-item>
      </q-list>

      <div v-if="error" class="text-negative text-caption q-mt-sm">{{ error }}</div>
    </q-card-section>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BrewPilotDialog from '../../../../../components/BrewPilotDialog.vue'
import { useRecipeStore } from '../../../../../stores/recipeStore'
import type { StyleGuide } from '../../../../../types/recipe'
import apiClient from '../../../../../services/apiClient'
import { sampleStyles } from '../../../../../data/styles-sample'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)

const styleSearch = ref('')
const styles = ref<StyleGuide[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

watch(open, async (v) => {
  if (v && styles.value.length === 0) {
    loading.value = true
    error.value = null
    try {
      const { data } = await apiClient.get<StyleGuide[]>('/styles')
      styles.value = data
    } catch {
      styles.value = sampleStyles
    } finally {
      loading.value = false
    }
  }
})

const filteredStyles = computed(() => {
  const q = styleSearch.value.toLowerCase().trim()
  if (!q) return styles.value
  return styles.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.code.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q)
  )
})

function onSearch() { /* reactivity via computed */ }

function selectStyle(s: StyleGuide) {
  recipe.value.styleGuideId = s.id
  recipe.value.styleGuide = s
  open.value = false
}
</script>
