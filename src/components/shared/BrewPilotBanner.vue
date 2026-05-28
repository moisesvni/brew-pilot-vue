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
    <q-menu :class="menuClass"
      anchor="bottom right" self="top right"
      :style="{ minWidth: '440px', maxWidth: '600px' }">

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

      <!-- ── Itens destacados (featured) ── -->
      <div
        v-for="(item, i) in featuredItems"
        :key="'f'+i"
        class="bp-banner__featured"
        :class="`bp-banner__featured--${item.severity}`"
      >
        <div class="bp-banner__featured-header">
          <q-icon
            :name="severityIcon(item.severity)"
            :style="{ color: severityColor(item.severity) }"
            size="26px"
          />
          <div class="bp-banner__featured-body">
            <span class="bp-banner__featured-msg">{{ item.message }}</span>
            <span class="bp-banner__chip" :class="`bp-banner__chip--${item.severity}`">
              {{ severityLabel(item.severity) }}
            </span>
          </div>
        </div>
        <q-btn v-if="item.action" dense unelevated no-caps
          :icon="item.action.icon" :label="item.action.label"
          class="bp-banner__featured-action q-mt-sm"
          :class="`bp-banner__featured-action--${item.severity}`"
          @click="router.push(item.action.route)"
        />
      </div>
      <q-separator v-if="featuredItems.length && normalItems.length" style="border-color: var(--bp-border)" />

      <!-- ── Itens normais ── -->
      <div
        v-for="(item, i) in normalItems"
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
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

// ── Tipo genérico exportável ───────────────────────────────────────────────
export interface BannerItem {
  severity: 'critical' | 'warning' | 'suggestion'
  message: string
  field?: string
  /** Exibe este item com destaque visual acima dos demais */
  featured?: boolean
  /** Botão de ação exibido apenas em itens featured */
  action?: { label: string; icon?: string; route: string }
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
const router = useRouter()
const dark = computed(() => $q.dark.isActive)

const featuredItems = computed(() => props.items.filter(i => i.featured))
const normalItems   = computed(() => props.items.filter(i => !i.featured))

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
