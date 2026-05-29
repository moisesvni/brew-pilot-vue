<template>
  <q-page class="q-pa-none">
    <!-- Toolbar da receita -->
    <q-toolbar class="bp-editor-toolbar bp-recipe-header q-py-sm" style="background: var(--bp-editor-header-bg); border-bottom: 1px solid var(--bp-border)">
      <q-btn flat round dense icon="arrow_back" @click="$router.push('/recipes')">
        <q-tooltip>Voltar para receitas</q-tooltip>
      </q-btn>
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

      <q-btn v-if="recipe" no-caps dense unelevated size="sm"
        class="version-chip q-ml-sm" :label="`V${recipe.version}`"
        @click="versionDialog = true">
        <q-tooltip>Versão da receita</q-tooltip>
      </q-btn>

      <!-- Alertas -->
      <recipe-validation-banner :items="store.validations" @open-style-dialog="styleDialog = true" />

      <brew-pilot-button variant="filled" color="primary" no-caps label="Salvar"
        unelevated class="q-ml-sm" icon="mdi-content-save" :loading="store.saving"
        tooltip="Salvar receita (Ctrl+S)" @click="save" />
    </q-toolbar>

    <!-- Abas do editor -->
    <q-tabs v-model="activeTab" dense class="recipe-editor-tabs" active-color="primary" indicator-color="primary"
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
          <q-input v-model="newTag" dense outlined placeholder="Nova tag..." style="max-width:200px"
            @keyup.enter="addTag" />
          <q-btn flat dense icon="add" color="primary" @click="addTag" :disable="!newTag.trim()" />
        </div>
      </q-tab-panel>

      <!-- Notas -->
      <q-tab-panel name="notes" class="q-pa-md">
        <q-input v-if="recipe" v-model="recipe.notes" type="textarea" label="Notas da receita" outlined autogrow
          placeholder="Histórico, observações, sugestões de melhoria..." />
      </q-tab-panel>
    </q-tab-panels>

    <!-- ── Dialog de seleção de estilo (acionado pelo banner) ──────────── -->
    <recipe-style-dialog v-model="styleDialog" />

    <!-- ── Dialog de versão ─────────────────────────────────────────────── -->
    <brew-pilot-dialog v-model="versionDialog" title="Versão da Receita"
      icon="mdi-source-branch" icon-color="primary" width="420px">

      <!-- ══ PLANO FREE ══ -->
      <div v-if="!isPro" class="column items-center q-pa-lg" style="gap: 14px">
        <q-icon name="mdi-crown" size="52px" style="color: #c1710e" />
        <div class="text-center">
          <div class="text-subtitle2 text-weight-bold q-mb-xs" style="color: var(--bp-text-primary)">
            Controle de versões é Pro
          </div>
          <div class="text-caption" style="color: var(--bp-text-secondary); line-height: 1.5">
            Registre cada iteração da sua receita e compare versões ao longo do tempo.
          </div>
        </div>
        <q-separator style="width: 100%; border-color: var(--bp-border)" />
        <div class="full-width column q-gutter-xs">
          <div v-for="f in versionProFeatures" :key="f" class="row items-center no-wrap" style="gap: 8px">
            <q-icon name="mdi-check-circle-outline" size="14px" style="color: #c1710e; flex-shrink: 0" />
            <span class="text-caption" style="color: var(--bp-text-primary)">{{ f }}</span>
          </div>
        </div>
        <q-btn unelevated no-caps color="primary" icon="mdi-crown" label="Assinar Plano Pro"
          class="full-width q-mt-xs" style="border-radius: 8px" />
        <span class="text-caption" style="color: var(--bp-text-secondary); cursor: pointer"
          @click="versionDialog = false">Continuar no plano Free</span>
      </div>

      <!-- ══ PLANO PRO ══ -->
      <div v-else class="q-pa-md column" style="gap: 16px">
        <!-- Versão atual -->
        <div class="row items-center no-wrap q-pa-sm rounded-borders"
          style="background: var(--bp-section-header-bg); border: 1px solid var(--bp-border); border-radius: 8px; gap: 12px">
          <q-icon name="mdi-source-branch" size="22px" style="color: #c1710e" />
          <div>
            <div class="text-caption" style="color: var(--bp-text-secondary)">Versão atual</div>
            <div class="text-subtitle2 text-weight-bold" style="color: var(--bp-text-primary)">
              V{{ recipe?.version }}
            </div>
          </div>
        </div>

        <!-- Ação: nova versão -->
        <div>
          <div class="text-caption q-mb-xs" style="color: var(--bp-text-secondary)">
            Gerar nova versão — incrementa o número e salva uma cópia com as alterações atuais.
          </div>
          <q-btn outline no-caps color="primary" icon="mdi-plus-circle-outline"
            :label="`Gerar V${(recipe?.version ?? 0) + 1}`"
            class="full-width" style="border-radius: 8px"
            @click="bumpVersion" />
        </div>

        <q-separator style="border-color: var(--bp-border)" />

        <!-- Editar número manualmente -->
        <div>
          <div class="text-caption q-mb-xs" style="color: var(--bp-text-secondary)">
            Ou defina manualmente:
          </div>
          <div class="row q-gutter-sm items-center">
            <q-input v-if="recipe" v-model.number="recipe.version" type="number"
              outlined dense label="Número da versão"
              style="flex: 1; min-width: 0" :min="1" />
            <q-btn unelevated no-caps color="primary" label="Confirmar"
              @click="versionDialog = false" />
          </div>
        </div>
      </div>

      <template #footer>
        <q-btn flat no-caps label="Fechar" color="grey-5" @click="versionDialog = false" />
      </template>
    </brew-pilot-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useRecipeStore } from '@/stores/recipeStore'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useRecipeStore()
const authStore = useAuthStore()

const isPro = computed(() => authStore.user?.plan === 'Pro')
const versionDialog = ref(false)
const styleDialog   = ref(false)

const versionProFeatures = [
  'Histórico completo de versões por receita',
  'Compare ingredientes e parâmetros entre versões',
  'Anote o que mudou em cada iteração',
  'Reverta para qualquer versão anterior',
]

function bumpVersion() {
  if (!recipe.value) return
  recipe.value.version = (recipe.value.version ?? 1) + 1
  versionDialog.value = false
}

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
