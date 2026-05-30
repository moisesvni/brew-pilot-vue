<template>
  <q-btn class="upgrade-btn" v-bind="$attrs" @click="goToPlans">
    <span class="upgrade-btn__shimmer" aria-hidden="true" />
    <q-icon name="mdi-crown" class="upgrade-btn__icon" size="22px" />
    <span class="upgrade-btn__label q-ml-xs">Assinar</span>
  </q-btn>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineOptions({ inheritAttrs: false })

const router = useRouter()

function goToPlans() {
  router.push({ name: 'Settings' })
}
</script>

<style scoped>
.upgrade-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 34px;
  border: none;
  border-radius: 99px;
  cursor: pointer;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  outline: none;
  user-select: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  /* Gradiente âmbar/dourado — premium */
  background: linear-gradient(115deg, #d97706 0%, #f59e0b 45%, #fbbf24 100%);
  color: #fff;
  box-shadow:
    0 2px 8px rgba(217, 119, 6, 0.45),
    0 1px 2px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.upgrade-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 4px 14px rgba(217, 119, 6, 0.55),
    0 2px 4px rgba(0, 0, 0, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  filter: brightness(1.06);
}

.upgrade-btn:active {
  transform: translateY(0);
  filter: brightness(0.96);
  box-shadow:
    0 1px 4px rgba(217, 119, 6, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* ── Shimmer animado ─────────────────────────────────── */
.upgrade-btn__shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgba(255, 255, 255, 0.28) 50%,
    transparent 65%
  );
  background-size: 200% 100%;
  animation: shimmer 2.8s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}

/* ── Ícone coroa ─────────────────────────────────────── */
.upgrade-btn__icon {
  position: relative;
  z-index: 1;
  opacity: 0.95;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.18));
}

.upgrade-btn__label {
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
}

/* ── Dark mode: mesma lógica, leve ajuste de sombra ─── */
.body--dark .upgrade-btn {
  box-shadow:
    0 2px 10px rgba(245, 158, 11, 0.35),
    0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.body--dark .upgrade-btn:hover {
  box-shadow:
    0 4px 18px rgba(245, 158, 11, 0.45),
    0 2px 4px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
</style>
