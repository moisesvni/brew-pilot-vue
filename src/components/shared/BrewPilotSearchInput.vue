<template>
  <q-input
    class="theme-search"
    v-bind="$attrs"
    :model-value="modelValue"
    outlined dense
    :placeholder="placeholder"
    clearable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prepend>
      <q-icon name="search" :style="{ color: 'var(--bp-text-secondary)' }" />
    </template>
    <template #append>
      <q-spinner v-if="loading" :color="spinnerColor ?? 'primary'" size="18px" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  loading?: boolean
  spinnerColor?: string
}>(), {
  placeholder: 'Buscar...',
  loading: false,
})

defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<style scoped>
/* Fundo adaptativo: warm off-white no light, surface-alt no dark */
.theme-search :deep(.q-field__control) {
  background: var(--bp-surface-alt) !important;
}

/* Borda usando a cor do tema */
.theme-search :deep(.q-field__control:before) {
  border-color: var(--bp-border) !important;
}

.theme-search :deep(.q-field__control:hover:before) {
  border-color: rgba(193, 113, 14, 0.45) !important;
}

.theme-search :deep(.q-field__control.q-field__control--focused:before) {
  border-color: #c1710e !important;
}

/* Placeholder e texto digitado no tom correto */
.theme-search :deep(input::placeholder) {
  color: var(--bp-text-muted);
}

.theme-search :deep(input) {
  color: var(--bp-text-primary);
}
</style>
