<template>
  <q-page class="q-pa-none">
    <!-- Toolbar da receita -->
    <q-toolbar class="bg-dark q-px-md" style="border-bottom: 1px solid rgba(255,255,255,0.1)">
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/recipes')" />
      <q-toolbar-title>
        <q-input
          v-model="recipe.name"
          borderless
          dense
          class="text-h6 text-weight-bold"
          placeholder="Nome da receita"
          style="max-width: 300px"
        />
      </q-toolbar-title>

      <!-- Stats resumidos no header (mobile-friendly) -->
      <div class="row q-gutter-md items-center gt-xs">
        <stat-chip v-if="stats" label="OG" :value="stats.og.toFixed(3)" />
        <stat-chip v-if="stats" label="ABV" :value="stats.abv.toFixed(1)" unit="%" />
        <stat-chip v-if="stats" label="IBU" :value="Math.round(stats.ibu)" />
        <stat-chip v-if="stats" label="EBC" :value="Math.round(stats.ebc)" />
      </div>

      <!-- Alertas -->
      <q-btn
        v-if="store.validations.length"
        flat round
        :icon="store.hasErrors ? 'error' : 'warning'"
        :color="store.hasErrors ? 'negative' : 'warning'"
        class="q-ml-sm"
      >
        <q-badge :color="store.hasErrors ? 'negative' : 'warning'" floating>
          {{ store.validations.length }}
        </q-badge>
        <q-tooltip>Ver alertas</q-tooltip>
        <q-menu dark>
          <q-list style="min-width: 280px; max-width: 380px">
            <q-item v-for="(v, i) in store.validations" :key="i">
              <q-item-section avatar>
                <q-icon
                  :name="v.severity === 'critical' ? 'error' : v.severity === 'warning' ? 'warning' : 'info'"
                  :color="v.severity === 'critical' ? 'negative' : v.severity === 'warning' ? 'warning' : 'info'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption">{{ v.message }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn
        color="primary"
        label="Salvar"
        unelevated
        class="q-ml-sm"
        :loading="store.saving"
        @click="save"
      />
    </q-toolbar>

    <!-- Abas do editor -->
    <q-tabs
      v-model="activeTab"
      dense
      class="bg-dark text-grey-5"
      active-color="amber"
      indicator-color="amber"
      align="left"
    >
      <q-tab name="design" label="Design" icon="tune" />
      <q-tab name="fermentables" label="Fermentáveis" icon="mdi-barley" />
      <q-tab name="hops" label="Lúpulos" icon="mdi-hops" />
      <q-tab name="yeast" label="Levedura" icon="mdi-flask" />
      <q-tab name="mash" label="Mostura" icon="mdi-thermometer" />
      <q-tab name="water" label="Água" icon="water_drop" />
      <q-tab name="misc" label="Outros" icon="add_circle_outline" />
      <q-tab name="notes" label="Notas" icon="notes" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="activeTab" animated class="bg-transparent">
      <!-- Design -->
      <q-tab-panel name="design" class="q-pa-md">
        <recipe-design-tab v-if="recipe" :recipe="recipe" :stats="stats" />
      </q-tab-panel>

      <!-- Fermentáveis -->
      <q-tab-panel name="fermentables" class="q-pa-md">
        <recipe-fermentables-tab v-if="recipe" :recipe="recipe" />
      </q-tab-panel>

      <!-- Lúpulos -->
      <q-tab-panel name="hops" class="q-pa-md">
        <recipe-hops-tab v-if="recipe" :recipe="recipe" :stats="stats" />
      </q-tab-panel>

      <!-- Levedura -->
      <q-tab-panel name="yeast" class="q-pa-md">
        <recipe-yeast-tab v-if="recipe" :recipe="recipe" :stats="stats" />
      </q-tab-panel>

      <!-- Mostura -->
      <q-tab-panel name="mash" class="q-pa-md">
        <recipe-mash-tab v-if="recipe" :recipe="recipe" />
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
        <recipe-misc-tab v-if="recipe" :recipe="recipe" />
      </q-tab-panel>

      <!-- Notas -->
      <q-tab-panel name="notes" class="q-pa-md">
        <q-input
          v-if="recipe"
          v-model="recipe.notes"
          type="textarea"
          label="Notas da receita"
          outlined
          dark
          autogrow
          placeholder="Histórico, observações, sugestões de melhoria..."
        />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useRecipeStore } from '../../stores/recipeStore'
import StatChip from '../../components/shared/StatChip.vue'
import RecipeDesignTab from '../../components/recipe/tabs/RecipeDesignTab.vue'
import RecipeFermentablesTab from '../../components/recipe/tabs/RecipeFermentablesTab.vue'
import RecipeHopsTab from '../../components/recipe/tabs/RecipeHopsTab.vue'
import RecipeYeastTab from '../../components/recipe/tabs/RecipeYeastTab.vue'
import RecipeMashTab from '../../components/recipe/tabs/RecipeMashTab.vue'
import RecipeMiscTab from '../../components/recipe/tabs/RecipeMiscTab.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useRecipeStore()

const activeTab = ref('design')
const recipe = computed(() => store.currentRecipe)
const stats = computed(() => store.stats)

onMounted(async () => {
  const id = route.params.id as string
  if (id && id !== 'new') {
    await store.loadRecipe(id)
  } else if (!store.currentRecipe) {
    store.newRecipe()
  }
})

async function save () {
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
