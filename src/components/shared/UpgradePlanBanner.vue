<template>
  <div class="upgrade-banner">
    <div class="row items-start no-wrap" style="gap: 12px">
      <q-icon :name="featureIcon" color="amber-6" size="28px" class="q-mt-xs" style="flex-shrink: 0" />

      <div class="col column" style="gap: 4px">
        <div class="upgrade-banner__title">
          <q-badge
            :label="requiredPlanLabel"
            :color="requiredPlan === 'Pro' ? 'primary' : 'orange-6'"
            class="upgrade-banner__badge" />
          {{ title }}
        </div>
        <div class="upgrade-banner__desc">{{ description }}</div>
      </div>

      <q-btn unelevated no-caps
        :color="requiredPlan === 'Pro' ? 'primary' : 'orange-7'"
        :label="`Assinar ${requiredPlanLabel}`"
        size="sm"
        class="upgrade-banner__btn"
        style="flex-shrink: 0; align-self: center"
        @click="emit('upgrade')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /**
   * Plano mínimo necessário: 'Plus' | 'Pro'
   */
  requiredPlan: 'Plus' | 'Pro'
  title: string
  description: string
  featureIcon?: string
}>()

const emit = defineEmits<{ 'upgrade': [] }>()

const requiredPlanLabel = computed(() =>
  props.requiredPlan === 'Pro' ? 'Pro' : 'Plus'
)
</script>

<style scoped>
.upgrade-banner {
  background: color-mix(in srgb, #c1710e 8%, transparent);
  border: 1px dashed color-mix(in srgb, #c1710e 40%, transparent);
  border-radius: 8px;
  padding: 10px 14px;
}

.upgrade-banner__badge {
  font-size: 9px;
  letter-spacing: 0.5px;
  margin-right: 6px;
  vertical-align: middle;
}

.upgrade-banner__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--bp-text-primary);
}

.upgrade-banner__desc {
  font-size: 11.5px;
  color: var(--bp-text-muted);
  line-height: 1.5;
}

.upgrade-banner__btn {
  white-space: nowrap;
}
</style>
