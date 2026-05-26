<template>
  <q-page class="q-pa-none">
    <!-- Toolbar da receita -->
    <q-toolbar class="bg-dark q-py-sm" style="border-bottom: 1px solid rgba(255,255,255,0.1)">
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/recipes')" />
      <q-toolbar-title>
        <q-input v-if="recipe" v-model="recipe.name" borderless dense class="text-h6 text-weight-bold"
          placeholder="Nome da receita" style="max-width: 300px">
          <q-tooltip>Editar nome da receita</q-tooltip>
        </q-input>  
      </q-toolbar-title>
      <!-- Stats resumidos no header (mobile-friendly) -->
      <div v-if="stats && activeTab != 'overview'" class="row q-gutter-sm items-center q-mr-xl">
        <stat-chip label="OG" :value="stats.og.toFixed(3)" />
        <stat-chip label="FG" :value="stats.fg.toFixed(3)" />
        <stat-chip label="ABV" :value="stats.abv.toFixed(1)" unit="%" />
        <stat-chip label="IBU" :value="String(Math.round(stats.ibu))" />
        <stat-chip label="EBC" :value="String(Math.round(stats.ebc))" />
        <stat-chip label="BU/GU" :value="String(stats.buGuRatio)" />
        <stat-chip label="Cal" :value="String(stats.calories)" unit="/355ml" />
      </div>

      <q-btn v-if="recipe" no-caps dense unelevated round size="md" color="grey-8" :label="`v${recipe.version}`"
        class="text-grey-3">
        <q-popup-edit v-model="recipe.version" auto-save v-slot="scope">
          <q-input v-model.number="scope.value" type="number" dense autofocus label="Versão" @keyup.enter="scope.set" />
        </q-popup-edit>
      </q-btn>
      <!-- Alertas -->
      <q-btn v-if="store.validations.length" flat round :icon="store.hasErrors ? 'error' : 'warning'"
        :color="store.hasErrors ? 'negative' : 'warning'" class="q-ml-sm">
        <q-badge :color="store.hasErrors ? 'negative' : 'warning'" floating>
          {{ store.validations.length }}
        </q-badge>
        <q-tooltip>Ver alertas</q-tooltip>
        <q-menu dark>
          <q-list style="min-width: 280px; max-width: 380px">
            <q-item v-for="(v, i) in store.validations" :key="i">
              <q-item-section avatar>
                <q-icon :name="v.severity === 'critical' ? 'error' : v.severity === 'warning' ? 'warning' : 'info'"
                  :color="v.severity === 'critical' ? 'negative' : v.severity === 'warning' ? 'warning' : 'info'" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption">{{ v.message }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn color="primary" label="Salvar" unelevated class="q-ml-sm" :loading="store.saving" @click="save" />
    </q-toolbar>

    <!-- Abas do editor -->
    <q-tabs v-model="activeTab" dense class="bg-dark text-grey-5" active-color="primary" indicator-color="primary"
      align="left">
      <q-tab name="overview" label="Visão Geral" icon="mdi-view-dashboard-outline" />
      <q-tab name="fermentables" label="Fermentáveis" icon="mdi-barley" />
      <q-tab name="hops" label="Lúpulos" icon="mdi-hops" />
      <q-tab name="yeast" label="Levedura" icon="mdi-flask" />
      <q-tab name="mash" label="Mostura" icon="mdi-thermometer" />
      <q-tab name="water" label="Água" icon="water_drop" />
      <q-tab name="misc" label="Outros" icon="add_circle_outline" />
      <q-tab name="tags" label="Tags" icon="mdi-tag-multiple" />
      <q-tab name="notes" label="Notas" icon="notes" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="activeTab" animated class="bg-transparent">
      <!-- Visão Geral -->
      <q-tab-panel name="overview" class="q-pa-none">
        <recipe-overview-tab v-if="recipe" />
      </q-tab-panel>

      <!-- Fermentáveis -->
      <q-tab-panel name="fermentables" class="q-pa-md">
        <recipe-fermentables-tab v-if="recipe" />
      </q-tab-panel>

      <!-- Lúpulos -->
      <q-tab-panel name="hops" class="q-pa-md">
        <recipe-hops-tab v-if="recipe" />
      </q-tab-panel>

      <!-- Levedura -->
      <q-tab-panel name="yeast" class="q-pa-md">
        <recipe-yeast-tab v-if="recipe" />
      </q-tab-panel>

      <!-- Mostura -->
      <q-tab-panel name="mash" class="q-pa-md">
        <recipe-mash-tab v-if="recipe" />
      </q-tab-panel>

      <!-- Água -->
      <q-tab-panel name="water" class="q-pa-md">
        <div class="text-grey-5 text-center q-py-xl">
          <q-icon name="water_drop" size="48px" /><br>
          Perfil de água em breve
        </div>
      </q-tab-panel>

      <!-- Outros -->
      <q-tab-panel name="misc" class="q-pa-md">
        <recipe-misc-tab v-if="recipe" />
      </q-tab-panel>

      <!-- Tags -->
      <q-tab-panel name="tags" class="q-pa-md">
        <div class="text-caption text-grey-5 q-mb-sm">Tags da receita</div>
        <div class="row q-gutter-sm q-mb-md">
          <q-chip v-for="(tag, i) in (recipe?.tags ?? [])" :key="tag" removable color="grey-8" text-color="white"
            @remove="removeTag(i)">
            {{ tag }}
          </q-chip>
        </div>
        <div class="row q-gutter-sm items-center">
          <q-input v-model="newTag" dense outlined bg-color="dark" placeholder="Nova tag..." style="max-width:200px"
            @keyup.enter="addTag" />
          <q-btn flat dense icon="add" color="primary" @click="addTag" :disable="!newTag.trim()" />
        </div>
      </q-tab-panel>

      <!-- Notas -->
      <q-tab-panel name="notes" class="q-pa-md">
        <q-input v-if="recipe" v-model="recipe.notes" type="textarea" label="Notas da receita" outlined dark autogrow
          placeholder="Histórico, observações, sugestões de melhoria..." />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useRecipeStore } from '../../stores/recipeStore'
