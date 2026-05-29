<template>
  <div class="bp-form-section q-mb-sm">
    <brew-pilot-label tag="div" class="bp-form-section__title">{{ title }}</brew-pilot-label>
    <slot />
  </div>
</template>

<script setup lang="ts">

defineProps<{ title: string }>()
</script>

<style scoped>
.bp-form-section {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 10px 12px 14px;
}

.bp-form-section__title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 15px;
}
</style>
