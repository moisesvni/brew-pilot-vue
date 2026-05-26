<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)">
    <q-card dark class="bg-dark" :style="cardStyle">
      <!-- Header -->
      <q-card-section
        class="row items-center no-wrap q-pb-sm"
        :style="scrollable ? 'flex-shrink:0' : ''">
        <q-icon v-if="icon" :name="icon" :color="iconColor" size="18px" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold text-white">
          <slot name="title">{{ title }}</slot>
        </div>
        <q-space />
        <slot name="header-actions" />
        <q-btn flat round dense icon="close" color="grey-5" @click="emit('update:modelValue', false)" />
      </q-card-section>

      <q-separator dark />

      <!-- Body -->
      <div :class="{ 'brew-dialog-scroll': scrollable }">
        <slot />
      </div>

      <!-- Footer (optional) -->
      <template v-if="$slots.footer">
        <q-separator dark />
        <slot name="footer" />
      </template>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  icon?: string
  iconColor?: string
  width?: string
  scrollable?: boolean
}>(), {
  width: '440px',
  iconColor: 'grey-5',
  scrollable: false
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
.brew-dialog-scroll {
  overflow-y: auto;
  flex: 1 1 0;
  min-height: 0;
}
</style>
