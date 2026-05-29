<template>
  <q-input
    v-bind="$attrs"
    outlined
    dense
    class="bp-input"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'

defineOptions({ inheritAttrs: false })

const $q = useQuasar()
const dark = computed(() => $q.dark.isActive)
const labelColor = computed(() =>
  dark.value ? 'rgba(255,255,255,0.70)' : '#705C3A'
)
const labelFocusColor = computed(() =>
  dark.value ? 'rgba(255,255,255,0.87)' : '#c1710e'
)
</script>

<style scoped>
/* Fundo adaptativo */
.bp-input :deep(.q-field__control) {
  background: var(--bp-surface-alt) !important;
}

/* Borda default */
.bp-input :deep(.q-field__control:before) {
  border-color: var(--bp-border) !important;
}

/* Borda hover */
.bp-input :deep(.q-field__control:hover:before) {
  border-color: rgba(193, 113, 14, 0.45) !important;
}

/* Borda focused */
.bp-input :deep(.q-field--focused .q-field__control:after) {
  border-color: #c1710e !important;
}

/* Label default */
.bp-input :deep(.q-field__label) {
  color: v-bind(labelColor) !important;
}

/* Label focused */
.bp-input :deep(.q-field--focused .q-field__label) {
  color: v-bind(labelFocusColor) !important;
}

/* Texto do input */
.bp-input :deep(.q-field__native),
.bp-input :deep(.q-field__input) {
  color: var(--bp-text-primary) !important;
}

/* Suffix / prefix text */
.bp-input :deep(.q-field__suffix),
.bp-input :deep(.q-field__prefix) {
  color: v-bind(labelColor) !important;
}

/* Ícones internos (clear, etc.) */
.bp-input :deep(.q-field__append .q-icon),
.bp-input :deep(.q-field__prepend .q-icon) {
  color: v-bind(labelColor) !important;
}

/* Campo desabilitado */
.bp-input :deep(.q-field--disabled .q-field__control:before) {
  border-color: var(--bp-border) !important;
  border-style: dashed !important;
}
.bp-input :deep(.q-field--disabled .q-field__label),
.bp-input :deep(.q-field--disabled .q-field__native) {
  color: var(--bp-text-muted) !important;
}
</style>
