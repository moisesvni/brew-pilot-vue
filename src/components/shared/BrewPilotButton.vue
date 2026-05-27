<template>
  <q-btn
    v-bind="filteredAttrs"
    :outline="variant === 'outline'"
    :flat="variant === 'flat'"
    :class="[btnClass, $attrs.class]"
  >
    <!-- Tooltip conveniente via prop -->
    <q-tooltip v-if="tooltip" anchor="bottom middle" self="top middle" class="bp-tooltip">
      {{ tooltip }}
    </q-tooltip>
    <slot />
  </q-btn>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /**
   * outline → sem fundo, borda + ícone em CSS vars do tema
   * filled  → com fundo (cor via prop `color`, ex: color="primary")
   * flat    → sem fundo nem borda, só ícone/label
   */
  variant?: 'outline' | 'filled' | 'flat'
  /** Texto do tooltip — usa <q-tooltip> internamente */
  tooltip?: string
  /**
   * Quando true, o botão outline usa a cor primária (âmbar) em vez do
   * terracota-neutro padrão. Ideal para botões de ação principal (ADICIONAR).
   */
  primary?: boolean
}>(), {
  variant: 'outline',
  primary: false,
})

const attrs = useAttrs()

const filteredAttrs = computed(() => {
  if (props.variant === 'filled') return attrs
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { color, class: _c, ...rest } = attrs as Record<string, unknown>
  return rest
})

const btnClass = computed(() => {
  if (props.variant === 'outline')
    return props.primary ? 'bp-btn bp-btn--outline bp-btn--primary' : 'bp-btn bp-btn--outline'
  if (props.variant === 'flat') return 'bp-btn bp-btn--flat'
  return 'bp-btn bp-btn--filled'
})
</script>