import StatChip from '../../components/shared/StatChip.vue'
import RecipeOverviewTab from './tabs/RecipeOverviewTab.vue'
import RecipeFermentablesTab from './tabs/RecipeFermentablesTab.vue'
import RecipeHopsTab from './tabs/RecipeHopsTab.vue'
import RecipeYeastTab from './tabs/RecipeYeastTab.vue'
import RecipeMashTab from './tabs/RecipeMashTab.vue'
import RecipeMiscTab from './tabs/RecipeMiscTab.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useRecipeStore()

const activeTab = ref('overview')
const recipe = computed(() => store.currentRecipe)
const stats = computed(() => store.stats)

// Tags
const newTag = ref('')
function addTag() {
  const tag = newTag.value.trim()
  if (!tag || !recipe.value) return
  if (!recipe.value.tags) recipe.value.tags = []
  if (!recipe.value.tags.includes(tag)) recipe.value.tags.push(tag)
  newTag.value = ''
}
function removeTag(index: number) {
  recipe.value?.tags?.splice(index, 1)
}

onMounted(async () => {
  const id = route.params.id as string
  if (id && id !== 'new') {
    await store.loadRecipe(id)
  } else if (!store.currentRecipe) {
    store.newRecipe()
  }
})

async function save() {
  try {
    await store.saveRecipe()
    $q.notify({ message: 'Receita salva com sucesso!', color: 'positive', icon: 'check' })
    if (store.currentRecipe?.id) {
      router.replace(`/recipes/${store.currentRecipe.id}`)
    }
  } catch {
    $q.notify({ message: 'Erro ao salvar receita.', color: 'negative' })
  }
}
</script>
