<template>
  <div class="bp-loading" :class="[`bp-loading--${size}`, { 'bp-loading--dark': $q.dark.isActive }]">
    <div class="bp-loading__mug" role="status" :aria-label="label || 'Carregando'">
      <svg viewBox="0 0 72 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <clipPath :id="clipId">
            <!-- Mug interior (sem o topo — a espuma fica por cima) -->
            <path d="M16 34 L56 34 L56 80 Q56 86 50 86 L22 86 Q16 86 16 80 Z" />
          </clipPath>
        </defs>

        <!-- ── Líquido âmbar ───────────────────────────────────────────── -->
        <rect
          class="bpl-liquid"
          x="16" y="34" width="40" height="52"
          :clip-path="`url(#${clipId})`"
        />

        <!-- ── Bolhas (sobem pelo líquido) ────────────────────────────── -->
        <g :clip-path="`url(#${clipId})`">
          <circle class="bpl-bubble bpl-bubble--1" cx="26" cy="72" r="2.6" />
          <circle class="bpl-bubble bpl-bubble--2" cx="36" cy="76" r="1.9" />
          <circle class="bpl-bubble bpl-bubble--3" cx="46" cy="68" r="1.5" />
          <circle class="bpl-bubble bpl-bubble--4" cx="30" cy="80" r="1.3" />
          <circle class="bpl-bubble bpl-bubble--5" cx="43" cy="74" r="2.1" />
        </g>

        <!-- ── Espuma (5 cúpulas, sobrepõe a borda do copo) ──────────── -->
        <path
          class="bpl-foam"
          d="M16 34
             Q19 24 23 32
             Q26 14 31 30
             Q34 12 38 28
             Q42 16 46 31
             Q50 22 56 30
             L56 34 L16 34 Z"
        />
        <!-- Brilho sutil no topo da espuma -->
        <path
          class="bpl-foam-shine"
          d="M18 33
             Q21 26 24 32
             Q28 20 32 32
             Q36 18 40 31
             Q44 24 48 32
             Q51 26 55 31"
          fill="none" stroke-width="1.2" stroke-linecap="round"
        />

        <!-- ── Outline do copo ─────────────────────────────────────────── -->
        <path
          class="bpl-stroke"
          d="M16 34 L56 34 L56 80 Q56 86 50 86 L22 86 Q16 86 16 80 Z"
          fill="none" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"
        />

        <!-- ── Asa ─────────────────────────────────────────────────────── -->
        <path
          class="bpl-stroke"
          d="M56 44 Q70 44 70 58 Q70 72 56 72"
          fill="none" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"
        />

        <!-- ── Borda superior (aro do copo) ───────────────────────────── -->
        <line
          class="bpl-stroke"
          x1="13" y1="34" x2="59" y2="34"
          stroke-width="3" stroke-linecap="round"
        />
      </svg>
    </div>

    <span v-if="label !== false" class="bp-loading__label">
      {{ label || 'Carregando...' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'

const props = withDefaults(defineProps<{
  /** Texto abaixo da animação. Passe `false` para ocultar. */
  label?: string | false
  /** Tamanho do ícone animado */
  size?: 'sm' | 'md' | 'lg'
}>(), {
  label: 'Carregando...',
  size: 'md'
})

const $q = useQuasar()

const uid = `bpl-${Math.random().toString(36).slice(2, 7)}`
const clipId = `${uid}-clip`
</script>

<style scoped lang="scss">
// ── Wrapper ───────────────────────────────────────────────────────────────
.bp-loading {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  // ── CSS vars — Light (default) ─────────────────────────────────────────
  --bpl-liquid:      #c87c1a;
  --bpl-liquid-alt:  #b06810;
  --bpl-foam:        #f2e8d0;
  --bpl-foam-shine:  rgba(255, 255, 255, 0.55);
  --bpl-bubble:      rgba(240, 200, 80, 0.55);
  --bpl-stroke:      var(--bp-text-secondary, #705C3A);

  // ── Dark mode ─────────────────────────────────────────────────────────
  &--dark {
    --bpl-liquid:      #9e5a0c;
    --bpl-liquid-alt:  #7a4308;
    --bpl-foam:        #d4bf90;
    --bpl-foam-shine:  rgba(255, 255, 255, 0.2);
    --bpl-bubble:      rgba(190, 140, 40, 0.5);
    --bpl-stroke:      var(--bp-text-secondary, rgba(255,255,255,0.55));
  }

  // ── Tamanhos ──────────────────────────────────────────────────────────
  &--sm &__mug { width: 40px; }
  &--md &__mug { width: 58px; }
  &--lg &__mug { width: 84px; }

  &__mug {
    svg { display: block; width: 100%; height: auto; }
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.03em;
    color: var(--bp-text-secondary);
    user-select: none;
  }
}

// ── SVG — cores via CSS vars ──────────────────────────────────────────────
.bpl-liquid      { fill: var(--bpl-liquid); }
.bpl-foam        { fill: var(--bpl-foam); animation: bpl-foam-wobble 3.6s ease-in-out infinite; }
.bpl-foam-shine  { stroke: var(--bpl-foam-shine); }
.bpl-stroke      { stroke: var(--bpl-stroke); }

.bpl-bubble {
  fill: var(--bpl-bubble);
  animation: bpl-bubble-rise linear infinite;

  &--1 { animation-duration: 2.1s; animation-delay:  0.0s; }
  &--2 { animation-duration: 2.5s; animation-delay: -0.8s; }
  &--3 { animation-duration: 1.9s; animation-delay: -1.5s; }
  &--4 { animation-duration: 2.7s; animation-delay: -0.4s; }
  &--5 { animation-duration: 2.3s; animation-delay: -1.1s; }
}

// ── Keyframes ─────────────────────────────────────────────────────────────
@keyframes bpl-bubble-rise {
  0%   { transform: translateY(0);     opacity: 0;   }
  10%  { opacity: 0.7; }
  80%  { opacity: 0.4; }
  100% { transform: translateY(-52px); opacity: 0;   }
}

@keyframes bpl-foam-wobble {
  0%, 100% { transform: scaleX(1);     transform-origin: center center; }
  35%       { transform: scaleX(1.012); }
  65%       { transform: scaleX(0.991); }
}
</style>
