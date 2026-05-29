<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="loading"
    @update:model-value="!loading && emit('update:modelValue', $event)">
    <q-card :dark="$q.dark.isActive" class="brew-dialog-card" :style="cardStyle">
      <!-- Header -->
      <q-card-section
        class="row items-center no-wrap q-pb-sm brew-dialog-header"
        :style="scrollable ? 'flex-shrink:0' : ''">
        <q-icon v-if="icon" :name="icon" :color="iconColor" size="18px" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold" style="color: var(--bp-text-primary)">
          <slot name="title">{{ title }}</slot>
        </div>
        <q-space />
        <slot name="header-actions" />
        <q-btn flat round dense icon="close" :color="$q.dark.isActive ? 'grey-5' : 'grey-7'"
          :disable="loading"
          @click="emit('update:modelValue', false)" />
      </q-card-section>

      <q-separator :dark="$q.dark.isActive" />

      <!-- Body -->
      <div :class="{ 'brew-dialog-scroll': scrollable }">
        <slot />
      </div>

      <!-- Footer (optional) -->
      <template v-if="$slots.footer">
        <q-separator :dark="$q.dark.isActive" />
        <slot name="footer" />
      </template>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  icon?: string
  iconColor?: string
  width?: string
  scrollable?: boolean
  loading?: boolean
}>(), {
  width: '440px',
  iconColor: 'grey-5',
  scrollable: false,
  loading: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const cardStyle = computed(() => ({
  width: props.width,
  maxWidth: '95vw',
  ...(props.scrollable ? {
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column' as const
  } : {})
}))
</script>

<style scoped>
.brew-dialog-card {
  background: var(--bp-surface) !important;
  border: 1px solid var(--bp-border);
}

.brew-dialog-scroll {
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
}

.brew-dialog-header {
  background: var(--bp-surface-alt);
  border-bottom: 1px solid var(--bp-border);
}

</style>
