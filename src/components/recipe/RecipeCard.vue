<template>
  <q-card dark class="recipe-card" clickable v-ripple>
    <!-- Cabeçalho do card -->
    <q-card-section class="q-pb-xs">
      <div class="row items-start justify-between">
        <div class="col">
          <div class="text-subtitle1 text-weight-bold ellipsis">{{ recipe.name }}</div>
          <div class="text-caption text-grey-5">
            {{ recipe.styleGuide?.name ?? 'Sem estilo' }}
            <q-badge color="grey-8" class="q-ml-xs">v{{ recipe.version }}</q-badge>
            <q-badge :color="typeColor" class="q-ml-xs">{{ typeLabel }}</q-badge>
          </div>
        </div>
        <q-btn flat round dense icon="more_vert" @click.stop>
          <q-menu dark>
            <q-list style="min-width: 160px">
              <q-item clickable v-close-popup @click="$emit('edit', recipe)">
                <q-item-section>Editar</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$emit('duplicate', recipe)">
                <q-item-section>Duplicar</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="$emit('delete', recipe)" class="text-negative">
                <q-item-section>Excluir</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-card-section>

    <!-- Stats principais -->
    <q-card-section class="q-pt-xs" @click="$emit('edit', recipe)">
      <div class="row q-gutter-sm justify-around text-center q-mb-sm">
        <stat-chip label="ABV" :value="abv" unit="%" />
        <stat-chip label="OG" :value="og" />
        <stat-chip label="IBU" :value="ibu" />
        <stat-chip label="EBC" :value="ebc" />
      </div>

      <!-- Barra de cor estimada -->
      <div class="row items-center q-gutter-xs">
        <div
          class="rounded-borders"
          style="width: 20px; height: 20px; border: 1px solid rgba(255,255,255,0.2)"
          :style="{ backgroundColor: ebcToHex(ebc) }"
        />
        <div class="text-caption text-grey-5">{{ recipe.batchVolume }}L · {{ recipe.boilTime}}min fervura</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe } from '../../types/recipe.types'
import { calculateRecipeStats } from '../../composables/useBrewCalculator'
import StatChip from '../shared/StatChip.vue'

const props = defineProps<{ recipe: Recipe }>()
defineEmits<{
  edit: [recipe: Recipe]
  duplicate: [recipe: Recipe]
  delete: [recipe: Recipe]
}>()

const stats = computed(() => calculateRecipeStats(props.recipe))
const abv = computed(() => stats.value.abv.toFixed(1))
const og = computed(() => stats.value.og.toFixed(3))
const ibu = computed(() => Math.round(stats.value.ibu))
const ebc = computed(() => Math.round(stats.value.ebc))

const typeColor = computed(() => ({
  AllGrain: 'amber-9', PartialMash: 'blue-9', Extract: 'teal-9'
}[props.recipe.type] ?? 'grey'))

const typeLabel = computed(() => ({
  AllGrain: 'All Grain', PartialMash: 'Parcial', Extract: 'Extrato'
}[props.recipe.type] ?? props.recipe.type))

// Converte EBC para cor HEX aproximada (para mostrar no chip de cor)
function ebcToHex (ebc: number): string {
  const srm = ebc / 1.97
  // Paleta SRM simplificada
  if (srm < 2) return '#F8F753'
  if (srm < 4) return '#F6F513'
  if (srm < 6) return '#ECE61A'
  if (srm < 8) return '#D5BC26'
  if (srm < 10) return '#BF9C26'
  if (srm < 13) return '#A07C2A'
  if (srm < 17) return '#8A5C28'
  if (srm < 20) return '#6A3C20'
  if (srm < 24) return '#4A2010'
  if (srm < 30) return '#2A1005'
  return '#0A0505'
}
</script>
