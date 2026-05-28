<template>
  <q-select
    v-bind="$attrs"
    :dark="$q.dark.isActive"
    :popup-content-class="$q.dark.isActive ? 'bp-select-popup--dark' : 'bp-select-popup--light'"
    class="bp-select"
    outlined
    dense
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'

defineOptions({ inheritAttrs: false })
const $q = useQuasar()
const dark = computed(() => $q.dark.isActive)
const iconColor = computed(() => dark.value ? 'rgba(255,255,255,0.55)' : '#705C3A')
const iconHoverColor = computed(() => dark.value ? 'rgba(255,255,255,0.87)' : '#2B1A06')
</script>

<style scoped>
/* Fundo adaptativo */
.bp-select :deep(.q-field__control) {
  background: var(--bp-surface-alt) !important;
}

/* Borda do tema */
.bp-select :deep(.q-field__control:before) {
  border-color: var(--bp-border) !important;
}
.bp-select :deep(.q-field__control:hover:before) {
  border-color: rgba(193, 113, 14, 0.45) !important;
}
.bp-select :deep(.q-field__control.q-field__control--focused:before) {
  border-color: #c1710e !important;
}

/* Label e texto da seleção */
.bp-select :deep(.q-field__label) {
  color: var(--bp-text-secondary) !important;
}
.bp-select :deep(.q-field__native),
.bp-select :deep(.q-field__input),
.bp-select :deep(.q-select__dropdown-icon) {
  color: var(--bp-text-primary) !important;
}

/* Chip selecionado */
.bp-select :deep(.q-chip) {
  background: rgba(193, 113, 14, 0.12);
  color: var(--bp-text-primary);
}

/* Ícones do campo (clear × e dropdown ▼) via v-bind para garantir reatividade */
.bp-select :deep(.q-field__append .q-icon),
.bp-select :deep(.q-field__prepend .q-icon),
.bp-select :deep(.q-select__dropdown-icon) {
  color: v-bind(iconColor) !important;
}
.bp-select :deep(.q-field__append .q-icon:hover) {
  color: v-bind(iconHoverColor) !important;
}
</style>
