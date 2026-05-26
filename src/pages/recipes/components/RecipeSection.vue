<template>
  <div class="recipe-section q-mb-sm">
    <!-- Header clicável -->
    <div class="section-header row items-center no-wrap q-px-md q-py-sm cursor-pointer" @click="isOpen = !isOpen">
      <q-icon :name="icon" :color="iconColor ?? 'primary'" size="18px" class="q-mr-sm" />
      <span class="text-body2 text-weight-bold bp-section-title">{{ title }}</span>
      <q-badge v-if="badge" color="grey-9" class="q-ml-sm text-grey-4" style="font-size:0.65rem">
        {{ badge }}
      </q-badge>
      <q-space />
      <!-- Slot para botões de ação (para com @click.stop nos botões internos) -->
      <div class="row items-center q-gutter-sm">
        <slot name="actions" />
      </div>
      <q-btn
        :icon="isOpen ? 'expand_less' : 'expand_more'"
        color="white"
        dense
        round
        size="14px"
        flat
        class="q-ml-sm"
      >
        <q-tooltip>{{ isOpen ? 'Fechar seção' : 'Abrir seção' }}</q-tooltip>
      </q-btn>
    </div>
    <!-- Conteúdo expansível -->
    <transition name="section-slide">
      <div v-show="isOpen" class="section-body">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  icon: string
  badge?: string
  iconColor?: string
  defaultOpen?: boolean
}>(), {
  defaultOpen: true
})

const isOpen = ref(props.defaultOpen)
</script>

<style scoped>
.recipe-section {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--bp-section-border, rgba(255, 255, 255, 0.07));
}

.section-header {
  background: var(--bp-section-header-bg, rgba(255, 255, 255, 0.05));
  user-select: none;
  transition: background 0.15s;
}

.section-header:hover {
  background: var(--bp-section-header-hover, rgba(255, 255, 255, 0.09));
}

.section-body {
  background: var(--bp-section-body-bg, rgba(0, 0, 0, 0.15));
  padding: 12px;
}

.section-slide-enter-active,
.section-slide-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
}

.section-slide-enter-from,
.section-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.section-slide-enter-to,
.section-slide-leave-from {
  max-height: 2000px;
  opacity: 1;
}
</style>
