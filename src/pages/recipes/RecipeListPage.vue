<template>
  <q-page class="q-pa-md">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold">Receitas</div>
        <div class="text-caption text-grey-5">{{ store.recipes.length }} receita(s) cadastrada(s)</div>
      </div>
      <q-btn color="primary" icon="add" label="Nova Receita" unelevated @click="createNew" />
    </div>

    <!-- Filtros -->
    <div class="row q-gutter-sm q-mb-md">
      <q-input
        v-model="search"
        placeholder="Buscar receita..."
        dense outlined
        class="col-12 col-sm-4"
        bg-color="dark"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        v-model="filterType"
        :options="typeOptions"
        label="Tipo"
        dense outlined
        clearable
        class="col-auto"
        bg-color="dark"
        style="min-width: 140px"
      />
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="row q-gutter-md">
      <q-skeleton v-for="i in 6" :key="i" height="160px" class="col-12 col-sm-6 col-md-4" />
    </div>

    <!-- Lista vazia -->
    <div v-else-if="!filteredRecipes.length" class="column items-center q-py-xl text-grey-5">
      <q-icon name="mdi-beer-outline" size="80px" class="q-mb-md" />
      <div class="text-h6">Nenhuma receita encontrada</div>
      <div class="text-body2 q-mb-md">Crie sua primeira receita cervejeira</div>
      <q-btn color="primary" label="Criar Receita" @click="createNew" />
    </div>

    <!-- Grid de receitas -->
    <div v-else class="row q-gutter-md">
      <recipe-card
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :recipe="recipe"
        class="col-12 col-sm-6 col-md-4"
        @edit="editRecipe"
        @duplicate="duplicateRecipe"
        @delete="confirmDelete"
      />
    </div>

    <!-- Dialog de confirmação de exclusão -->
    <q-dialog v-model="deleteDialog">
      <q-card dark style="min-width: 320px">
        <q-card-section>
          <div class="text-h6">Excluir receita?</div>
        </q-card-section>
        <q-card-section class="text-body2">
          A receita <strong>{{ deleteTarget?.name }}</strong> será excluída permanentemente.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat color="negative" label="Excluir" @click="executeDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useRecipeStore } from '../../stores/recipeStore'
import RecipeCard from '../../components/recipe/RecipeCard.vue'
import type { Recipe } from '../../types/recipe.types'

const store = useRecipeStore()
const router = useRouter()
const $q = useQuasar()

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

onMounted(() => store.loadRecipes())

function createNew () {
  store.newRecipe()
  router.push('/recipes/new')
}

function editRecipe (recipe: Recipe) {
  router.push(`/recipes/${recipe.id}`)
}

async function duplicateRecipe (recipe: Recipe) {
  await store.duplicateRecipe(recipe.id)
  router.push('/recipes/new')
  $q.notify({ message: 'Receita duplicada. Salve para confirmar.', color: 'positive' })
}

function confirmDelete (recipe: Recipe) {
  deleteTarget.value = recipe
  deleteDialog.value = true
}

async function executeDelete () {
  if (!deleteTarget.value) return
  await store.deleteRecipe(deleteTarget.value.id)
  deleteDialog.value = false
  $q.notify({ message: 'Receita excluída.', color: 'negative' })
}
</script>
