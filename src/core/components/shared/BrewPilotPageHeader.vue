<template>
  <div class="bp-ph" :class="bleed ? 'bp-ph--bleed' : 'bp-ph--flush'">
    <div class="row items-center no-wrap" style="gap: 10px; min-height: 40px">
      <q-icon :name="icon" :color="iconColor" size="22px" style="flex-shrink: 0" />
      <div class="bp-ph__title">{{ title }}</div>
      <q-chip v-if="chip" dense color="transparent" class="bp-ph__chip q-ml-sm">
        {{ chip }}
      </q-chip>
      <q-space />
      <slot name="actions" />
    </div>
    <div v-if="subtitle" class="bp-ph__subtitle q-mt-xs q-ml-xs" style="padding-left: 32px">
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  iconColor?: string
  title: string
  chip?: string
  subtitle?: string
  bleed?: boolean
}>(), {
  iconColor: 'primary',
  bleed: true,
})
</script>

<style scoped>
.bp-ph {
  background: var(--bp-surface-alt);
  border-bottom: 1px solid var(--bp-border);
  padding: 14px 20px;
  margin-bottom: 20px;
}

/* usado em q-page com q-pa-md (16px) — sangra até as bordas do card */
.bp-ph--bleed {
  margin-top: -16px;
  margin-left: -16px;
  margin-right: -16px;
  border-radius: 4px 4px 0 0;
}

/* usado em páginas sem padding (profiles-page etc.) */
.bp-ph--flush {
  margin: 0;
}

.bp-ph__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--bp-text-primary);
  white-space: nowrap;
}

.bp-ph__chip {
  border: 1px solid var(--bp-border);
  font-size: 11px;
  color: var(--bp-text-secondary);
  height: 20px;
  padding: 0 8px;
}

.bp-ph__subtitle {
  font-size: 12px;
  color: var(--bp-text-secondary);
}
</style>
