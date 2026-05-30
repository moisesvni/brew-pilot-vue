<template>
  <div class="bp-form-section q-mb-sm">
    <div class="row items-center no-wrap bp-form-section__title-row"
      :class="{ 'cursor-pointer': collapsible }"
      @click="collapsible && toggle()">
      <brew-pilot-label tag="div" class="bp-form-section__title col">
        {{ title }}
      </brew-pilot-label>
      <slot name="actions" />
      <q-btn
        v-if="collapsible"
        flat round dense size="xs"
        :icon="collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
        color="grey-5"
        @click.stop="toggle"
      />
    </div>
    <div v-show="!collapsed">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  collapsible?: boolean
  initialCollapsed?: boolean
}>(), {
  collapsible: false,
  initialCollapsed: false,
})

const collapsed = ref(props.initialCollapsed)
function toggle() { collapsed.value = !collapsed.value }
defineExpose({ collapsed, toggle })
</script>

<style scoped>
.bp-form-section {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 10px 12px 14px;
}

.bp-form-section__title-row {
  margin-bottom: 15px;
  gap: 4px;
}

.bp-form-section__title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0;
}
</style>
