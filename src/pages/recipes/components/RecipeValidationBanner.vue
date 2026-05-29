<template>
  <brew-pilot-banner
    :items="bannerItems"
    error-label-singular="erro encontrado"
    error-label-plural="erros encontrados"
    warning-label-singular="aviso"
    warning-label-plural="avisos"
    @action-clicked="onActionClicked"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BrewPilotBanner, { type BannerItem } from '@/core/components/shared/BrewPilotBanner.vue'
import type { RecipeValidation } from '@/types/recipe'

const props = defineProps<{
  items: RecipeValidation[]
}>()

const emit = defineEmits<{ 'open-style-dialog': [] }>()

function onActionClicked(key: string | undefined) {
  if (key === 'open-style-dialog') emit('open-style-dialog')
}

const bannerItems = computed<BannerItem[]>(() =>
  props.items.map(v => ({
    severity: v.severity,
    message:  v.message,
    field:    v.field,
    ...(v.field === 'equipment' ? {
      featured: true,
      action: { label: 'Configurar Perfil de Equipamento', icon: 'mdi-tune-variant', route: '/profiles/equipment' },
    } : {}),
    ...(v.field === 'style' ? {
      featured: true,
      action: { label: 'Selecionar Estilo', icon: 'mdi-book-open-variant', emit: 'open-style-dialog' },
    } : {}),
  }))
)
</script>
