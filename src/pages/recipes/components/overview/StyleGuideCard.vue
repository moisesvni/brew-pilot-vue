<template>
  <q-card flat bordered class="style-guide-card full-height">
    <q-card-section class="q-pa-sm">

      <!-- ── Cabeçalho (mesmo padrão do EquipmentCard) ── -->
      <div class="row items-center no-wrap q-mb-xs">
        <q-icon
          :name="recipe.styleGuide ? 'mdi-book-open-variant' : 'mdi-book-open-variant-outline'"
          size="22px" class="q-mr-xs flex-shrink-0"
          :style="{ color: bookIconColor }"
        />
        <span class="text-caption text-weight-bold ellipsis col" :style="{ color: labelColor }">
          {{ recipe.styleGuide
            ? `${recipe.styleGuide.code} ${recipe.styleGuide.name}`
            : 'Nenhum estilo selecionado' }}
        </span>
        <div class="row flex-shrink-0">
          <q-btn round outline dense icon="mdi-pencil" color="grey-5" size="md"
            @click="styleDialog = true">
            <q-tooltip>Alterar estilo</q-tooltip>
          </q-btn>
        </div>
      </div>
      <q-separator class="q-mb-xs" />

      <!-- ── Barras de range ── -->
      <template v-if="stats && recipe.styleGuide">
        <recipe-style-range-bar
          label="ABV" :current="stats.abv"
          :min="recipe.styleGuide.abvMin" :max="recipe.styleGuide.abvMax" :decimals="1"
        />
        <recipe-style-range-bar
          label="OG" :current="stats.og"
          :min="recipe.styleGuide.ogMin" :max="recipe.styleGuide.ogMax" :decimals="3"
        />
        <recipe-style-range-bar
          label="FG" :current="stats.fg"
          :min="recipe.styleGuide.fgMin" :max="recipe.styleGuide.fgMax" :decimals="3"
        />
        <recipe-style-range-bar
          label="EBC" :current="stats.ebc"
          :min="recipe.styleGuide.ebcMin" :max="recipe.styleGuide.ebcMax" :decimals="1"
        />
        <recipe-style-range-bar
          label="IBU" :current="stats.ibu"
          :min="recipe.styleGuide.ibuMin" :max="recipe.styleGuide.ibuMax" :decimals="0"
        />
        <recipe-style-range-bar
          label="BU/GU" :current="stats.buGuRatio"
          :min="buguMin" :max="buguMax" :decimals="2"
        />
      </template>

      <!-- ── Sem estilo ── -->
      <div v-else class="column items-center q-py-md" style="gap: 6px">
        <q-icon name="mdi-chart-bar" size="32px" :style="{ color: 'var(--bp-text-muted)' }" />
        <span class="text-caption" style="color: var(--bp-text-secondary)">
          Selecione um estilo para ver a comparação
        </span>
      </div>

    </q-card-section>

    <!-- dialog de seleção de estilo (auto-contido) -->
    <recipe-style-dialog v-model="styleDialog" />
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRecipeStore } from '@/stores/recipeStore'
import RecipeStyleRangeBar from '../RecipeStyleRangeBar.vue'
import RecipeStyleDialog from './dialogs/RecipeStyleDialog.vue'

const $q    = useQuasar()
const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats  = computed(() => store.stats)

// Ícone do livro — 2 cores no light, 2 cores no dark
const bookIconColor = computed(() => {
  const hasStyle = !!recipe.value.styleGuide
  if ($q.dark.isActive) {
    return hasStyle ? '#6fcf6f' : 'rgba(255,255,255,0.28)'  // dark: verde / muted
  } else {
    return hasStyle ? '#c1710e' : 'rgba(43,26,6,0.28)'      // light: marrom / muted
  }
})

const labelColor = computed(() => {
  const hasStyle = !!recipe.value.styleGuide
  if ($q.dark.isActive) {
    return hasStyle ? 'var(--bp-text-primary)' : 'rgba(255,255,255,0.38)'
  } else {
    return hasStyle ? 'var(--bp-text-primary)' : 'rgba(43,26,6,0.40)'
  }
})

const styleDialog = ref(false)

const buguMin = computed(() => {
  const s = recipe.value.styleGuide
  if (!s) return 0
  return Number((s.ibuMin / ((s.ogMin - 1) * 1000)).toFixed(2))
})
const buguMax = computed(() => {
  const s = recipe.value.styleGuide
  if (!s) return 0
  return Number((s.ibuMax / ((s.ogMax - 1) * 1000)).toFixed(2))
})
</script>

<style scoped>
.style-guide-card {
  background: var(--bp-card-bg) !important;
  border-color: var(--bp-card-border) !important;
}
</style>
