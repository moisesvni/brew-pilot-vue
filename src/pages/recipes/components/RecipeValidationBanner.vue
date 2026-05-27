<template>
  <brew-pilot-banner
    :items="bannerItems"
    error-label-singular="erro encontrado"
    error-label-plural="erros encontrados"
    warning-label-singular="aviso"
    warning-label-plural="avisos"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BrewPilotBanner, { type BannerItem } from '../../../components/shared/BrewPilotBanner.vue'
import type { RecipeValidation } from '../../../types/recipe'

const props = defineProps<{
  items: RecipeValidation[]
}>()

const bannerItems = computed<BannerItem[]>(() =>
  props.items.map(v => ({
    severity: v.severity,
    message:  v.message,
    field:    v.field,
  }))
)
</script>
