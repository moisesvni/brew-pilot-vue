<template>
  <q-markup-table flat dense class="mash-steps-table" separator="horizontal">
    <thead>
      <tr>
        <th class="text-left col-name">Etapa</th>
        <th class="text-right col-num">Temp.</th>
        <th class="text-right col-num">Tempo</th>
        <th v-if="hasRamps" class="text-left col-num">Rampa</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="s in steps" :key="s.id">
        <td class="text-left">
          <div class="row items-center no-wrap" style="gap: 6px">
            <q-icon :name="stepIcon(s.stepType)" :color="stepColor(s.stepType)" size="13px" />
            <span class="step-name ellipsis">{{ s.name || stepLabel(s.stepType) }}</span>
          </div>
        </td>
        <td class="text-right num-cell">{{ s.temperature }}°C</td>
        <td class="text-right num-cell">{{ s.time }}min</td>
        <td v-if="hasRamps" class="text-left num-cell ramp-cell">
          <span v-if="s.rampDuration">↗ {{ s.rampDuration }}min</span>
          <span v-else class="muted-dash">—</span>
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MashProfileStep } from '@/types/mash'
import type { MashStepType } from '@/types/recipe'

const props = defineProps<{ steps: MashProfileStep[] }>()

const hasRamps = computed(() => props.steps.some(s => (s.rampDuration ?? 0) > 0))

function stepColor(type: MashStepType) {
  return type === 'Infusion' ? 'blue-7' : type === 'Decoction' ? 'red-6' : 'orange-7'
}
function stepIcon(type: MashStepType) {
  return type === 'Infusion' ? 'mdi-water-plus' : type === 'Decoction' ? 'mdi-pot-steam-outline' : 'mdi-thermometer'
}
function stepLabel(type: MashStepType) {
  return type === 'Infusion' ? 'Infusão' : type === 'Decoction' ? 'Decocção' : 'Temp.'
}
</script>

<style scoped lang="scss">
.mash-steps-table {
  border-radius: 6px;
  font-size: 12px;

  /* ── Light mode — tons terrosos ─────────────────── */
  background: #fdf6ec !important;
  border: 1px solid #e8d5b7;

  thead tr th {
    background: #f5e6cc !important;
    color: #7a5c35;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 4px 8px;
    border-bottom: 1px solid #e0c89a !important;
  }

  tbody tr td {
    padding: 3px 8px;
    border-bottom: 1px solid #eedfc0 !important;
    color: #4e3b22;
    background: transparent;
  }

  tbody tr:last-child td {
    border-bottom: none !important;
  }

  tbody tr:hover td {
    background: rgba(193, 113, 14, 0.07) !important;
  }
}

/* ── Dark mode ───────────────────────────────────── */
.body--dark .mash-steps-table {
  background: color-mix(in srgb, #1e1e1e 80%, #2a2018) !important;
  border-color: rgba(255, 255, 255, 0.1);

  thead tr th {
    background: rgba(255, 255, 255, 0.05) !important;
    color: rgba(255, 255, 255, 0.5);
    border-bottom-color: rgba(255, 255, 255, 0.08) !important;
  }

  tbody tr td {
    border-bottom-color: rgba(255, 255, 255, 0.06) !important;
    color: rgba(255, 255, 255, 0.82);
  }

  tbody tr:hover td {
    background: rgba(255, 255, 255, 0.04) !important;
  }
}

.step-name {
  max-width: 120px;
  display: inline-block;
}

.num-cell {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.ramp-cell {
  color: #888;
  font-size: 11px;
}

.muted-dash {
  opacity: 0.35;
}

.col-name {
  width: 100%;
}

.col-num {
  width: 1%;
  white-space: nowrap;
}
</style>
