<template>
  <q-card flat bordered class="style-guide-card full-height">
    <q-card-section class="q-pa-sm">

      <!-- ── Cabeçalho (mesmo padrão do EquipmentCard) ── -->
      <div class="row items-center no-wrap q-mb-xs">
        <q-icon
          :name="recipe.styleGuide ? 'mdi-book-open-variant' : 'mdi-book-open-variant-outline'"
          size="22px" class="q-mr-xs flex-shrink-0"
          :style="{ color: 'var(--bp-text-secondary)' }"
        />
        <brew-pilot-label size="13px" class="col">
          {{ recipe.styleGuide
            ? `${recipe.styleGuide.code} ${recipe.styleGuide.name}`
            : 'Nenhum estilo selecionado' }}
        </brew-pilot-label>
        <div class="row flex-shrink-0">
          <brew-pilot-button round outline dense primary
            :icon="recipe.styleGuide ? 'mdi-swap-horizontal' : 'mdi-plus'" size="md"
            @click="styleDialog = true">
            <q-tooltip>{{ recipe.styleGuide ? 'Alterar estilo' : 'Selecionar estilo' }}</q-tooltip>
          </brew-pilot-button>
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
      <div v-else class="column items-center q-py-sm q-gutter-xs text-center">
        <q-icon name="mdi-book-open-variant-outline" size="32px" color="grey-5" />
        <brew-pilot-label variant="primary" size="12px" class="text-weight-medium">
          Nenhum estilo selecionado
        </brew-pilot-label>
        <brew-pilot-label variant="muted" size="11px">
          Selecione um estilo para comparar ABV, OG, FG, EBC e IBU da receita.
        </brew-pilot-label>
      </div>

    </q-card-section>

    <!-- dialog de seleção de estilo (auto-contido) -->
    <recipe-style-dialog v-model="styleDialog" />
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats  = computed(() => store.stats)

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
