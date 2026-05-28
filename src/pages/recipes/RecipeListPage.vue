<template>
  <q-page class="q-pa-md">
    <!-- Cabeçalho -->
    <brew-pilot-page-header
      icon="mdi-note-text"
      title="Receitas"
      :chip="store.recipes.length + ' receita(s)'"
    >
      <template #actions>
        <brew-pilot-button variant="filled" color="primary" icon="add" label="Nova Receita" no-caps
          tooltip="Criar nova receita" @click="createNew" />
      </template>
    </brew-pilot-page-header>

    <!-- Alerta: sem perfil de equipamento -->
    <q-banner v-if="!equipStore.loading && equipStore.userProfiles.length === 0"
      inline-actions rounded class="q-mb-md"
      :style="{ background: 'rgba(193,113,14,0.12)', border: '1px solid rgba(193,113,14,0.35)' }">
      <template #avatar>
        <q-icon name="mdi-alert-circle-outline" color="warning" size="22px" />
      </template>
      <brew-pilot-label variant="primary" tag="div" size="13px" class="text-weight-medium">Nenhum perfil de equipamento encontrado</brew-pilot-label>
      <brew-pilot-label variant="secondary" tag="div" size="12px">Para criar receitas com cálculos precisos de volume e eficiência, você precisa de ao menos um perfil de equipamento.</brew-pilot-label>
      <template #action>
        <brew-pilot-button class="q-pr-sm" variant="outline" label="Configurar Equipamento" icon="mdi-cog-outline" no-caps dense
          tooltip="Crie um perfil de equipamento para habilitar os cálculos de volume, eficiência e OG/FG"
          @click="router.push('/profiles/equipment')" />
      </template>
    </q-banner>

    <!-- Filtros -->
    <div class="row q-gutter-sm q-mb-md">
      <brew-pilot-search-input v-model="search" placeholder="Buscar receita..." class="col-12 col-sm-4" />
      <brew-pilot-select v-model="filterType" :options="typeOptions" label="Tipo" clearable emit-value map-options
        class="col-auto" style="min-width: 140px" />
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="row q-gutter-md">
      <q-skeleton v-for="i in 6" :key="i" height="160px" class="col-12 col-sm-6 col-md-4" />
    </div>

    <!-- Lista vazia -->
    <div v-else-if="!filteredRecipes.length" class="column items-center q-py-xl">
      <q-icon name="mdi-beer-outline" size="80px" class="q-mb-md" :style="{ color: 'var(--bp-text-secondary)' }" />
      <div class="text-h6 q-mb-xs" style="color: var(--bp-text-primary)">Nenhuma receita encontrada</div>
      <div class="text-body2 q-mb-md" style="color: var(--bp-text-secondary)">
        Crie sua primeira receita cervejeira
      </div>
    </div>

    <!-- Grid de receitas -->
    <div v-else class="row q-gutter-md">
      <recipe-card v-for="recipe in filteredRecipes" :key="recipe.id" :recipe="recipe" class="col-12 col-sm-6 col-md-4"
        @edit="editRecipe" @duplicate="duplicateRecipe" @delete="confirmDelete" />
    </div>

    <!-- Dialog de confirmação de exclusão -->
    <brew-pilot-dialog v-model="deleteDialog" title="Excluir receita?" icon="mdi-delete-outline" icon-color="negative"
      width="360px">
      <q-card-section class="text-body2" style="color: var(--bp-text-primary)">
        A receita <strong>{{ deleteTarget?.name }}</strong> será excluída permanentemente.
      </q-card-section>
      <template #footer>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="deleteDialog = false" />
          <brew-pilot-button variant="filled" no-caps label="Excluir" color="negative" @click="executeDelete" />
        </q-card-actions>
      </template>
    </brew-pilot-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useRecipeStore } from '@/stores/recipeStore'
import { useEquipmentStore } from '@/stores/equipmentStore'
import RecipeCard from './components/RecipeCard.vue'
import BrewPilotButton from '@/components/shared/BrewPilotButton.vue'
import BrewPilotLabel from '@/components/shared/BrewPilotLabel.vue'
import BrewPilotPageHeader from '@/components/shared/BrewPilotPageHeader.vue'
import BrewPilotSearchInput from '@/components/shared/BrewPilotSearchInput.vue'
import BrewPilotSelect from '@/components/shared/BrewPilotSelect.vue'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import type { Recipe } from '@/types/recipe'

const store = useRecipeStore()
const router = useRouter()
const $q = useQuasar()
const equipStore = useEquipmentStore()

const search = ref('')
const filterType = ref<string | null>(null)
const deleteDialog = ref(false)
const deleteTarget = ref<Recipe | null>(null)

const typeOptions = [
  { label: 'All Grain', value: 'AllGrain' },
  { label: 'Extrato', value: 'Extract' },
  { label: 'Parcial', value: 'PartialMash' }
]

const filteredRecipes = computed(() => {
  return store.recipes.filter(r => {
    const matchSearch = !search.value || r.name.toLowerCase().includes(search.value.toLowerCase())
    const matchType = !filterType.value || r.type === filterType.value
    return matchSearch && matchType
  })
})

onMounted(() => {
  store.loadRecipes()
  if (!equipStore.profiles.length) equipStore.fetchAll()
})

function createNew() {
  store.newRecipe()
  router.push('/recipes/new')
}

function editRecipe(recipe: Recipe) {
  router.push(`/recipes/${recipe.id}`)
}

async function duplicateRecipe(recipe: Recipe) {
  await store.duplicateRecipe(recipe.id)
  router.push('/recipes/new')
  $q.notify({ message: 'Receita duplicada. Salve para confirmar.', color: 'positive' })
}

function confirmDelete(recipe: Recipe) {
  deleteTarget.value = recipe
  deleteDialog.value = true
}

async function executeDelete() {
  if (!deleteTarget.value) return
  await store.deleteRecipe(deleteTarget.value.id)
  deleteDialog.value = false
  $q.notify({ message: 'Receita excluída.', color: 'negative' })
}
</script>
