<template>
  <div :class="['mp-card', profile.isDefault && 'mp-card--default']">

    <!-- ─ Cabeçalho ───────────────────────────────────────── -->
    <div class="row items-start no-wrap q-mb-xs" style="gap: 8px">

      <!-- Ícone esquerdo -->
      <div v-if="profile.isDefault" class="mp-default-icon-wrap" style="flex-shrink: 0; margin-top: 1px">
        <q-icon name="mdi-star" color="amber-7" size="16px" />
      </div>
      <q-icon v-else name="mdi-thermometer" color="red-4" size="18px" style="margin-top: 2px; flex-shrink: 0" />

      <!-- Info -->
      <div class="col" style="min-width: 0">
        <!-- Nome + badges + stats inline -->
        <div class="row items-center no-wrap" style="gap: 6px; flex-wrap: wrap">
          <span class="text-subtitle2 text-weight-bold ellipsis" style="color: var(--bp-text-primary); flex-shrink: 1; min-width: 0">
            {{ profile.name }}
          </span>
          <q-badge v-if="profile.biab" color="blue-7" label="BIAB" />
          <q-badge v-if="profile.batchSparge" color="teal-6" label="Batch Sparge" />
          <span class="meta-sep" aria-hidden="true">·</span>
          <span class="meta-chip"><q-icon name="mdi-stairs" size="10px" />{{ profile.steps.length }} etapas</span>
          <span class="meta-chip"><q-icon name="mdi-format-list-numbered" size="10px" />{{ totalTime }}min</span>
          <span class="meta-chip"><q-icon name="mdi-thermometer" size="10px" />{{ tempRange }}</span>
          <span v-if="totalRamp > 0" class="meta-chip meta-chip--ramp"><q-icon name="mdi-trending-up" size="10px" />{{ stepsWithRamp }} rampas · {{ totalRamp }}min</span>
        </div>
      </div>

      <!-- Ações -->
      <div class="row no-wrap q-gutter-xs" style="flex-shrink: 0">
        <template v-if="profile.isDefault">
          <q-btn flat round dense size="sm" icon="mdi-star-off" color="amber-6" @click="$emit('remove-default', profile)">
            <q-tooltip>Remover como padrão</q-tooltip>
          </q-btn>
        </template>
        <template v-else>
          <q-btn flat round dense size="sm" icon="mdi-star-outline" color="grey-5" @click="$emit('set-default', profile)">
            <q-tooltip>Definir como padrão</q-tooltip>
          </q-btn>
        </template>
        <q-btn flat round dense size="sm" icon="mdi-pencil" color="grey-5" @click="$emit('edit', profile)">
          <q-tooltip>Editar</q-tooltip>
        </q-btn>
        <q-btn flat round dense size="sm" icon="mdi-content-copy" color="grey-5"
          :disable="!canDuplicate" @click="$emit('duplicate', profile)">
          <q-tooltip>{{ canDuplicate ? 'Duplicar' : 'Limite atingido' }}</q-tooltip>
        </q-btn>
        <q-btn flat round dense size="sm" icon="mdi-delete" color="negative" @click="$emit('delete', profile)">
          <q-tooltip>Excluir</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- ─ Corpo: etapas + gráfico ────────────────────────────── -->
    <div class="row q-col-gutter-md items-center q-mt-xs">
      <div class="col-5">
        <mash-steps-table :steps="profile.steps" />
      </div>
      <div v-if="profile.steps.length" class="col-7" style="min-width: 0">
        <mash-temp-chart-compact :steps="profile.steps" :height="chartHeight" />
      </div>
    </div>

    <!-- Notas -->
    <div v-if="profile.notes" class="text-caption text-italic q-mt-xs" style="color: var(--bp-text-secondary)">
      {{ profile.notes }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MashProfile } from '@/types/mash'
import MashStepsTable from './MashStepsTable.vue'
import MashTempChartCompact from './MashTempChartCompact.vue'

const props = defineProps<{
  profile: MashProfile
  canDuplicate: boolean
}>()

defineEmits<{
  edit: [p: MashProfile]
  delete: [p: MashProfile]
  duplicate: [p: MashProfile]
  'set-default': [p: MashProfile]
  'remove-default': [p: MashProfile]
}>()

const totalTime = computed(() => props.profile.steps.reduce((s, st) => s + (st.time ?? 0), 0))
const totalRamp = computed(() => props.profile.steps.reduce((s, st) => s + (st.rampDuration ?? 0), 0))
const stepsWithRamp = computed(() => props.profile.steps.filter(st => (st.rampDuration ?? 0) > 0).length)

// Altura do gráfico sincronizada com a tabela de etapas
// header (~26px) + cada linha (~26px) — mínimo 75px
const chartHeight = computed(() => Math.max(75, props.profile.steps.length * 26))

const tempRange = computed(() => {
  if (!props.profile.steps.length) return '—'
  const temps = props.profile.steps.map(s => s.temperature)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  return min === max ? `${min} °C` : `${min}–${max} °C`
})
</script>

<style scoped>
.mp-card {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 10px;
  padding: 12px 14px;
  transition: border-color 0.15s;
}
.mp-card:hover {
  border-color: color-mix(in srgb, var(--q-primary) 35%, transparent);
}

/* ── Card padrão — destaque âmbar ── */
.mp-card--default {
  border-left: 3px solid #f59e0b;
  border-color: color-mix(in srgb, #f59e0b 45%, var(--bp-border));
  background: color-mix(in srgb, #f59e0b 5%, var(--bp-surface-alt));
}
.mp-card--default:hover {
  border-color: color-mix(in srgb, #f59e0b 70%, transparent);
}

.mp-default-icon-wrap {
  background: color-mix(in srgb, #f59e0b 15%, transparent);
  border-radius: 6px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meta-sep {
  color: var(--bp-text-muted);
  opacity: 0.4;
  font-size: 12px;
  user-select: none;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  padding: 1px 7px;
  border-radius: 99px;
  background: color-mix(in srgb, #a0622a 12%, transparent);
  color: #7a4a1e;
  border: 1px solid color-mix(in srgb, #a0622a 22%, transparent);
}

.meta-chip--ramp {
  background: color-mix(in srgb, #c1710e 10%, transparent);
  color: #9a5510;
  border-color: color-mix(in srgb, #c1710e 25%, transparent);
}

.body--dark .meta-chip {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.55);
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .meta-chip--ramp {
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  color: #f0b855;
  border-color: color-mix(in srgb, #f59e0b 25%, transparent);
}
</style>
