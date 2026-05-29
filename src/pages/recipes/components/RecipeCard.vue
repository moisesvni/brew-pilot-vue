<template>
  <q-card dark class="recipe-card" clickable v-ripple @click="$emit('edit', recipe)">
    <!-- Swatch de cor / imagem -->
    <div class="recipe-card-image" :style="{ backgroundColor: ebcToHex(ebc) }">
      <img
        v-if="recipe.imageUrl"
        :src="recipe.imageUrl"
        class="fit"
        style="object-fit:cover"
        referrerpolicy="no-referrer"
      />
      <div v-else class="full-height column items-center justify-end q-pb-xs">
        <q-icon name="mdi-beer" size="28px" color="white" style="opacity:.45" />
      </div>
      <!-- Badge de tipo -->
      <q-badge
        :color="typeColor"
        class="absolute-top-right q-ma-xs"
        style="font-size:.6rem"
      >
        {{ typeLabel }}
      </q-badge>
    </div>

    <!-- Conteúdo -->
    <q-card-section class="q-pb-xs">
      <div class="row items-start no-wrap">
        <div class="col overflow-hidden">
          <div class="text-subtitle2 text-weight-bold ellipsis text-white">{{ recipe.name }}</div>
          <div class="text-caption text-grey-5 ellipsis">
            {{ recipe.styleGuide?.name ?? 'Sem estilo' }}
          </div>
          <div v-if="recipe.equipmentProfile" class="text-caption text-grey-7 ellipsis q-mt-xs">
            <q-icon name="mdi-kettle" size="11px" class="q-mr-xs" />{{ recipe.equipmentProfile.name }}
          </div>
        </div>
        <q-btn flat round dense icon="more_vert" size="sm" @click.stop class="q-ml-xs">
          <q-menu dark>
            <q-list style="min-width: 160px">
              <q-item clickable v-close-popup @click="$emit('edit', recipe)">
                <q-item-section><q-item-label>Editar</q-item-label></q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="$emit('duplicate', recipe)">
                <q-item-section><q-item-label>Duplicar</q-item-label></q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="$emit('delete', recipe)" class="text-negative">
                <q-item-section><q-item-label>Excluir</q-item-label></q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-card-section>

    <!-- Stats -->
    <q-card-section class="q-pt-xs q-pb-sm">
      <div class="row q-gutter-xs justify-between">
        <stat-chip label="ABV" :value="abv" unit="%" />
        <stat-chip label="OG"  :value="og" />
        <stat-chip label="IBU" :value="String(ibu)" />
        <stat-chip label="EBC" :value="String(ebc)" />
      </div>

      <!-- Barra de cor e info do lote -->
      <div class="row items-center q-gutter-xs q-mt-sm">
        <div
          class="rounded-borders"
          style="width:18px;height:18px;border:1px solid rgba(255,255,255,.15);flex-shrink:0"
          :style="{ backgroundColor: ebcToHex(ebc) }"
        />
        <div class="text-caption text-grey-6">
          {{ recipe.batchVolume }}L · {{ recipe.boilTime }}min
        </div>
        <q-space />
        <q-badge color="grey-9" style="font-size:.58rem">v{{ recipe.version }}</q-badge>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe } from '@/types/recipe'
import { calculateRecipeStats } from '@/composables/useBrewCalculator'
import { ebcToHex } from '@/core/utils/brewColors'

const props = defineProps<{ recipe: Recipe }>()
defineEmits<{
  edit: [recipe: Recipe]
  duplicate: [recipe: Recipe]
  delete: [recipe: Recipe]
}>()

const stats   = computed(() => calculateRecipeStats(props.recipe))
const abv     = computed(() => stats.value.abv.toFixed(1))
const og      = computed(() => stats.value.og.toFixed(3))
const ibu     = computed(() => Math.round(stats.value.ibu))
const ebc     = computed(() => Math.round(stats.value.ebc))

const typeColor = computed(() => ({
  AllGrain: 'amber-9', PartialMash: 'blue-9', Extract: 'teal-9'
}[props.recipe.type] ?? 'grey'))

const typeLabel = computed(() => ({
  AllGrain: 'All Grain', PartialMash: 'Parcial', Extract: 'Extrato'
}[props.recipe.type] ?? props.recipe.type))

</script>

<style scoped>
.recipe-card {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
}

.recipe-card-image {
  position: relative;
  height: 80px;
  overflow: hidden;
}
</style>
