<template>
  <q-btn
    v-if="items.length"
    flat round
    :icon="hasErrors ? 'mdi-alert-circle' : 'mdi-alert'"
    :color="hasErrors ? 'negative' : 'warning'"
    class="q-ml-xs"
  >
    <!-- Contador de alertas -->
    <q-badge :color="hasErrors ? 'negative' : 'warning'" floating>
      {{ items.length }}
    </q-badge>
    <q-tooltip class="bp-tooltip">Ver alertas</q-tooltip>

    <!-- Menu popup temático -->
    <q-menu :class="menuClass" style="min-width: 380px; max-width: 560px">

      <!-- ── Cabeçalho ── -->
      <div class="bp-banner__header">
        <q-icon
          :name="hasErrors ? 'mdi-alert-circle' : 'mdi-alert'"
          :style="{ color: hasErrors ? severityColor('critical') : severityColor('warning') }"
          size="15px"
        />
        <span>
          {{ items.length }}
          {{ headerLabel }}
        </span>
      </div>
      <q-separator style="border-color: var(--bp-border)" />

      <!-- ── Lista de itens ── -->
      <div
        v-for="(item, i) in items"
        :key="i"
        class="bp-banner__item"
      >
        <q-icon
          :name="severityIcon(item.severity)"
          :style="{ color: severityColor(item.severity) }"
          size="18px"
          class="bp-banner__item-icon"
        />
        <div class="bp-banner__item-body">
          <span class="bp-banner__msg">{{ item.message }}</span>
          <span v-if="item.field" class="bp-banner__field">{{ item.field }}</span>
          <span class="bp-banner__chip" :class="`bp-banner__chip--${item.severity}`">
            {{ severityLabel(item.severity) }}
          </span>
        </div>
      </div>

    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'

// ── Tipo genérico exportável ───────────────────────────────────────────────
export interface BannerItem {
  severity: 'critical' | 'warning' | 'suggestion'
  message: string
  field?: string
}

const props = defineProps<{
  items: BannerItem[]
  /** Rótulo no cabeçalho quando há erros (singular) */
  errorLabelSingular?: string
  /** Rótulo no cabeçalho quando há erros (plural) */
  errorLabelPlural?: string
  /** Rótulo no cabeçalho quando só há avisos (singular) */
  warningLabelSingular?: string
  /** Rótulo no cabeçalho quando só há avisos (plural) */
  warningLabelPlural?: string
}>()

const $q = useQuasar()
const dark = computed(() => $q.dark.isActive)

const hasErrors = computed(() => props.items.some(i => i.severity === 'critical'))

const menuClass = computed(() =>
  dark.value ? 'bp-banner-menu bp-banner-menu--dark' : 'bp-banner-menu bp-banner-menu--light')

const headerLabel = computed(() => {
  const n = props.items.length
  if (hasErrors.value) {
    return n === 1
      ? (props.errorLabelSingular ?? 'erro encontrado')
      : (props.errorLabelPlural   ?? 'erros encontrados')
  }
  return n === 1
    ? (props.warningLabelSingular ?? 'aviso')
    : (props.warningLabelPlural   ?? 'avisos')
})

// ── Mapeamentos de severidade ──────────────────────────────────────────────
const severityIcon = (s: BannerItem['severity']) =>
  s === 'critical'  ? 'mdi-alert-circle'
  : s === 'warning' ? 'mdi-alert'
  : 'mdi-information-outline'

const severityLabel = (s: BannerItem['severity']) =>
  s === 'critical' ? 'Erro' : s === 'warning' ? 'Aviso' : 'Sugestão'

const severityColor = (s: BannerItem['severity']) => {
  const d = dark.value
  if (s === 'critical') return d ? '#ff9090' : '#9B1C1C'
  if (s === 'warning')  return d ? '#ffd860' : '#7B5000'
  return d ? 'rgba(255,255,255,0.55)' : 'var(--bp-text-secondary)'
}
</script>
